const nodemailer = require('nodemailer');

// This function will create a "test" transport for Ethereal
// In a real app, you'd use a real transport (like Gmail, SendGrid, etc.)
const createTestTransport = async () => {
  // Generate test SMTP service account from ethereal.email
  let testAccount = await nodemailer.createTestAccount();

  // Create a reusable transporter object
  let transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: testAccount.user, // generated ethereal user
      pass: testAccount.pass, // generated ethereal password
    },
  });

  console.log('Ethereal mail account ready'.cyan);
  console.log(`User: ${testAccount.user}`.cyan);
  console.log(`Pass: ${testAccount.pass}`.cyan);

  return transporter;
};

// A more generic "send" function
const sendEmail = async (options) => {
  // For now, we always use the test transport.
  // We'll improve this later.
  const transporter = await createTestTransport();

  const message = {
    from: '"Volunteer System" <noreply@volunteer.com>', // sender address
    to: options.to, // list of receivers
    subject: options.subject, // Subject line
    text: options.text, // plain text body
    html: options.html, // html body (optional)
  };

  // send mail with defined transport object
  const info = await transporter.sendMail(message);

  console.log('Message sent: %s', info.messageId);
  // Preview only available when sending through an Ethereal account
  console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

  return info;
};

module.exports = { sendEmail };