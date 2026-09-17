'use strict';
/** Configuración del runner Cucumber. Los valores variables vienen de config/ y del .env. */
const fs = require('fs');
const path = require('path');
const config = require('./config');

[config.paths.json, config.paths.html].forEach((dir) => fs.mkdirSync(dir, { recursive: true }));

// Ruta relativa con "/" para no chocar con "C:" de Windows en la sintaxis "formato:ruta"
const rel = (absolutePath) => path.relative(config.root, absolutePath).split(path.sep).join('/');

const base = {
  paths: ['features/**/*.feature'],
  require: ['src/support/world.js', 'src/support/hooks.js', 'src/step-definitions/**/*.js'],
  format: [
    'summary',
    `json:${rel(config.paths.json)}/cucumber-report.json`,
    `html:${rel(config.paths.html)}/cucumber-report.html`,
    `rerun:${rel(config.paths.reports)}/rerun.txt`,
  ],
  formatOptions: { snippetInterface: 'async-await' },
  parallel: config.execution.parallel,
  retry: config.execution.scenarioRetries,
  tags: config.execution.tags,
  ...(config.execution.retryTagFilter ? { retryTagFilter: config.execution.retryTagFilter } : {}),
};

module.exports = {
  default: base,
  smoke: { ...base, tags: '@smoke' },
  rerun: { ...base, paths: [`@${rel(config.paths.reports)}/rerun.txt`], retry: 0 },
};
