import { Resend } from "resend";
import compileEmailTemplate from "./compileEmailTemplate";
import { emailLogoAttachments } from "./emailLogo";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPasswordResetEmail(
  email: string,
  token: string,
  name: string,
  base_url: string,
) {
  const resetLink = `${base_url}/app/reset-password?token=${token}`;

  console.log("Reset link:", resetLink);

  const htmlString = await compileEmailTemplate("password-reset-email", {
    userName: name,
    resetLink: resetLink,
  });

  try {
    const data = await resend.emails.send({
      from: "Lesuuh from Knot <onboarding@resend.dev>",
      to: [email],
      subject: "Reset your Knot password",
      html: htmlString,
      attachments: emailLogoAttachments(),
    });

    console.log("Email sent successfully:", data);
  } catch (error) {
    console.error("Failed to send email:", error);
  }
}