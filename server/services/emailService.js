/**
 * Email service placeholder / logger
 * Can be connected to Nodemailer or SendGrid when SMTP credentials are provided.
 */

const sendEmail = async ({ to, subject, text, html }) => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    // If SMTP is configured in environment, it could send via nodemailer
    console.log(`[EmailService] Sending email to: ${to} | Subject: ${subject}`);
  } else {
    console.log(`[EmailService (Simulation)] To: ${to} | Subject: ${subject} | Text: ${text}`);
  }
  return true;
};

module.exports = { sendEmail };

