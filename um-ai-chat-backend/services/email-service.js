const { Resend } = require("resend");

let resendClient = null;

function getResendClient() {
  if (resendClient) return resendClient;
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("Missing RESEND_API_KEY environment variable");
  }
  resendClient = new Resend(apiKey);
  return resendClient;
}

async function sendPasswordResetEmail(to, code) {
  const resend = getResendClient();
  const from = process.env.RESEND_FROM_EMAIL;
  if (!from) {
    throw new Error("Missing RESEND_FROM_EMAIL environment variable");
  }

  const subject = "UM AI Chat Password Reset Code";
  const text = `Your UM AI Chat password reset code is ${code}. This code will expire in 5 minutes.`;
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
      <p>Hi there,</p>
      <p>We received a request to reset your UM AI Chat password.</p>
      <p style="font-size: 24px; font-weight: bold; letter-spacing: 4px;">${code}</p>
      <p>This code expires in 10 minutes. If you didn't request this, you can ignore this email.</p>
      <p>— UM AI Chat Team</p>
    </div>
  `;

  await resend.emails.send({
    from,
    to,
    subject,
    text,
    html,
  });
}

module.exports = {
  sendPasswordResetEmail,
};


