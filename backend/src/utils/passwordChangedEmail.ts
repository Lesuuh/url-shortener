import { Resend } from "resend";
import compileEmailTemplate from "./compileEmailTemplate";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPasswordChangedEmail(
  email: string,
  name: string,
): Promise<void> {
  const appUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/app`;

  try {
    const html = await compileEmailTemplate("password-changed-email", {
      userName: name,
      appUrl,
    });

    const { data, error } = await resend.emails.send({
      from: "Lesuuh from Knot <onboarding@resend.dev>",
      to: [email],
      subject: "Your Knot password was changed",
      html,
    });

    if (error) {
      console.error("Resend failed to send password-changed email:", error);
      return;
    }

    console.log(`Password-changed email sent to ${email}`, data?.id);
  } catch (err) {
    console.error("Failed to send password-changed email:", err);
  }
}