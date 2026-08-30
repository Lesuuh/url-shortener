import { Resend } from "resend";
import compileEmailTemplate from "./compileEmailTemplate";
import { emailLogoAttachments } from "./emailLogo";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendRegistrationEmail(
  email: string,
  name: string,
): Promise<void> {
  const appUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/app`;

  try {
    const html = await compileEmailTemplate("register-email", {
      userName: name,
      appUrl,
    });

    const { data, error } = await resend.emails.send({
      from: "Lesuuh from Knot <onboarding@resend.dev>",
      to: [email],
      subject: "Your Knot account is ready",
      html,
      attachments: emailLogoAttachments(),
    });

    if (error) {
      console.error("Resend failed to send registration email:", error);
      return;
    }

    console.log(`Registration email sent to ${email}`, data?.id);
  } catch (err) {
    console.error("Failed to send registration email:", err);
  }
}