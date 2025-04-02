const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const sendEmail = async (recipientEmail, verificationCode) => {
  try {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Verification Code</title>
        <style>
          .container { max-width: 600px; margin: 0 auto; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
          .header { background-color: #4f46e5; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background-color: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
          .code { font-size: 24px; font-weight: bold; padding: 10px; background-color: #e5e7eb; border-radius: 4px; letter-spacing: 4px; text-align: center; margin: 20px 0; }
          .footer { margin-top: 20px; font-size: 12px; color: #6b7280; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Your Verification Code</h1>
          </div>
          <div class="content">
            <p>Your verification code is:</p>
            <div class="code">${verificationCode}</div>
            <p>This code will expire in 10 minutes.</p>
            <p>If you did not request this code, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>This is an automated message from the Vulnerable 2FA Lab.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: recipientEmail,
      subject: 'Your Verification Code',
      html: htmlContent,
    };

    const emailInfo = await transporter.sendMail(mailOptions);
    /* console.log(
      `Email successfully sent to ${recipientEmail}, verification code: ${verificationCode}`
    ); */
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
};

module.exports = {
  sendEmail,
};
