'use strict';
/**
 * Creación de la sesión WebDriver.
 * Selenium Manager
 */
const { Builder, Browser } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const edge = require('selenium-webdriver/edge');
const firefox = require('selenium-webdriver/firefox');
const { withRetry } = require('../utils/retry');

const CHROMIUM_ARGS = [
  '--disable-gpu',
  '--no-sandbox',
  '--disable-dev-shm-usage',
  '--disable-extensions',
  '--disable-notifications',
  '--disable-search-engine-choice-screen',
  // Evita el popup de Chrome "cambia tu contraseña" que bloquea saucedemo tras el login
  '--disable-features=PasswordLeakDetection,PasswordCheck',
];

const CHROMIUM_PREFS = {
  credentials_enable_service: false,
  'profile.password_manager_enabled': false,
  'profile.password_manager_leak_detection': false,
};

function chromiumOptions(options, { headless, width, height }) {
  if (headless) options.addArguments('--headless=new');
  options.addArguments(`--window-size=${width},${height}`, ...CHROMIUM_ARGS);
  options.setUserPreferences(CHROMIUM_PREFS);
  return options;
}

function configureBrowser(builder, browser) {
  switch (browser.name) {
    case 'chrome':
      return builder.forBrowser(Browser.CHROME).setChromeOptions(chromiumOptions(new chrome.Options(), browser));
    case 'edge':
      return builder.forBrowser(Browser.EDGE).setEdgeOptions(chromiumOptions(new edge.Options(), browser));
    case 'firefox': {
      const options = new firefox.Options();
      if (browser.headless) options.addArguments('-headless');
      options.addArguments(`--width=${browser.width}`, `--height=${browser.height}`);
      options.setPreference('signon.rememberSignons', false);
      return builder.forBrowser(Browser.FIREFOX).setFirefoxOptions(options);
    }
    default:
      throw new Error(`Navegador "${browser.name}" no soportado. Opciones: chrome, firefox, edge`);
  }
}

/**
 * @param {object} config configuración del framework
 * @param {object} logger
 * @returns {Promise<import('selenium-webdriver').WebDriver>}
 */
async function createDriver(config, logger) {
  const { browser, timeouts } = config;

  const driver = await withRetry(
    async () => {
      const builder = configureBrowser(new Builder(), browser);
      if (browser.remoteUrl) builder.usingServer(browser.remoteUrl);
      return await builder.build();
    },
    { attempts: config.retry.driverAttempts, delayMs: 2000, label: `iniciar ${browser.name}`, logger },
  );

  await driver.manage().setTimeouts({ implicit: 0, pageLoad: timeouts.pageLoad, script: timeouts.script });
  try {
    await driver.manage().window().setRect({ width: browser.width, height: browser.height });
  } catch (err) {
    logger.debug(`No se pudo ajustar la ventana: ${err.message}`);
  }

  const caps = await driver.getCapabilities();
  logger.info(`Navegador iniciado: ${caps.getBrowserName()} ${caps.getBrowserVersion()} | SO: ${process.platform} | headless: ${browser.headless}`);
  return driver;
}

module.exports = { createDriver };
