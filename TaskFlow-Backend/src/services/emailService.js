const nodemailer = require('nodemailer');

const gmailUser = process.env.GMAIL_USER;
const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

const transport =
  gmailUser && gmailAppPassword
    ? nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: gmailUser,
          pass: gmailAppPassword,
        },
      })
    : nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'localhost',
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth:
          process.env.SMTP_USER && process.env.SMTP_PASS
            ? {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
              }
            : undefined,
      });

async function sendMail({ to, subject, text, html }) {
  const from =
    process.env.MAIL_FROM ||
    (gmailUser ? `TaskFlow <${gmailUser}>` : 'TaskFlow <noreply@taskflow.local>');

  try {
    const info = await transport.sendMail({
      from,
      to,
      subject: subject || 'TaskFlow',
      text: text || '',
      html: html || text || '',
    });

    return info;
  } catch (err) {
    console.error('Error sending email:', {
      to,
      subject,
      error: err,
    });
    throw new Error('Failed to send email');
  }
}

module.exports = { sendMail };
