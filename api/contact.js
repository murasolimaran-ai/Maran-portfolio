/* ================================================================
   api/contact.js — Vercel Serverless Function

   Receives form data → sends to:
   1. Telegram Bot     (instant notification)
   2. Google Sheets    (permanent lead log)

   Secret keys are in .env — NEVER in frontend.
================================================================ */

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const { name, phone, email, subject, message } = req.body;

    /* Server-side validation */
    if (!name || !subject || !message) {
      return res.status(400).json({
        success : false,
        message : "Missing required fields"
      });
    }

    const timestamp = new Date().toLocaleString("en-IN", {
      timeZone  : "Asia/Kolkata",
      dateStyle : "medium",
      timeStyle : "short"
    });

    /* ============================================================
       1. TELEGRAM BOT
    ============================================================ */
    const telegramText =
`🚀 *New Portfolio Lead*

👤 *Name:*    ${name}
📱 *Phone:*   ${phone   || "Not Provided"}
📧 *Email:*   ${email   || "Not Provided"}
📌 *Subject:* ${subject}
🕒 *Time:*    ${timestamp} IST

💬 *Message:*
${message}`;

    await fetch(
      `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`,
      {
        method  : "POST",
        headers : { "Content-Type": "application/json" },
        body    : JSON.stringify({
          chat_id    : process.env.CHAT_ID,
          text       : telegramText,
          parse_mode : "Markdown"
        })
      }
    );

    /* ============================================================
       2. GOOGLE SHEETS
    ============================================================ */
    await fetch(process.env.GOOGLE_SCRIPT_URL, {
      method  : "POST",
      headers : { "Content-Type": "application/json" },
      body    : JSON.stringify({
        name,
        phone     : phone   || "Not Provided",
        email     : email   || "Not Provided",
        subject,
        message,
        timestamp
      })
    });

    return res.status(200).json({ success: true });

  } catch (error) {

    console.error("contact.js error:", error.message);
    return res.status(500).json({
      success : false,
      error   : error.message
    });
  }
}