// ============================================================================
// PARENT CONTROLLER — parent.controller.js
// ============================================================================

const userModel          = require('../models/user.model');
const { query }          = require('../config/db');
const { sendInviteEmail } = require('../config/mailer');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ── Helper : construire le statut calculé ─────────────────────────────────
// 'revoked'  → accès révoqué par le parent
// 'active'   → le professionnel a défini son mot de passe et est actif
// 'pending'  → invitation envoyée, mot de passe pas encore configuré
const computeStatus = (inviteStatus, hasPassword, isActive) => {
  if (inviteStatus === 'revoked') return 'revoked';
  if (hasPassword && isActive)    return 'active';
  return 'pending';
};

// ============================================================================
// POST /api/parent/invite-professional
// Body : { name, email }
// ============================================================================
const inviteProfessional = async (req, res) => {
  try {
    const { name, email } = req.body;
    const inviter = req.user;

    if (!name?.trim())  return res.status(400).json({ success: false, message: 'Le nom est requis.' });
    if (!email?.trim()) return res.status(400).json({ success: false, message: 'L\'email est requis.' });
    if (!EMAIL_REGEX.test(email.trim())) return res.status(400).json({ success: false, message: 'Format d\'email invalide.' });

    // Vérifier si un compte existe déjà avec cet email
    let professional = await userModel.findByEmail(email.toLowerCase());
    let profId;
    let profName;

    if (professional) {
      if (professional.role !== 'professional') {
        return res.status(409).json({ success: false, message: 'Cet email appartient à un compte non-professionnel.' });
      }
      profId   = professional.id;
      profName = professional.name;
    } else {
      // Créer un nouveau compte professionnel (password = NULL)
      profId   = await userModel.createUser(name.trim(), email.toLowerCase(), 'professional');
      profName = name.trim();
    }

    // Vérifier si une invitation existe déjà entre ce parent et ce professionnel
    const existingRows = await query(
      'SELECT * FROM professional_invitations WHERE parent_id = ? AND professional_id = ?',
      [inviter.id, profId]
    );

    if (existingRows.length > 0) {
      const existing = existingRows[0];
      if (existing.status === 'revoked') {
        // Réactiver l'invitation révoquée
        await query(
          'UPDATE professional_invitations SET status = ? WHERE parent_id = ? AND professional_id = ?',
          ['pending', inviter.id, profId]
        );
      } else {
        return res.status(409).json({ success: false, message: 'Ce professionnel a déjà été invité.' });
      }
    } else {
      await query(
        'INSERT INTO professional_invitations (parent_id, professional_id, status) VALUES (?, ?, ?)',
        [inviter.id, profId, 'pending']
      );
    }

    // Envoyer l'email
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const inviteLink  = `${frontendUrl}/set-password?userId=${profId}`;
    let previewUrl = null;

    try {
      const mail = await sendInviteEmail(email.toLowerCase(), profName, inviter.name, inviteLink);
      previewUrl = mail.previewUrl;
    } catch (mailErr) {
      console.error('[parent.controller] Email error:', mailErr.message);
    }

    console.log(`[parent.controller] Invitation : ${email} par ${inviter.email}`);

    return res.status(201).json({
      success: true,
      message: `Invitation envoyée à ${profName}`,
      data: { id: profId, name: profName, email: email.toLowerCase(), role: 'professional', inviteLink, previewUrl },
    });
  } catch (error) {
    console.error('[parent.controller] inviteProfessional:', error);
    return res.status(500).json({ success: false, message: 'Erreur lors de l\'invitation.', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

// ============================================================================
// GET /api/parent/my-professionals
// ============================================================================
const getMyProfessionals = async (req, res) => {
  try {
    const rows = await query(
      `SELECT u.id, u.name, u.email, u.is_active,
              pi.status     AS invite_status,
              pi.invited_at,
              CASE
                WHEN pi.status = 'revoked'                        THEN 'revoked'
                WHEN u.password IS NOT NULL AND u.is_active = 1   THEN 'active'
                ELSE 'pending'
              END AS status
       FROM   professional_invitations pi
       JOIN   users u ON u.id = pi.professional_id
       WHERE  pi.parent_id = ?
       ORDER  BY pi.invited_at DESC`,
      [req.user.id]
    );
    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error('[parent.controller] getMyProfessionals:', error);
    return res.status(500).json({ success: false, message: 'Erreur lors de la récupération.' });
  }
};

// ============================================================================
// DELETE /api/parent/invitation/:professionalId   → Révoquer
// ============================================================================
const revokeInvitation = async (req, res) => {
  try {
    const { professionalId } = req.params;
    const rows = await query(
      'SELECT * FROM professional_invitations WHERE parent_id = ? AND professional_id = ?',
      [req.user.id, professionalId]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Invitation introuvable.' });
    if (rows[0].status === 'revoked') return res.status(400).json({ success: false, message: 'Accès déjà révoqué.' });

    await query(
      'UPDATE professional_invitations SET status = ? WHERE parent_id = ? AND professional_id = ?',
      ['revoked', req.user.id, professionalId]
    );
    return res.status(200).json({ success: true, message: 'Accès révoqué avec succès.' });
  } catch (error) {
    console.error('[parent.controller] revokeInvitation:', error);
    return res.status(500).json({ success: false, message: 'Erreur lors de la révocation.' });
  }
};

// ============================================================================
// POST /api/parent/resend-invitation/:professionalId  → Renvoyer / Réactiver
// ============================================================================
const resendInvitation = async (req, res) => {
  try {
    const { professionalId } = req.params;
    const rows = await query(
      `SELECT pi.status AS invite_status, u.name, u.email, u.password
       FROM   professional_invitations pi
       JOIN   users u ON u.id = pi.professional_id
       WHERE  pi.parent_id = ? AND pi.professional_id = ?`,
      [req.user.id, professionalId]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Invitation introuvable.' });

    const prof = rows[0];

    // Si le professionnel a déjà un mot de passe, inutile de renvoyer
    if (prof.password) {
      return res.status(400).json({ success: false, message: 'Ce professionnel a déjà configuré son compte.' });
    }

    // Réactiver si révoqué
    if (prof.invite_status === 'revoked') {
      await query(
        'UPDATE professional_invitations SET status = ? WHERE parent_id = ? AND professional_id = ?',
        ['pending', req.user.id, professionalId]
      );
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const inviteLink  = `${frontendUrl}/set-password?userId=${professionalId}`;
    let previewUrl = null;

    try {
      const mail = await sendInviteEmail(prof.email, prof.name, req.user.name, inviteLink);
      previewUrl = mail.previewUrl;
    } catch (mailErr) {
      console.error('[parent.controller] Resend email error:', mailErr.message);
    }

    return res.status(200).json({
      success: true,
      message: prof.invite_status === 'revoked' ? 'Accès réactivé et invitation renvoyée.' : 'Invitation renvoyée avec succès.',
      data: { inviteLink, previewUrl },
    });
  } catch (error) {
    console.error('[parent.controller] resendInvitation:', error);
    return res.status(500).json({ success: false, message: 'Erreur lors du renvoi.' });
  }
};

module.exports = { inviteProfessional, getMyProfessionals, revokeInvitation, resendInvitation };
