import mailjet from 'node-mailjet'

// Configuration du client Mailjet
const mailjetClient = mailjet.apiConnect(
  process.env.MAILJET_API_KEY || '',
  process.env.MAILJET_API_SECRET || '',
)

export async function sendResetPasswordEmail(email: string, resetToken: string) {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`

  const request = mailjetClient.post('send', { version: 'v3.1' }).request({
    Messages: [
      {
        From: {
          Email: process.env.MAILJET_FROM_EMAIL,
          Name: process.env.MAILJET_FROM_NAME,
        },
        To: [
          {
            Email: email,
          },
        ],
        Subject: 'Réinitialisation de votre mot de passe - Saint-Pierre',
        HTMLPart: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8">
              <style>
                body { font-family: Arial, sans-serif; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #1a5f7a; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
                .content { padding: 20px; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 0 0 5px 5px; }
                .button { display: inline-block; padding: 10px 20px; background-color: #1a5f7a; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .footer { margin-top: 20px; font-size: 12px; color: #666; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Réinitialisation de mot de passe</h1>
                </div>
                <div class="content">
                  <p>Bonjour,</p>
                  <p>Vous avez demandé une réinitialisation de mot de passe pour votre compte Saint-Pierre.</p>
                  <p>Cliquez sur le bouton ci-dessous pour réinitialiser votre mot de passe. Ce lien expire dans 1 heure.</p>
                  <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #0d3d52; color: #ffffff; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold;">Réinitialiser mon mot de passe</a>
                  <p>Ou copiez ce lien dans votre navigateur:</p>
                  <p>${resetUrl}</p>
                  <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
                  <div class="footer">
                    <p>© 2026 Saint-Pierre. Tous droits réservés.</p>
                  </div>
                </div>
              </div>
            </body>
          </html>
        `,
      },
    ],
  })

  try {
    await request
    console.log(`Reset password email sent to ${email}`)
    return true
  } catch (error) {
    console.error('Error sending reset password email:', error)
    return false
  }
}

export async function sendWelcomeEmail(email: string, nom: string, prenom: string) {
  const request = mailjetClient.post('send', { version: 'v3.1' }).request({
    Messages: [
      {
        From: {
          Email: process.env.MAILJET_FROM_EMAIL,
          Name: process.env.MAILJET_FROM_NAME,
        },
        To: [
          {
            Email: email,
          },
        ],
        Subject: 'Bienvenue sur Saint-Pierre!',
        HTMLPart: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8">
              <style>
                body { font-family: Arial, sans-serif; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #1a5f7a; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
                .content { padding: 20px; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 0 0 5px 5px; }
                .footer { margin-top: 20px; font-size: 12px; color: #666; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Bienvenue sur Saint-Pierre!</h1>
                </div>
                <div class="content">
                  <p>Bonjour ${prenom} ${nom},</p>
                  <p>Votre compte a été créé avec succès. Vous pouvez maintenant accéder à la plateforme Saint-Pierre.</p>
                  <p>Si vous avez des questions, n'hésitez pas à contacter l'administration.</p>
                  <div class="footer">
                    <p>© 2026 Saint-Pierre. Tous droits réservés.</p>
                  </div>
                </div>
              </div>
            </body>
          </html>
        `,
      },
    ],
  })

  try {
    await request
    console.log(`Welcome email sent to ${email}`)
    return true
  } catch (error) {
    console.error('Error sending welcome email:', error)
    return false
  }
}
