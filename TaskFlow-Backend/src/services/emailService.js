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

function sendMail({ to, subject, text, html }) {
  const from = process.env.MAIL_FROM || (gmailUser ? `TaskFlow <${gmailUser}>` : 'TaskFlow <noreply@taskflow.local>');
  return transport.sendMail({
    from,
    to,
    subject: subject || 'TaskFlow',
    text: text || '',
    html: html || text || '',
  });
}

module.exports = { sendMail };
