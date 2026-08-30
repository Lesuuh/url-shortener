import { Resend } from "resend";
import compileEmailTemplate from "./compileEmailTemplate";
import { emailLogoAttachments } from "./emailLogo";

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Sends the "confirm your email" message. Not wired to any route yet — it is
 * ready to call from the verification flow once that endpoint exists.
 */
export async function sendVerificationEmail(
  email: string,
  name: string,
  verifyLink: string,
): Promise<void> {
  try {
    const html = await compileEmailTemplate("email-verification-email", {
      userName: name,
      verifyLink,
    });

    const { data, error } = await resend.emails.send({
      from: "Lesuuh from Knot <onboarding@resend.dev>",
      to: [email],
      subject: "Confirm your Knot email",
      html,
      attachments: emailLogoAttachments(),
    });

    if (error) {
      console.error("Resend failed to send verification email:", error);
      return;
    }

    console.log(`Verification email sent to ${email}`, data?.id);
  } catch (err) {
    console.error("Failed to send verification email:", err);
  }
}