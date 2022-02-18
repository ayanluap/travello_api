import nodemailer from 'nodemailer';

export const sendEmail = (options) => {
  // Create transporter
  const transport = nodemailer.createTransport({
    service: 'Gmail',
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // Defining email options
  const mailOptions = {
    from: 'Ayanabha Paul <no-reply@travello_pro.com>',
    to: options.email,
    subject: options.subject,
    text: options.text,
  };

  // send email
  transport.sendMail(mailOptions);
};
