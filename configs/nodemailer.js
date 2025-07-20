const nodemailer = require("nodemailer");
const config = require('./../utils/config');

const sendOtpEmail = (email, otpCode) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: config.nodemailer.username,
      pass: config.nodemailer.password,
    },
  });

  const mailOption = {
    from: config.nodemailer.username,
    to: email,
    subject: "Reset Your Password",
    html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2>Hello,</h2>
          <p>We received a request to reset the password for your account. If you made this request, please click the button below to reset your password:</p>
          <p>
            <sapn" 
               style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px;">
               ${otpCode}
            </sapn>
          </p>
          <p>If you did not request a password reset, you can safely ignore this email. Your account will remain secure.</p>
          <p>Best regards,<br/>The Support Team</p>
        </div>
      `,
  };

  return transporter.sendMail(mailOption);
};

module.exports = sendOtpEmail;
