const nodemailer = require("nodemailer");

// Create reusable transporter
let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  // Option 1: Gmail SMTP (Recommended - Free)
  if (process.env.EMAIL_SERVICE === "gmail" || !process.env.EMAIL_SERVICE) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD, // Use App Password, not regular password
      },
    });
    return transporter;
  }

  // Option 2: Custom SMTP (for other email providers)
  if (process.env.EMAIL_SERVICE === "smtp") {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
    return transporter;
  }

  // Option 3: SendGrid
  if (process.env.EMAIL_SERVICE === "sendgrid") {
    transporter = nodemailer.createTransport({
      service: "SendGrid",
      auth: {
        user: "apikey",
        pass: process.env.SENDGRID_API_KEY,
      },
    });
    return transporter;
  }

  throw new Error("Invalid EMAIL_SERVICE configuration");
}

async function sendPasswordResetEmail(to, code) {
  try {
    const emailTransporter = getTransporter();
    const fromEmail = process.env.EMAIL_FROM || process.env.GMAIL_USER;

    if (!fromEmail) {
      throw new Error("Missing EMAIL_FROM or GMAIL_USER environment variable");
    }

    const subject = "UM AI Chat Password Reset Code";
    const text = `Your UM AI Chat password reset code is ${code}. This code will expire in 10 minutes.`;
    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #900C27; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">UM AI Chat</h1>
        </div>
        <div style="padding: 30px; background-color: #f9f9f9;">
          <p>Hi there,</p>
          <p>We received a request to reset your UM AI Chat password.</p>
          <div style="background-color: white; padding: 20px; margin: 20px 0; text-align: center; border: 2px solid #900C27; border-radius: 5px;">
            <p style="margin: 0; font-size: 12px; color: #666;">Your reset code is:</p>
            <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #900C27; margin: 10px 0;">${code}</p>
          </div>
          <p>This code expires in 10 minutes.</p>
          <p>If you didn't request this, you can safely ignore this email.</p>
          <p style="margin-top: 30px; color: #666; font-size: 12px;">— UM AI Chat Team</p>
        </div>
      </div>
    `;

    console.log("[Email] Sending password reset email", {
      to,
      from: fromEmail,
      service: process.env.EMAIL_SERVICE || "gmail",
    });

    const result = await emailTransporter.sendMail({
      from: `UM AI Chat <${fromEmail}>`,
      to,
      subject,
      text,
      html,
    });

    console.log("[Email] Email sent successfully:", result.messageId);
    return result;
  } catch (err) {
    console.error("[Email] Failed to send password reset email:", err);
    throw err;
  }
}

module.exports = {
  sendPasswordResetEmail,
};
