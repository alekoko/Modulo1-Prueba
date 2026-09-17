'use strict';
/** Arma (texto y HTML) de la notificación. */

const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

function buildMessage(summary, config, attachments) {
  const status = summary.total > 0 && summary.failed === 0 ? '0 EXITOSA' : 'X CON FALLAS';
  const subject = `[SauceDemo][${config.env.toUpperCase()}] Ejecución ${status} – ${summary.passed}/${summary.total} escenarios`;

  const text = [
    `*Suite de automatización SauceDemo* ${status}`,
    `Ambiente: ${config.env} | Navegador: ${config.browser.name} | Plataforma: ${process.platform}`,
    `Total: ${summary.total} | Exitosos: ${summary.passed} | Fallidos: ${summary.failed} | Omitidos: ${summary.skipped}`,
    `Éxito: ${summary.passRate}% | Duración: ${summary.durationSec}s`,
    ...summary.failures.map((f) => `• ${f.scenario} → ${f.step}: ${f.error}`),
    'Se adjunta el reporte con evidencias.',
  ].join('\n');

  const failureRows = summary.failures
    .map((f) => `<tr><td>${escapeHtml(f.scenario)}</td><td>${escapeHtml(f.step)}</td><td>${escapeHtml(f.error)}</td></tr>`)
    .join('');

  const html = `
    <h2>Suite SauceDemo – ${status}</h2>
    <p>Ambiente <b>${config.env}</b> · Navegador <b>${config.browser.name}</b></p>
    <table border="1" cellpadding="6" cellspacing="0">
      <tr><th>Total</th><th>Exitosos</th><th>Fallidos</th><th>Omitidos</th><th>% Éxito</th><th>Duración</th></tr>
      <tr><td>${summary.total}</td><td>${summary.passed}</td><td>${summary.failed}</td><td>${summary.skipped}</td><td>${summary.passRate}%</td><td>${summary.durationSec}s</td></tr>
    </table>
    ${failureRows ? `<h3>Fallas</h3><table border="1" cellpadding="6" cellspacing="0"><tr><th>Escenario</th><th>Paso</th><th>Error</th></tr>${failureRows}</table>` : ''}
    <p>Se adjunta el reporte HTML con capturas de pantalla.</p>`;

  return { subject, text, html, attachments };
}

module.exports = { buildMessage };
