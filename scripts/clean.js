'use strict';
/** Limpieza multiplataforma de reportes anteriore */
const fs = require('fs');
const path = require('path');
const config = require('../config');

function cleanReports() {
  const { json, html, dashboard, screenshots, notifications, reports } = config.paths;
  [json, html, dashboard, screenshots, notifications].forEach((dir) => fs.rmSync(dir, { recursive: true, force: true }));
  if (fs.existsSync(reports)) {
    fs.readdirSync(reports).filter((f) => f.endsWith('.zip')).forEach((f) => fs.rmSync(path.join(reports, f), { force: true }));
  }
  [json, html].forEach((dir) => fs.mkdirSync(dir, { recursive: true }));
}

if (require.main === module) {
  cleanReports();
  console.log('Reportes anteriores eliminados');
}

module.exports = { cleanReports };
