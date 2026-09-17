'use strict';
/** Genera el dashboard HTML con multiple-cucumber-html-reporter a partir del JSON de Cucumber. */
const fs = require('fs');
const os = require('os');
const path = require('path');
const reporter = require('multiple-cucumber-html-reporter');
const config = require('../config');
const logger = require('../src/utils/logger');

const PLATFORMS = { win32: 'windows', darwin: 'osx', linux: 'linux' };

function generateReport() {
  const jsonFile = path.join(config.paths.json, 'cucumber-report.json');
  if (!fs.existsSync(jsonFile) || fs.statSync(jsonFile).size === 0) {
    logger.warn('No hay resultados de Cucumber: se omite el dashboard');
    return;
  }

  reporter.generate({
    jsonDir: config.paths.json,
    reportPath: config.paths.dashboard,
    reportName: 'SauceDemo – Reporte de Automatización Front-End',
    pageTitle: 'SauceDemo BDD Report',
    displayDuration: true,
    displayReportTime: true,
    openReportInBrowser: false,
    metadata: {
      browser: { name: config.browser.name, version: 'stable' },
      device: config.browser.remoteUrl ? 'Selenium Grid (Docker)' : os.hostname(),
      platform: { name: PLATFORMS[process.platform] || process.platform, version: os.release() },
    },
    customData: {
      title: 'Información de la ejecución',
      data: [
        { label: 'Ambiente', value: config.env },
        { label: 'URL', value: config.baseUrl },
        { label: 'Headless', value: String(config.browser.headless) },
        { label: 'Workers', value: String(config.execution.parallel) },
        { label: 'Fecha', value: new Date().toLocaleString() },
      ],
    },
  });
  logger.info(`📊 Dashboard: ${path.relative(config.root, path.join(config.paths.dashboard, 'index.html'))}`);
}

if (require.main === module) generateReport();

module.exports = { generateReport };
