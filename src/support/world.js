'use strict';
/**
 * PATRON CONTEXT OBJECT + INYECCIÓN DE DEPENDENCIAS
 */
const { World, setWorldConstructor, setDefaultTimeout } = require('@cucumber/cucumber');
const config = require('../../config');
const logger = require('../utils/logger');
const DataProvider = require('../data/DataProvider');
const { ScenarioContext } = require('../context/ScenarioContext');
const { createDriver } = require('./driver');

const LoginPage = require('../pages/LoginPage');
const InventoryPage = require('../pages/InventoryPage');
const CartPage = require('../pages/CartPage');
const CheckoutInformationPage = require('../pages/CheckoutInformationPage');
const CheckoutOverviewPage = require('../pages/CheckoutOverviewPage');
const CheckoutCompletePage = require('../pages/CheckoutCompletePage');
const HeaderComponent = require('../pages/components/HeaderComponent');
const CartItemsComponent = require('../pages/components/CartItemsComponent');

class CustomWorld extends World {
  constructor(options) {
    super(options);
    this.config = config;
    this.log = logger;
    this.data = new DataProvider(config.paths.data);
    this.context = new ScenarioContext();
    this.scenarioName = '';
    this.driver = null;
    this.pages = null;
  }

  /** Abre el navegador e inyecta sus dependencias en cada Page Object. */
  async openBrowser() {
    this.driver = await createDriver(this.config, this.log);
    const deps = { config: this.config, logger: this.log };
    this.pages = Object.freeze({
      login: new LoginPage(this.driver, deps),
      inventory: new InventoryPage(this.driver, deps),
      cart: new CartPage(this.driver, deps),
      checkoutInformation: new CheckoutInformationPage(this.driver, deps),
      checkoutOverview: new CheckoutOverviewPage(this.driver, deps),
      checkoutComplete: new CheckoutCompletePage(this.driver, deps),
      header: new HeaderComponent(this.driver, deps),
      cartItems: new CartItemsComponent(this.driver, deps),
    });
  }

  async closeBrowser() {
    if (!this.driver) return;
    try {
      await this.driver.quit();
    } catch (err) {
      this.log.warn(`Error al cerrar el navegador: ${err.message}`);
    } finally {
      this.driver = null;
      this.pages = null;
    }
  }
}

setWorldConstructor(CustomWorld);
setDefaultTimeout(config.timeouts.step);

module.exports = { CustomWorld };
