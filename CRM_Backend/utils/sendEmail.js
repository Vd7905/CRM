import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.BREVO_HOST || "smtp-relay.brevo.com",
  port: 587,
  secure: false, // use STARTTLS for Brevo
  auth: {
    user: "9ae6da001@smtp-brevo.com", // your Brevo SMTP login (not Gmail)
    pass: process.env.BREVO_PASS,     // your SMTP key
  },
});

export async function sendEmail({ to, subject, html }) {
  try {
    const info = await transporter.sendMail({
      from: `"CRM PRO" <no-reply@crm-pro.co.in>`,
      to,
      subject,
      html,
    });
    console.log("✅ Email sent:", info.messageId);
    return info;
  } catch (err) {
    console.error("❌ Email send failed:", err);
    throw err;
  }
}
