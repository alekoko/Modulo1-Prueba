'use strict';
/**
 * Ciclo de vida de cada escenario: con su navegador propio, abertura y cierre.
 */
const { BeforeAll, Before, BeforeStep, AfterStep, After, Status } = require('@cucumber/cucumber');
const config = require('../../config');
const logger = require('../utils/logger');
const { captureStep, attachFailureContext } = require('./evidence');

BeforeAll(function () {
  logger.info('═══════════ Inicio de ejecución ═══════════');
  logger.info(
    `Ambiente: ${config.env} | URL: ${config.baseUrl} | Navegador: ${config.browser.name} | ` +
      `Headless: ${config.browser.headless} | Remoto: ${config.browser.remoteUrl || 'no'} | SO: ${process.platform}`,
  );
});

Before(async function ({ pickle }) {
  this.scenarioName = pickle.name;
  this.log.info(`▶ Escenario: "${pickle.name}" ${pickle.tags.map((t) => t.name).join(' ')}`);
  await this.openBrowser();
});

BeforeStep(function ({ pickleStep }) {
  this.log.info(`   → ${pickleStep.text}`);
});

AfterStep(async function ({ pickleStep, result }) {
  if (result.status === Status.FAILED) {
    this.log.error(`   ✖ Paso fallido: "${pickleStep.text}"\n${result.message || ''}`);
  }
  await captureStep(this, pickleStep.text, result.status);
});

After(async function ({ pickle, result, willBeRetried }) {
  const failed = result.status === Status.FAILED;
  try {
    if (failed) await attachFailureContext(this);
  } finally {
    await this.closeBrowser();
  }
  if (failed) this.log.error(`${willBeRetried ? '↻ FALLÓ (se reintentará)' : '✖ FALLÓ'} → "${pickle.name}"`);
  else this.log.info(`✔ ${result.status} → "${pickle.name}"`);
});
