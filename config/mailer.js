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
        <title>Security Verification Code</title>
        <style>
          body { margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
          .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden; }
          .header { background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 32px 24px; text-align: center; }
          .logo { font-size: 24px; font-weight: bold; color: #ffffff; margin-bottom: 16px; }
          .content { padding: 32px 24px; background-color: #ffffff; }
          .title { color: #1a1a1a; font-size: 24px; font-weight: 600; margin-bottom: 24px; text-align: center; }
          .code-container { background-color: #f8f9fa; border-radius: 8px; padding: 24px; margin: 24px 0; text-align: center; }
          .code { font-size: 32px; font-weight: bold; color: #1a1a1a; letter-spacing: 8px; font-family: monospace; margin: 16px 0; }
          .expiry { color: #6b7280; font-size: 14px; margin-top: 16px; }
          .message { color: #4b5563; line-height: 1.6; margin-bottom: 24px; }
          .warning { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 16px; margin: 24px 0; border-radius: 4px; }
          .footer { background-color: #f8f9fa; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb; }
          .footer-text { color: #6b7280; font-size: 12px; margin: 0; }
          .button { display: inline-block; background-color: #1a1a1a; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; margin-top: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">2FA LAB</div>
          </div>
          <div class="content">
            <h1 class="title">Security Verification Code</h1>
            <p class="message">We received a request to verify your account. To complete this process, please use the verification code below:</p>
            
            <div class="code-container">
              <div class="code">${verificationCode}</div>
              <p class="expiry">This code will expire in 10 minutes</p>
            </div>

            <div class="warning">
              <strong>Important:</strong> If you didn't request this code, please ignore this email and ensure your account password is secure.
            </div>

            <p class="message">For your security, never share this code with anyone. Our team will never ask for your verification code.</p>
          </div>
          <div class="footer">
            <p class="footer-text">This is an automated security message from 2FA LAB. Please do not reply to this email.</p>
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
