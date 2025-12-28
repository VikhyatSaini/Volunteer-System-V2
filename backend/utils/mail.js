const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1. Create Transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // 2. Define Email Options
  const message = {
    from: `"RallyPoint Support" <${process.env.SMTP_USER}>`, // Sender address
    to: options.to, // Receiver address
    subject: options.subject, // Subject line
    text: options.text, // Plain text body
    html: options.html, // HTML body (optional)
  };

  // 3. Send Email
  try {
    const info = await transporter.sendMail(message);
    console.log(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Email could not be sent");
  }
};

module.exports = { sendEmail };