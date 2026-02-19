import nodemailer from 'nodemailer';

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  /**
   * Send email verification link to new user
   */
  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Vérifiez votre adresse email - JUNY</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
          <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f3f4f6;">
            <tr>
              <td style="padding: 40px 20px;">
                <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="padding: 40px 40px 20px; text-align: center;">
                      <div style="display: inline-block; width: 64px; height: 64px; background: linear-gradient(135deg, #9333ea 0%, #4f46e5 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                        <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#ffffff" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <h1 style="margin: 0; font-size: 28px; font-weight: bold; color: #111827;">Bienvenue sur JUNY !</h1>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding: 0 40px 40px;">
                      <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #4b5563;">
                        Merci de vous être inscrit sur JUNY ! Pour commencer à utiliser votre compte, veuillez vérifier votre adresse email en cliquant sur le bouton ci-dessous.
                      </p>

                      <!-- CTA Button -->
                      <table role="presentation" style="width: 100%; margin: 32px 0;">
                        <tr>
                          <td style="text-align: center;">
                            <a href="${verificationUrl}" style="display: inline-block; padding: 16px 32px; background-color: #9333ea; color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px;">
                              Vérifier mon email
                            </a>
                          </td>
                        </tr>
                      </table>

                      <p style="margin: 20px 0 0; font-size: 14px; line-height: 1.6; color: #6b7280;">
                        Ce lien est valide pendant <strong>24 heures</strong>. Si vous n'avez pas créé de compte sur JUNY, vous pouvez ignorer cet email.
                      </p>

                      <!-- Alternative link -->
                      <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
                        <p style="margin: 0 0 8px; font-size: 13px; color: #6b7280;">
                          Le bouton ne fonctionne pas ? Copiez et collez ce lien dans votre navigateur :
                        </p>
                        <p style="margin: 0; font-size: 13px; color: #9333ea; word-break: break-all;">
                          ${verificationUrl}
                        </p>
                      </div>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding: 24px 40px; background-color: #f9fafb; border-bottom-left-radius: 16px; border-bottom-right-radius: 16px;">
                      <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #6b7280; text-align: center;">
                        © ${new Date().getFullYear()} JUNY. Tous droits réservés.<br>
                        Si vous avez des questions, contactez-nous à <a href="mailto:contact@junyia.fr" style="color: #9333ea; text-decoration: none;">contact@junyia.fr</a>
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    const textContent = `
Bienvenue sur JUNY !

Merci de vous être inscrit sur JUNY ! Pour commencer à utiliser votre compte, veuillez vérifier votre adresse email en cliquant sur le lien ci-dessous :

${verificationUrl}

Ce lien est valide pendant 24 heures. Si vous n'avez pas créé de compte sur JUNY, vous pouvez ignorer cet email.

---
© ${new Date().getFullYear()} JUNY. Tous droits réservés.
Si vous avez des questions, contactez-nous à contact@junyia.fr
    `.trim();

    await this.transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Vérifiez votre adresse email - JUNY',
      text: textContent,
      html: htmlContent,
    });
  }

  /**
   * Send account deletion confirmation email
   */
  async sendAccountDeletionEmail(email: string, name: string): Promise<void> {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Votre compte JUNY a été supprimé</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
          <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f3f4f6;">
            <tr>
              <td style="padding: 40px 20px;">
                <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="padding: 40px 40px 20px; text-align: center;">
                      <div style="display: inline-block; width: 64px; height: 64px; background-color: #ef4444; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                        <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#ffffff" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <h1 style="margin: 0; font-size: 28px; font-weight: bold; color: #111827;">Compte supprimé</h1>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding: 0 40px 40px;">
                      <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #4b5563;">
                        Bonjour ${name},
                      </p>

                      <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #4b5563;">
                        Votre compte JUNY a été supprimé avec succès. Toutes vos données personnelles ont été effacées de nos serveurs.
                      </p>

                      <div style="margin: 32px 0; padding: 20px; background-color: #fef2f2; border-left: 4px solid #ef4444; border-radius: 8px;">
                        <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #991b1b;">
                          <strong>Attention :</strong> Cette action est irréversible. Si vous souhaitez utiliser JUNY à nouveau, vous devrez créer un nouveau compte.
                        </p>
                      </div>

                      <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #4b5563;">
                        Si vous n'êtes pas à l'origine de cette suppression, veuillez nous contacter immédiatement à <a href="mailto:contact@junyia.fr" style="color: #9333ea; text-decoration: none;">contact@junyia.fr</a>.
                      </p>

                      <p style="margin: 20px 0 0; font-size: 16px; line-height: 1.6; color: #4b5563;">
                        Nous espérons vous revoir bientôt sur JUNY !
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding: 24px 40px; background-color: #f9fafb; border-bottom-left-radius: 16px; border-bottom-right-radius: 16px;">
                      <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #6b7280; text-align: center;">
                        © ${new Date().getFullYear()} JUNY. Tous droits réservés.<br>
                        Des questions ? Contactez-nous à <a href="mailto:contact@junyia.fr" style="color: #9333ea; text-decoration: none;">contact@junyia.fr</a>
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    const textContent = `
Compte supprimé

Bonjour ${name},

Votre compte JUNY a été supprimé avec succès. Toutes vos données personnelles ont été effacées de nos serveurs.

ATTENTION : Cette action est irréversible. Si vous souhaitez utiliser JUNY à nouveau, vous devrez créer un nouveau compte.

Si vous n'êtes pas à l'origine de cette suppression, veuillez nous contacter immédiatement à contact@junyia.fr.

Nous espérons vous revoir bientôt sur JUNY !

---
© ${new Date().getFullYear()} JUNY. Tous droits réservés.
Des questions ? Contactez-nous à contact@junyia.fr
    `.trim();

    await this.transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Votre compte JUNY a été supprimé',
      text: textContent,
      html: htmlContent,
    });
  }
}

export const emailService = new EmailService();
