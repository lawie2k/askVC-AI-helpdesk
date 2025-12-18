const nodemailer = require("nodemailer");
const sgMail = require('@sendgrid/mail');

// Create reusable transporter
let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  // Option 1: Gmail SMTP (Recommended - Free)
  if (process.env.EMAIL_SERVICE === "gmail" || !process.env.EMAIL_SERVICE) {
    transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD, // Use App Password, not regular password
      },
      connectionTimeout: 10000, // 10 seconds
      greetingTimeout: 10000,
      socketTimeout: 10000,
      tls: {
        rejectUnauthorized: false, // Allow self-signed certificates if needed
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

  // Option 3: SendGrid (Recommended for Render/Cloud hosting)
  if (process.env.EMAIL_SERVICE === "sendgrid") {
    transporter = nodemailer.createTransport({
      host: "smtp.sendgrid.net",
      port: 587,
      secure: false,
      auth: {
        user: "apikey",
        pass: process.env.SENDGRID_API_KEY,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
    });
    return transporter;
  }

  // Option 4: Mailgun
  if (process.env.EMAIL_SERVICE === "mailgun") {
    transporter = nodemailer.createTransport({
      host: process.env.MAILGUN_SMTP_SERVER || "smtp.mailgun.org",
      port: 587,
      secure: false,
      auth: {
        user: process.env.MAILGUN_SMTP_LOGIN,
        pass: process.env.MAILGUN_SMTP_PASSWORD,
      },
    });
    return transporter;
  }

  throw new Error("Invalid EMAIL_SERVICE configuration");
}

async function sendPasswordResetEmail(to, code) {
  try {
    const emailService = process.env.EMAIL_SERVICE || "gmail";
    
    // Use SendGrid API (better for cloud hosting like Render)
    if (emailService === "sendgrid-api") {
      return await sendViaSendGridAPI(to, code);
    }
    
    // Use SMTP (nodemailer) for other services
    const emailTransporter = getTransporter();
    const fromEmail = process.env.EMAIL_FROM || process.env.GMAIL_USER || process.env.SENDGRID_FROM_EMAIL;

    if (!fromEmail) {
      throw new Error("Missing EMAIL_FROM environment variable");
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
      service: emailService,
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

async function sendViaSendGridAPI(to, code) {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) {
    throw new Error("Missing SENDGRID_API_KEY environment variable");
  }

  sgMail.setApiKey(apiKey);

  const fromEmail = process.env.EMAIL_FROM || process.env.SENDGRID_FROM_EMAIL || "noreply@um-ai-chat.com";
  
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

  console.log("[SendGrid API] Sending password reset email", {
    to,
    from: fromEmail,
  });

  const msg = {
    to,
    from: fromEmail,
    subject,
    text,
    html,
  };

  try {
    const result = await sgMail.send(msg);
    console.log("[SendGrid API] Email sent successfully:", result[0]?.statusCode);
    return result;
  } catch (err) {
    console.error("[SendGrid API] Failed to send email:", err);
    if (err.response) {
      console.error("[SendGrid API] Error details:", err.response.body);
    }
    throw err;
  }
}

async function sendAdminPasswordResetEmail(to, code) {
  try {
    const emailService = process.env.EMAIL_SERVICE || "gmail";

    // Use SendGrid API (better for cloud hosting like Render)
    if (emailService === "sendgrid-api") {
      return await sendViaSendGridAPI(to, code);
    }

    // Use SMTP (nodemailer) for other services
    const emailTransporter = getTransporter();
    const fromEmail = process.env.EMAIL_FROM || process.env.GMAIL_USER || process.env.SENDGRID_FROM_EMAIL;

    if (!fromEmail) {
      throw new Error("Missing EMAIL_FROM environment variable");
    }

    const subject = "UM AI Admin Password Reset Code";
    const text = `Your UM AI Admin password reset code is ${code}. This code will expire in 10 minutes.`;
    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #900C27; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">UM AI Admin</h1>
          <p style="color: white; margin: 5px 0 0 0; font-size: 14px;">Password Reset</p>
        </div>
        <div style="padding: 30px; background-color: #f9f9f9;">
          <p>Hi Admin,</p>
          <p>We received a request to reset your UM AI Admin password.</p>
          <div style="background-color: white; padding: 20px; margin: 20px 0; text-align: center; border: 2px solid #900C27; border-radius: 5px;">
            <p style="margin: 0; font-size: 12px; color: #666;">Your reset code is:</p>
            <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #900C27; margin: 10px 0;">${code}</p>
          </div>
          <p>This code expires in 10 minutes.</p>
          <p>If you didn't request this, please contact system administrator immediately.</p>
          <p style="margin-top: 30px; color: #666; font-size: 12px;">— UM AI System</p>
        </div>
      </div>
    `;

    console.log("[Email] Sending admin password reset email", {
      to,
      from: fromEmail,
      service: emailService,
    });

    const result = await emailTransporter.sendMail({
      from: `UM AI System <${fromEmail}>`,
      to,
      subject,
      text,
      html,
    });

    console.log("[Email] Admin password reset email sent successfully:", result.messageId);
    return result;
  } catch (err) {
    console.error("[Email] Failed to send admin password reset email:", err);
    throw err;
  }
}

module.exports = {
  sendPasswordResetEmail,
  sendAdminPasswordResetEmail,
};
