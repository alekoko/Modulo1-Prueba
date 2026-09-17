'use strict';
/**
 * POM – clase base
 */
const { error } = require('selenium-webdriver');
const Waits = require('../utils/waits');
const { withRetry } = require('../utils/retry');
const { isInteractionError, isNetworkError } = require('../utils/errors');
const { By, locator, dataTest } = require('./locator');

const COMMON = {
  errorMessage: locator('Error.message', dataTest('error'), By.css('.error-message-container h3')),
};

class BasePage {
  /**
   * @param {import('selenium-webdriver').WebDriver} driver
   * @param {{config:object, logger:object}} deps
   */
  constructor(driver, { config, logger }) {
    this.driver = driver;
    this.config = config;
    this.log = logger.child({ scope: this.constructor.name });
    this.waits = new Waits(driver, config.timeouts);
  }

  /** Ruta relativa a baseUrl (las secciones reutilizables no tienen ruta). */
  get path() {
    return null;
  }

  /** Elemento que confirma que la página terminó de cargar. */
  get readyLocator() {
    return null;
  }

  /* ───────────────────────── Navegación ───────────────────────── */

  async open() {
    if (!this.path) throw new Error(`${this.constructor.name} no define una ruta para navegar`);
    const url = new URL(this.path, this.config.baseUrl).toString();
    this.log.info(`Navegando a ${url}`);
    await this.retry(() => this.driver.get(url), `navegar a ${url}`, isNetworkError);
    await this.waits.pageReady();
  }

  async waitUntilLoaded() {
    if (this.path) await this.waits.urlContains(this.path);
    if (this.readyLocator) await this.waits.visible(this.readyLocator);
  }

  async isLoaded() {
    try {
      await this.waitUntilLoaded();
      return true;
    } catch (err) {
      if (err instanceof error.TimeoutError) return false;
      throw err;
    }
  }

  currentUrl() {
    return this.driver.getCurrentUrl();
  }

  /* ───────────────────────── Interacciones ───────────────────────── */

  retry(operation, label, retryOn = isInteractionError) {
    const { attempts, delayMs } = this.config.retry;
    return withRetry(operation, { attempts, delayMs, retryOn, label, logger: this.log });
  }

  async click(target) {
    this.log.debug(`click → ${target.name}`);
    await this.retry(async () => {
      const element = await this.waits.clickable(target);
      try {
        await element.click();
      } catch (err) {
        if (err.name !== 'ElementClickInterceptedError') throw err;
        this.log.warn(`Click interceptado en "${target.name}": se usa scroll + click por JavaScript`);
        await this.driver.executeScript('arguments[0].scrollIntoView({block:"center"}); arguments[0].click();', element);
      }
    }, `click en ${target.name}`);
  }

  async type(target, value, { sensitive = false } = {}) {
    const text = value === null || value === undefined ? '' : String(value);
    this.log.debug(`type → ${target.name}: ${sensitive ? '******' : `"${text}"`}`);
    await this.retry(async () => {
      const element = await this.waits.visible(target);
      await element.clear();
      if (text) await element.sendKeys(text);
    }, `escribir en ${target.name}`);
  }

  getText(target) {
    return this.retry(async () => (await (await this.waits.visible(target)).getText()).trim(), `leer ${target.name}`);
  }

  getTexts(target) {
    return this.retry(async () => {
      const elements = await this.waits.elements(target);
      return Promise.all(elements.map(async (el) => (await el.getText()).trim()));
    }, `leer lista ${target.name}`);
  }

  /** Texto de un elemento hijo dentro de un contenedor, probando cada estrategia. */
  async childText(parent, target) {
    for (const by of target.strategies) {
      const found = await parent.findElements(by);
      if (found.length > 0) return (await found[0].getText()).trim();
    }
    throw new Error(`No se encontró "${target.name}" dentro del contenedor`);
  }

  async count(target) {
    return (await this.waits.elements(target, { allowEmpty: true })).length;
  }

  isVisible(target, timeout) {
    return this.waits.isVisible(target, timeout);
  }

  async selectByValue(target, value) {
    this.log.debug(`select → ${target.name}: ${value}`);
    await this.retry(async () => {
      const select = await this.waits.clickable(target);
      await select.findElement(By.css(`option[value="${value}"]`)).click();
    }, `seleccionar "${value}" en ${target.name}`);
  }

  /** Banner de error compartido por Login y Checkout. */
  getErrorMessage() {
    return this.getText(COMMON.errorMessage);
  }
}

module.exports = BasePage;