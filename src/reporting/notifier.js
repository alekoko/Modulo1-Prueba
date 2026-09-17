'use strict';
/**
 * Envío del reporte por email (SMTP) y Slack.
 * Con NOTIFY_DRY_RUN=true no se envía nada: se valida la configuración y se guarda
 * en reports/notifications/ el mensaje exacto que se habría enviado (modo simulado).
 */
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const { WebClient } = require('@slack/web-api');

/* ─────────────── Email ─────────────── */

function validateEmail(settings) {
  const missing = ['host', 'from'].filter((key) => !settings[key]);
  if (settings.to.length === 0) missing.push('to');
  if (missing.length) throw new Error(`Configuración de email incompleta: ${missing.join(', ')} (ver .env.example)`);
}

async function sendEmail(settings, message) {
  validateEmail(settings);
  const transporter = nodemailer.createTransport({
    host: settings.host,
    port: settings.port,
    secure: settings.secure,
    auth: settings.user ? { user: settings.user, pass: settings.pass } : undefined,
  });
  await transporter.sendMail({
    from: settings.from,
    to: settings.to.join(', '),
    subject: message.subject,
    text: message.text,
    html: message.html,
    attachments: message.attachments.map(({ filename, path: filePath }) => ({ filename, path: filePath })),
  });
}

/* ─────────────── Slack ─────────────── */

function validateSlack({ token, channelId, webhookUrl }) {
  if (!(token && channelId) && !webhookUrl) {
    throw new Error('Configuración de Slack incompleta: defina SLACK_BOT_TOKEN + SLACK_CHANNEL_ID o SLACK_WEBHOOK_URL');
  }
}

async function sendSlack(settings, message) {
  validateSlack(settings);
  if (settings.token && settings.channelId) {
    // Bot token: mensaje + archivos adjuntos
    await new WebClient(settings.token).files.uploadV2({
      channel_id: settings.channelId,
      initial_comment: message.text,
      file_uploads: message.attachments.map(({ filename, path: filePath }) => ({ file: filePath, filename })),
    });
    return;
  }
  // Webhook: solo texto (Slack no permite adjuntos por webhook)
  const response = await fetch(settings.webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: `${message.text}\n_(Los adjuntos requieren SLACK_BOT_TOKEN)_` }),
  });
  if (!response.ok) throw new Error(`Slack webhook respondió HTTP ${response.status}`);
}

/* ─────────────── Simulación ─────────────── */

function simulate(channel, validate, settings, message, outputDir, logger) {
  let configurationStatus = 'OK: el envío real funcionaría con la configuración actual';
  try {
    validate(settings);
  } catch (err) {
    configurationStatus = `PENDIENTE: ${err.message}`;
  }
  fs.mkdirSync(outputDir, { recursive: true });
  const file = path.join(outputDir, `${channel}-${Date.now()}.json`);
  const attachments = message.attachments.map((a) => ({ ...a, sizeBytes: fs.existsSync(a.path) ? fs.statSync(a.path).size : 0 }));
  fs.writeFileSync(file, JSON.stringify({ simulated: true, channel, configurationStatus, subject: message.subject, text: message.text, attachments }, null, 2));
  logger.info(`[SIMULADO] ${channel}: "${message.subject}" | adjuntos: ${attachments.map((a) => a.filename).join(', ')}`);
  logger.info(`[SIMULADO] ${channel}: ${configurationStatus}`);
}

const CHANNELS = {
  email: { send: sendEmail, validate: validateEmail },
  slack: { send: sendSlack, validate: validateSlack },
};

/** Envía por todos los canales configurados; un canal que falla no bloquea a los demás. */
async function sendNotifications(message, config, logger) {
  const { channels, dryRun } = config.notification;
  const results = await Promise.allSettled(
    channels.map(async (channel) => {
      const handler = CHANNELS[channel];
      if (!handler) throw new Error(`Canal desconocido: "${channel}"`);
      const settings = config.notification[channel];
      if (dryRun) return simulate(channel, handler.validate, settings, message, config.paths.notifications, logger);
      return handler.send(settings, message);
    }),
  );
  results.forEach((result, i) => {
    if (result.status === 'fulfilled') logger.info(`Notificación ${channels[i]}: ${dryRun ? 'simulada' : 'enviada'}`);
    else logger.error(`Notificación ${channels[i]}: falló -> ${result.reason.message}`);
  });
}

module.exports = { sendNotifications };
