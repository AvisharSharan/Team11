const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const emailPort = Number(process.env.EMAIL_PORT) || 587;

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: emailPort,
    secure: emailPort === 465, // true for 465, false for 587 and other STARTTLS ports
    family: 4, // Render may resolve smtp.gmail.com to IPv6 first, which can be unreachable.
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"SyncSphere" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
