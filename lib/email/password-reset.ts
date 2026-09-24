import { getResendClient, EMAIL_FROM } from "@/lib/email/client";

export async function sendPasswordResetEmail(email: string, resetLink: string) {
  const resend = getResendClient();
  if (!resend) {
    console.log(`[email] RESEND_API_KEY not set — password reset link for ${email}: ${resetLink}`);
    return;
  }

  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;background:#f8f9fa;padding:24px;">
    <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
      <div style="background:#1a1a1a;padding:20px 24px;">
        <span style="display:inline-block;background:#d99000;color:#1a1a1a;font-weight:800;font-size:14px;padding:6px 10px;border-radius:6px;">ESell Namibia</span>
      </div>
      <div style="padding:24px;">
        <h1 style="margin:0 0 8px;font-size:18px;color:#1a1a1a;">Reset your password</h1>
        <p style="margin:0 0 20px;font-size:13px;color:#666666;">
          We received a request to reset your ESell Namibia password. This link expires in 1 hour.
        </p>
        <a href="${resetLink}" style="display:inline-block;background:#d99000;color:#1a1a1a;font-weight:800;font-size:14px;padding:12px 22px;border-radius:8px;text-decoration:none;">Reset Password</a>
        <p style="margin:20px 0 0;font-size:11px;color:#9ca3af;">
          If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    </div>
  </div>`;

  try {
    await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: "Reset your ESell Namibia password",
      html,
    });
  } catch (error) {
    console.error("[email] Failed to send password reset email:", error);
  }
}
