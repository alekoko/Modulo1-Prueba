#!/usr/bin/env node
'use strict';
/**
 * Orquestador multiplataforma: limpiar -> ejecutar Cucumber.
 */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const CUCUMBER_DIR = path.join(ROOT, 'node_modules', '@cucumber', 'cucumber');
const CUCUMBER_BIN = path.join(CUCUMBER_DIR, 'bin', 'cucumber.js');

function assertInstalled() {
  if (fs.existsSync(CUCUMBER_DIR)) return;
  console.error(
    [
      '',
      '✖ No se encontró @cucumber/cucumber en node_modules.',
      `  Carpeta del proyecto: ${ROOT}`,
      '  Solución:',
      '    1. Verifica que la terminal esté en la carpeta que contiene package.json',
      '    2. Ejecuta: npm install',
      '    3. Comprueba la versión: npm ls @cucumber/cucumber   (debe ser 11.x)',
      '',
    ].join('\n'),
  );
  process.exit(1);
}

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const [flag, inline] = argv[i].split(/=(.*)/s);
    const value = () => (inline !== undefined ? inline : argv[++i]);
    if (flag === '--tags') args.tags = value();
    else if (flag === '--profile') args.profile = value();
    else if (flag === '--parallel') args.parallel = Number(value());
    else if (flag === '--no-notify') args.noNotify = true;
  }
  return args;
}

function loadCucumberApi() {
  try {
    return require('@cucumber/cucumber/api');
  } catch (err) {
    if (err.code !== 'MODULE_NOT_FOUND' && err.code !== 'ERR_PACKAGE_PATH_NOT_EXPORTED') throw err;
    return null;
  }
}

async function runWithApi(api, args, logger) {
  const provided = {};
  if (args.tags) provided.tags = args.tags;
  if (args.parallel) provided.parallel = args.parallel;
  const { runConfiguration } = await api.loadConfiguration({ profiles: [args.profile || 'default'], provided });
  const { success } = await api.runCucumber(runConfiguration);
  logger.debug('Cucumber ejecutado mediante la API programática');
  return success;
}

function runWithCli(args, logger) {
  if (!fs.existsSync(CUCUMBER_BIN)) throw new Error(`No se encontró el ejecutable de Cucumber: ${CUCUMBER_BIN}`);
  const cliArgs = ['--profile', args.profile || 'default'];
  if (args.tags) cliArgs.push('--tags', args.tags);
  if (args.parallel) cliArgs.push('--parallel', String(args.parallel));
  logger.info('API de Cucumber no disponible: se ejecuta el CLI de Cucumber');
  const result = spawnSync(process.execPath, [CUCUMBER_BIN, ...cliArgs], { cwd: ROOT, stdio: 'inherit', env: process.env });
  if (result.error) throw result.error;
  return result.status === 0;
}

async function main() {
  assertInstalled();

  const { cleanReports } = require('./clean');
  const { generateReport } = require('./generate-report');
  const { notify } = require('./notify');
  const logger = require('../src/utils/logger');

  const args = parseArgs(process.argv.slice(2));
  cleanReports();

  let success = false;
  try {
    const api = loadCucumberApi();
    success = api ? await runWithApi(api, args, logger) : runWithCli(args, logger);
  } catch (err) {
    logger.error(`Error al ejecutar la suite: ${err.stack || err.message}`);
  }

  try {
    generateReport();
  } catch (err) {
    logger.error(`Error al generar el reporte: ${err.message}`);
  }

  if (!args.noNotify) {
    try {
      await notify();
    } catch (err) {
      logger.error(`Error al notificar: ${err.message}`);
    }
  }

  logger.info(success ? '═══ Suite finalizada: TODO OK ═══' : '═══ Suite finalizada CON FALLAS ═══');
  process.exitCode = success ? 0 : 1;
}

main();
