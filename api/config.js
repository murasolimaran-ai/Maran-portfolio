/* ================================================================
   api/config.js — Vercel Serverless Function
   
   Returns EmailJS PUBLIC keys to frontend.
   EmailJS public key is INTENTIONALLY shareable.
   Secret keys (BOT_TOKEN, CHAT_ID, GOOGLE_SCRIPT_URL) 
   NEVER leave the backend.
================================================================ */

export default function handler(req, res) {

  /* Only GET allowed */
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  /* Return only the EmailJS keys frontend needs */
  return res.status(200).json({
    publicKey  : process.env.EMAILJS_PUBLIC_KEY  || "",
    serviceId  : process.env.EMAILJS_SERVICE_ID  || "",
    templateId : process.env.EMAILJS_TEMPLATE_ID || "",
    autoReplyTemplateId:process.env.EMAILJS_AUTOREPLY_TEMPLATE_ID || ""
  });
}