const nodemailer = require("nodemailer");

const SendEmail = (email, token, username) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Reset Your Password",
    html: `
      <p>Hi ${username},</p>
      <p>Forgot your password? No problem, we've all been there.</p>
      <p>Click the button below to reset your password:</p>
      <a href="${process.env.CLIENT_URI}resetpass/${token}" 
         style="display:inline-block; padding:10px 15px; color:white; background:#007BFF; text-decoration:none; border-radius:5px;">
         Reset Password
      </a>
      <p>This link will expire in 10 minutes.</p>
      <p>If you didn't request a password reset, please ignore this email.</p>
      <p>Best regards,<br>Your Team</p>
    `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
    } else {
      console.log("Email sent:", info.response);
    }
  });
};

module.exports = SendEmail;
