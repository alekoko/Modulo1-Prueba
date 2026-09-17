'use strict';
/** captura en cada paso (adjunta al reporte) copia en disco al fallar.
 */
const fs = require('fs');
const path = require('path');

const CAPTURABLE = new Set(['PASSED', 'FAILED', 'AMBIGUOUS', 'PENDING']);

const sanitize = (text) =>
  String(text)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9-_]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 60);

/** @param {import('./world').CustomWorld} world */
async function captureStep(world, stepText, status) {
  const { screenshotMode, saveAllToDisk } = world.config.evidence;
  if (!world.driver || screenshotMode === 'none' || !CAPTURABLE.has(status)) return;
  const failed = status === 'FAILED';
  if (screenshotMode === 'failure' && !failed) return;

  try {
    const image = Buffer.from(await world.driver.takeScreenshot(), 'base64');
    await world.attach(image, 'image/png');

    if (failed || saveAllToDisk) {
      const dir = path.join(world.config.paths.screenshots, sanitize(world.scenarioName) || 'escenario');
      fs.mkdirSync(dir, { recursive: true });
      const file = path.join(dir, `${failed ? 'FAILED_' : ''}${new Date().toISOString().replace(/[:.]/g, '-')}_${sanitize(stepText)}.png`);
      fs.writeFileSync(file, image);
      world.log.info(`📸 Evidencia guardada: ${path.relative(world.config.root, file)}`);
    }
  } catch (err) {
    world.log.warn(`No se pudo capturar la evidencia del paso "${stepText}": ${err.message}`);
  }
}

async function attachFailureContext(world) {
  if (!world.driver) return;
  try {
    await world.attach(`URL al fallar: ${await world.driver.getCurrentUrl()}\nTítulo: ${await world.driver.getTitle()}`, 'text/plain');
  } catch (err) {
    world.log.warn(`No se pudo adjuntar el contexto de la falla: ${err.message}`);
  }
}

module.exports = { captureStep, attachFailureContext };
