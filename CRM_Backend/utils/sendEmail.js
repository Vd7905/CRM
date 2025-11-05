import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

export async function sendEmail({ to, subject, text, html }) {
  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": process.env.BREVO_PASS, // ✅ Use Brevo API Key here
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: { name: "CRM PRO", email: "no-reply@crm-pro.co.in" },
        to: [{ email: to }],
        subject,
        htmlContent: html || `<pre>${text}</pre>`,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to send email");

    console.log("Email sent via Brevo API:", data.messageId || "Success");
    return data;
  } catch (err) {
    console.error("Email send failed:", err);
    throw err;
  }
}
