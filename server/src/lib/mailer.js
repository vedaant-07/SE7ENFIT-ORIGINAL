const nodemailer = require("nodemailer");

let cachedTransporter = null;
let cachedConfigKey = null;

function getSmtpConfig() {
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = typeof process.env.SMTP_SECURE === "string"
    ? process.env.SMTP_SECURE.toLowerCase() === "true"
    : port === 465;

  const from = process.env.SMTP_FROM || process.env.EMAIL_FROM || process.env.SMTP_USER || "";

  return {
    host: process.env.SMTP_HOST || "",
    port,
    secure,
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
    from,
    replyTo: process.env.SMTP_REPLY_TO || process.env.EMAIL_REPLY_TO || "",
  };
}

function getEmailProviderStatus() {
  const config = getSmtpConfig();
  const missing = [];

  if (!config.host) missing.push("SMTP_HOST");
  if (!config.user) missing.push("SMTP_USER");
  if (!config.pass) missing.push("SMTP_PASS");
  if (!config.from) missing.push("SMTP_FROM");

  return {
    configured: missing.length === 0,
    provider: "smtp",
    missing,
    host: config.host || null,
    port: config.port,
    from: config.from || null,
  };
}

function isEmailConfigured() {
  return getEmailProviderStatus().configured;
}

function getTransporter() {
  const config = getSmtpConfig();
  const configKey = JSON.stringify({
    host: config.host,
    port: config.port,
    secure: config.secure,
    user: config.user,
    pass: config.pass,
  });

  if (cachedTransporter && cachedConfigKey === configKey) return cachedTransporter;

  cachedTransporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });
  cachedConfigKey = configKey;

  return cachedTransporter;
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function textToHtml(text = "") {
  return escapeHtml(text).replace(/\n/g, "<br />");
}

async function sendEmail({ to, subject, text, html, replyTo }) {
  const status = getEmailProviderStatus();
  if (!status.configured) {
    throw new Error(`Email provider not configured. Missing: ${status.missing.join(", ")}`);
  }

  const config = getSmtpConfig();
  const transporter = getTransporter();

  return transporter.sendMail({
    from: config.from,
    to,
    subject,
    text,
    html: html || textToHtml(text),
    replyTo: replyTo || config.replyTo || undefined,
  });
}

module.exports = {
  getEmailProviderStatus,
  isEmailConfigured,
  sendEmail,
};
