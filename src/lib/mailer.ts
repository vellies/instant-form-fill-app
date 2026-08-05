import nodemailer from "nodemailer";

function getTransport() {
  const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS } = process.env;
  if (!EMAIL_HOST || !EMAIL_PORT || !EMAIL_USER || !EMAIL_PASS) {
    throw new Error(
      "SMTP is not configured. Set EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS (and optionally EMAIL_SECURE, EMAIL_FROM) in apps/web/.env."
    );
  }
  return nodemailer.createTransport({
    host: EMAIL_HOST,
    port: Number(EMAIL_PORT),
    secure: process.env.EMAIL_SECURE === "true",
    auth: { user: EMAIL_USER, pass: EMAIL_PASS },
  });
}

export async function sendVerificationEmail(to: string, verifyUrl: string): Promise<void> {
  const from = process.env.EMAIL_FROM || process.env.EMAIL_USER || "no-reply@example.com";
  const transport = getTransport();

  await transport.sendMail({
    from,
    to,
    subject: "Verify your email — VR Instant Fill",
    text: `Welcome! Verify your email to activate your account:\n\n${verifyUrl}\n\nThis link expires in 24 hours.`,
    html: `<p>Welcome! Verify your email to activate your account.</p><p><a href="${verifyUrl}">${verifyUrl}</a></p><p>This link expires in 24 hours.</p>`,
  });
}
