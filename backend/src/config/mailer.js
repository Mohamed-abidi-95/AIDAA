// ============================================================================
// MAILER CONFIG — mailer.js
// ============================================================================
// Nodemailer transporter.
// - Si SMTP_USER + SMTP_PASS sont définis → Gmail/SMTP réel
// - Sinon → Ethereal (compte test auto, preview dans la console/réponse)

const nodemailer = require('nodemailer');

// Cache du transporter (évite de recréer un compte Ethereal à chaque appel)
let _transporter = null;
let _isEthereal  = false;

async function getTransporter() {
  if (_transporter) return _transporter;

  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    // Vrai SMTP (Gmail, etc.)
    _isEthereal = false;
    _transporter = nodemailer.createTransport({
      host:   process.env.SMTP_HOST   || 'smtp.gmail.com',
      port:   Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Mode démo : compte Ethereal généré automatiquement
    _isEthereal = true;
    const testAccount = await nodemailer.createTestAccount();
    _transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log('[Mailer] Mode Ethereal activé — emails capturés (pas envoyés)');
    console.log('[Mailer] Compte Ethereal:', testAccount.user);
  }

  return _transporter;
}

/**
 * Send a password-reset email.
 * @param {string} to      - recipient email
 * @param {string} name    - recipient name
 * @param {string} link    - full reset URL including token
 * @returns {Promise<{previewUrl: string|null}>}
 */
const sendResetEmail = async (to, name, link) => {
  const transporter = await getTransporter();

  const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8"/>
      <meta name="viewport" content="width=device-width,initial-scale=1"/>
      <title>Réinitialisation du mot de passe – AIDAA</title>
    </head>
    <body style="margin:0;padding:0;background:#f4faf7;font-family:'Segoe UI',Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4faf7;padding:40px 0;">
        <tr><td align="center">
          <table width="560" cellpadding="0" cellspacing="0"
                 style="background:#ffffff;border-radius:16px;overflow:hidden;
                        box-shadow:0 4px 24px rgba(0,87,42,.10);">

            <!-- Header vert -->
            <tr>
              <td style="background:linear-gradient(135deg,#007A3A,#00A651);
                         padding:32px 40px;text-align:center;">
                <h1 style="margin:0;color:#fff;font-size:28px;font-weight:800;
                           letter-spacing:-0.5px;">✚ AIDAA</h1>
                <p style="margin:6px 0 0;color:rgba(255,255,255,.85);font-size:13px;">
                  Plateforme de suivi pour enfants autistes
                </p>
              </td>
            </tr>

            <!-- Corps -->
            <tr>
              <td style="padding:36px 40px;">
                <p style="margin:0 0 8px;font-size:18px;font-weight:700;color:#0f2318;">
                  Bonjour ${name} 👋
                </p>
                <p style="margin:0 0 24px;font-size:14px;color:#7a9485;line-height:1.6;">
                  Vous avez demandé la réinitialisation de votre mot de passe AIDAA.<br/>
                  Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe.
                </p>

                <!-- Bouton -->
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr><td align="center" style="padding:8px 0 28px;">
                    <a href="${link}"
                       style="display:inline-block;
                              background:linear-gradient(90deg,#007A3A,#00A651);
                              color:#fff;text-decoration:none;
                              font-size:15px;font-weight:700;
                              padding:14px 32px;border-radius:10px;
                              box-shadow:0 4px 14px rgba(0,166,81,.35);">
                      Réinitialiser mon mot de passe →
                    </a>
                  </td></tr>
                </table>

                <!-- Avertissement expiration -->
                <div style="background:#fff8e1;border:1px solid #ffe082;
                            border-radius:10px;padding:14px 18px;
                            font-size:13px;color:#7a4f00;line-height:1.55;">
                  ⏰ <strong>Ce lien expire dans 1 heure.</strong><br/>
                  Si vous n'avez pas fait cette demande, ignorez simplement cet e-mail.
                </div>

                <!-- Lien texte de secours -->
                <p style="margin:24px 0 0;font-size:12px;color:#b0c4ba;word-break:break-all;">
                  Lien de secours :<br/>
                  <a href="${link}" style="color:#007A3A;">${link}</a>
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background:#f4faf7;padding:20px 40px;
                         text-align:center;border-top:1px solid #e6f0ea;">
                <p style="margin:0;font-size:11px;color:#a0b8aa;">
                  © 2026 AIDAA — Application PFE · Ne pas répondre à cet e-mail.
                </p>
              </td>
            </tr>
          </table>
        </td></tr>
      </table>
    </body>
    </html>
  `;

  const info = await transporter.sendMail({
    from:    process.env.EMAIL_FROM || 'AIDAA <noreply@aidaa.com>',
    to,
    subject: '🔑 Réinitialisation de votre mot de passe AIDAA',
    html,
  });

  // En mode Ethereal, générer l'URL de prévisualisation
  const previewUrl = _isEthereal ? nodemailer.getTestMessageUrl(info) : null;

  if (previewUrl) {
    console.log('[Mailer] 📧 Prévisualisation email:', previewUrl);
  }

  return { previewUrl };
};

/**
 * Send a professional invitation email.
 * @param {string} to        - professional email
 * @param {string} name      - professional name
 * @param {string} inviterName - parent who sent the invite
 * @param {string} link      - full set-password URL
 * @returns {Promise<{previewUrl: string|null}>}
 */
const sendInviteEmail = async (to, name, inviterName, link) => {
  const transporter = await getTransporter();

  const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8"/>
      <meta name="viewport" content="width=device-width,initial-scale=1"/>
      <title>Invitation Professionnel – AIDAA</title>
    </head>
    <body style="margin:0;padding:0;background:#f4faf7;font-family:'Segoe UI',Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4faf7;padding:40px 0;">
        <tr><td align="center">
          <table width="560" cellpadding="0" cellspacing="0"
                 style="background:#ffffff;border-radius:16px;overflow:hidden;
                        box-shadow:0 4px 24px rgba(0,87,42,.10);">
            <!-- Header -->
            <tr>
              <td style="background:linear-gradient(135deg,#007A3A,#00A651);
                         padding:32px 40px;text-align:center;">
                <h1 style="margin:0;color:#fff;font-size:28px;font-weight:800;
                           letter-spacing:-0.5px;">🩺 AIDAA</h1>
                <p style="margin:6px 0 0;color:rgba(255,255,255,.85);font-size:13px;">
                  Invitation à rejoindre l'équipe de suivi
                </p>
              </td>
            </tr>
            <!-- Corps -->
            <tr>
              <td style="padding:36px 40px;">
                <p style="margin:0 0 8px;font-size:18px;font-weight:700;color:#0f2318;">
                  Bonjour ${name} 👋
                </p>
                <p style="margin:0 0 24px;font-size:14px;color:#7a9485;line-height:1.6;">
                  <strong>${inviterName}</strong> vous invite à rejoindre la plateforme <strong>AIDAA</strong>
                  en tant que professionnel de santé afin de suivre l'évolution de ses enfants.<br/><br/>
                  Cliquez sur le bouton ci-dessous pour créer votre mot de passe et accéder à votre espace.
                </p>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr><td align="center" style="padding:8px 0 28px;">
                    <a href="${link}"
                       style="display:inline-block;
                              background:linear-gradient(90deg,#007A3A,#00A651);
                              color:#fff;text-decoration:none;
                              font-size:15px;font-weight:700;
                              padding:14px 32px;border-radius:10px;
                              box-shadow:0 4px 14px rgba(0,166,81,.35);">
                      Créer mon mot de passe →
                    </a>
                  </td></tr>
                </table>
                <div style="background:#e6f7ee;border:1px solid #c2ead4;
                            border-radius:10px;padding:14px 18px;
                            font-size:13px;color:#007A3A;line-height:1.55;">
                  🔒 Ce lien est à usage unique. Gardez-le confidentiel.
                </div>
                <p style="margin:24px 0 0;font-size:12px;color:#b0c4ba;word-break:break-all;">
                  Lien de secours :<br/>
                  <a href="${link}" style="color:#007A3A;">${link}</a>
                </p>
              </td>
            </tr>
            <!-- Footer -->
            <tr>
              <td style="background:#f4faf7;padding:20px 40px;
                         text-align:center;border-top:1px solid #e6f0ea;">
                <p style="margin:0;font-size:11px;color:#a0b8aa;">
                  © 2026 AIDAA — Application PFE · Ne pas répondre à cet e-mail.
                </p>
              </td>
            </tr>
          </table>
        </td></tr>
      </table>
    </body>
    </html>
  `;

  const info = await transporter.sendMail({
    from:    process.env.EMAIL_FROM || 'AIDAA <noreply@aidaa.com>',
    to,
    subject: '🩺 Invitation à rejoindre AIDAA en tant que professionnel',
    html,
  });

  const previewUrl = _isEthereal ? nodemailer.getTestMessageUrl(info) : null;
  if (previewUrl) console.log('[Mailer] 📧 Invitation email preview:', previewUrl);
  return { previewUrl };
};

module.exports = { sendResetEmail, sendInviteEmail };
