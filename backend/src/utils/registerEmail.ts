import { Resend } from "resend";
import compileEmailTemplate from "./compileEmailTemplate";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendRegistrationEmail(
  email: string,
  name: string,
): Promise<void> {
  try {
    const html = await compileEmailTemplate("register-email", {
      userName: name,
    });

    const { data, error } = await resend.emails.send({
      from: "Lesuuh from Knot <onboarding@resend.dev>",
      to: [email],
      subject: "Welcome to Knot — Registration Successful",
      html,
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
