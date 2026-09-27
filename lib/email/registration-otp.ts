import { emailLayout, sendEmail } from "@/lib/email/client";

export async function sendRegistrationOtpEmail(email: string, name: string, code: string, expiresInMinutes: number) {
  const firstName = name.split(" ")[0].replace(/[&<>"']/g, "");

  const html = emailLayout(`
      <div style="padding:24px;">
        <h1 style="margin:0 0 8px;font-size:18px;color:#1a1a1a;">Confirm your email</h1>
        <p style="margin:0 0 20px;font-size:13px;line-height:1.6;color:#666666;">
          Hi ${firstName}, use this code to finish creating your ESell Namibia account.
          It expires in ${expiresInMinutes} minutes.
        </p>
        <p style="margin:0 0 20px;padding:16px;background:#fff9e8;border:1px solid #eadcae;border-radius:10px;text-align:center;font-size:32px;font-weight:800;letter-spacing:10px;color:#1a1a1a;">${code}</p>
        <p style="margin:0;font-size:11px;color:#9ca3af;">
          If you didn't try to create an account, you can safely ignore this email.
        </p>
      </div>`);

  return sendEmail({
    to: email,
    subject: `${code} is your ESell Namibia verification code`,
    html,
    text: `Your ESell Namibia verification code is ${code}. It expires in ${expiresInMinutes} minutes.`,
  });
}
