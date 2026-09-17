'use strict';
/**
 * Explicits waits.
 * localizador ciclo de polling
 */
const { until, error } = require('selenium-webdriver');

const STATES = {
  present: async () => true,
  visible: async (el) => el.isDisplayed(),
  clickable: async (el) => (await el.isDisplayed()) && (await el.isEnabled()),
};

const isStale = (err) => err instanceof error.StaleElementReferenceError;

class Waits {
  /**
   * @param {import('selenium-webdriver').WebDriver} driver
   * @param {{explicit:number, polling:number, pageLoad:number}} timeouts
   */
  constructor(driver, timeouts) {
    this.driver = driver;
    this.timeout = timeouts.explicit;
    this.polling = timeouts.polling;
    this.pageLoadTimeout = timeouts.pageLoad;
  }

  async element(locator, state = 'visible', timeout = this.timeout) {
    const check = STATES[state];
    return this.driver.wait(
      async () => {
        for (const by of locator.strategies) {
          for (const el of await this.driver.findElements(by)) {
            try {
              if (await check(el)) return el;
            } catch (err) {
              if (!isStale(err)) throw err;
            }
          }
        }
        return false;
      },
      timeout,
      `Timeout (${timeout} ms) esperando "${locator.name}" en estado "${state}". Estrategias: ${locator.strategies.join(' | ')}`,
      this.polling,
    );
  }

  present(locator, timeout) {
    return this.element(locator, 'present', timeout);
  }

  visible(locator, timeout) {
    return this.element(locator, 'visible', timeout);
  }

  clickable(locator, timeout) {
    return this.element(locator, 'clickable', timeout);
  }

  /** Lista de elementos. Con allowEmpty=true devuelve [] sin esperar. */
  async elements(locator, { timeout = this.timeout, allowEmpty = false } = {}) {
    const firstMatch = async () => {
      for (const by of locator.strategies) {
        const found = await this.driver.findElements(by);
        if (found.length > 0) return found;
      }
      return false;
    };
    if (allowEmpty) return (await firstMatch()) || [];
    return this.driver.wait(firstMatch, timeout, `Timeout (${timeout} ms) esperando elementos "${locator.name}"`, this.polling);
  }

  async isVisible(locator, timeout = 1000) {
    try {
      await this.visible(locator, timeout);
      return true;
    } catch (err) {
      if (err instanceof error.TimeoutError) return false;
      throw err;
    }
  }

  notVisible(locator, timeout = this.timeout) {
    return this.driver.wait(
      async () => {
        for (const by of locator.strategies) {
          for (const el of await this.driver.findElements(by)) {
            try {
              if (await el.isDisplayed()) return false;
            } catch (err) {
              if (!isStale(err)) throw err;
            }
          }
        }
        return true;
      },
      timeout,
      `Timeout (${timeout} ms) esperando que "${locator.name}" desaparezca`,
      this.polling,
    );
  }

  urlContains(fragment, timeout = this.timeout) {
    return this.driver.wait(until.urlContains(fragment), timeout, `Timeout (${timeout} ms) esperando URL con "${fragment}"`);
  }

  pageReady() {
    return this.driver.wait(
      async () => (await this.driver.executeScript('return document.readyState')) === 'complete',
      this.pageLoadTimeout,
      'Timeout esperando document.readyState = complete',
      this.polling,
    );
  }

  condition(fn, description, timeout = this.timeout) {
    return this.driver.wait(fn, timeout, `Timeout (${timeout} ms): ${description}`, this.polling);
  }
}

module.exports = Waits;
