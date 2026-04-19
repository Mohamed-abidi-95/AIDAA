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
    const { professionalId, name, email } = req.body;
    const inviter = req.user;

    let profId, profName, profEmail;

    if (professionalId) {
      // Nouveau flux : sélection d'un professionnel existant par ID
      const rows = await query('SELECT id, name, email, role, is_active FROM users WHERE id = ?', [professionalId]);
      if (rows.length === 0) return res.status(404).json({ success: false, message: 'Professionnel introuvable.' });
      const prof = rows[0];
      if (prof.role !== 'professional') return res.status(400).json({ success: false, message: 'Cet utilisateur n\'est pas un professionnel.' });
      profId    = prof.id;
      profName  = prof.name;
      profEmail = prof.email;
    } else {
      // Ancien flux (email/nom) — maintenu pour compatibilité
      if (!name?.trim())  return res.status(400).json({ success: false, message: 'Le nom est requis.' });
      if (!email?.trim()) return res.status(400).json({ success: false, message: 'L\'email est requis.' });
      if (!EMAIL_REGEX.test(email.trim())) return res.status(400).json({ success: false, message: 'Format d\'email invalide.' });

      let professional = await userModel.findByEmail(email.toLowerCase());
      if (professional) {
        if (professional.role !== 'professional') return res.status(409).json({ success: false, message: 'Cet email appartient à un compte non-professionnel.' });
        profId    = professional.id;
        profName  = professional.name;
        profEmail = email.toLowerCase();
      } else {
        profId    = await userModel.createUser(name.trim(), email.toLowerCase(), 'professional');
        profName  = name.trim();
        profEmail = email.toLowerCase();
      }
    }

    // Vérifier si une invitation existe déjà
    const existingRows = await query(
      'SELECT * FROM professional_invitations WHERE parent_id = ? AND professional_id = ?',
      [inviter.id, profId]
    );

    const profRecord = await query('SELECT password, is_active FROM users WHERE id = ?', [profId]);
    const alreadyActive = profRecord.length > 0 && profRecord[0].password && profRecord[0].is_active;
    // Toujours 'pending' : le professionnel doit accepter explicitement
    const initialStatus = 'pending';

    if (existingRows.length > 0) {
      const existing = existingRows[0];
      if (existing.status === 'revoked') {
        await query(
          'UPDATE professional_invitations SET status = ? WHERE parent_id = ? AND professional_id = ?',
          [initialStatus, inviter.id, profId]
        );
      } else {
        return res.status(409).json({ success: false, message: 'Ce professionnel est déjà lié à votre compte.' });
      }
    } else {
      await query(
        'INSERT INTO professional_invitations (parent_id, professional_id, status) VALUES (?, ?, ?)',
        [inviter.id, profId, initialStatus]
      );
    }

    // Envoyer un email uniquement si le professionnel n'a pas encore de mot de passe
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const inviteLink  = `${frontendUrl}/set-password?userId=${profId}`;
    let previewUrl = null;
    let emailSent  = false;
    let emailError = null;

    if (!alreadyActive) {
      try {
        const mail = await sendInviteEmail(profEmail, profName, inviter.name, inviteLink);
        previewUrl = mail.previewUrl;
        emailSent  = true;
      } catch (mailErr) {
        emailError = mailErr.message;
        console.error('[parent.controller] Email error:', mailErr.message);
      }
    }

    console.log(`[parent.controller] ✅ Liaison créée avec ${profName} (${profEmail})`);

    return res.status(201).json({
      success: true,
      message: alreadyActive
        ? `${profName} a été ajouté à vos professionnels.`
        : emailSent ? `Invitation envoyée à ${profName}` : `Liaison créée avec ${profName}`,
      data: { id: profId, name: profName, email: profEmail, role: 'professional', inviteLink, previewUrl, emailSent, emailError, status: initialStatus },
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
    let emailSent  = false;

    try {
      const mail = await sendInviteEmail(prof.email, prof.name, req.user.name, inviteLink);
      previewUrl = mail.previewUrl;
      emailSent  = true;
    } catch (mailErr) {
      console.error('[parent.controller] Resend email error:', mailErr.message);
    }

    console.log(`[parent.controller] 🔗 Lien renvoyé : ${inviteLink}`);
    if (previewUrl) console.log(`[parent.controller] 📧 Aperçu Ethereal : ${previewUrl}`);

    return res.status(200).json({
      success: true,
      message: prof.invite_status === 'revoked' ? 'Accès réactivé et invitation renvoyée.' : 'Invitation renvoyée avec succès.',
      data: { inviteLink, previewUrl, emailSent },
    });
  } catch (error) {
    console.error('[parent.controller] resendInvitation:', error);
    return res.status(500).json({ success: false, message: 'Erreur lors du renvoi.' });
  }
};

// ============================================================================
// GET /api/parent/available-professionals
// Liste tous les professionnels actifs NON encore liés à ce parent
// ============================================================================
const getAvailableProfessionals = async (req, res) => {
  try {
    const rows = await query(
      `SELECT u.id, u.name, u.email
       FROM   users u
       WHERE  u.role = 'professional'
         AND  u.is_active = 1
         AND  u.password IS NOT NULL
         AND  u.id NOT IN (
           SELECT professional_id FROM professional_invitations
           WHERE  parent_id = ? AND status != 'revoked'
         )
       ORDER BY u.name ASC`,
      [req.user.id]
    );
    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error('[parent.controller] getAvailableProfessionals:', error);
    return res.status(500).json({ success: false, message: 'Erreur lors de la récupération des professionnels.' });
  }
};

// ============================================================================
// DELETE PERMANENT /api/parent/invitation/:professionalId/delete
// Supprime définitivement la ligne de professional_invitations
// ============================================================================
const deleteInvitation = async (req, res) => {
  try {
    const { professionalId } = req.params;
    const rows = await query(
      'SELECT * FROM professional_invitations WHERE parent_id = ? AND professional_id = ?',
      [req.user.id, professionalId]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Invitation introuvable.' });

    await query(
      'DELETE FROM professional_invitations WHERE parent_id = ? AND professional_id = ?',
      [req.user.id, professionalId]
    );
    return res.status(200).json({ success: true, message: 'Invitation supprimée définitivement.' });
  } catch (error) {
    console.error('[parent.controller] deleteInvitation:', error);
    return res.status(500).json({ success: false, message: 'Erreur lors de la suppression.' });
  }
};

module.exports = { inviteProfessional, getMyProfessionals, getAvailableProfessionals, revokeInvitation, resendInvitation, deleteInvitation };
