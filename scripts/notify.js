'use strict';
/** Resume la ejecución, comprime los reportes y notifica por email/Slack (real o simulado). */
const fs = require('fs');
const path = require('path');
const config = require('../config');
const logger = require('../src/utils/logger');
const { buildSummary } = require('../src/reporting/summary');
const { zipReports } = require('../src/reporting/archive');
const { buildMessage } = require('../src/reporting/message');
const { sendNotifications } = require('../src/reporting/notifier');

async function notify() {
  if (!config.notification.enabled) {
    logger.info('Notificaciones deshabilitadas (NOTIFY_ENABLED=false)');
    return;
  }

  const summary = buildSummary(path.join(config.paths.json, 'cucumber-report.json'));
  const attachments = [];

  const htmlReport = path.join(config.paths.html, 'cucumber-report.html');
  if (fs.existsSync(htmlReport)) attachments.push({ filename: 'cucumber-report.html', path: htmlReport });

  try {
    const zip = await zipReports(config.paths);
    attachments.push({ filename: zip.filename, path: zip.path });
  } catch (err) {
    logger.warn(`No se pudo comprimir el reporte: ${err.message}`);
  }

  await sendNotifications(buildMessage(summary, config, attachments), config, logger);
}

if (require.main === module) {
  notify().catch((err) => {
    logger.error(`Error en notificaciones: ${err.message}`);
    process.exitCode = 1;
  });
}

module.exports = { notify };
