'use strict';
const BasePage = require('./BasePage');
const { By, locator, dataTest } = require('./locator');
const { parseCurrency } = require('../utils/numbers');

const L = {
  subtotal: locator('Overview.subtotal', dataTest('subtotal-label'), By.css('.summary_subtotal_label')),
  tax: locator('Overview.tax', dataTest('tax-label'), By.css('.summary_tax_label')),
  total: locator('Overview.total', dataTest('total-label'), By.css('.summary_total_label')),
  finish: locator('Overview.finish', dataTest('finish'), By.id('finish')),
};

class CheckoutOverviewPage extends BasePage {
  get path() {
    return '/checkout-step-two.html';
  }

  get readyLocator() {
    return L.finish;
  }

  async getTotals() {
    return {
      subtotal: parseCurrency(await this.getText(L.subtotal)),
      tax: parseCurrency(await this.getText(L.tax)),
      total: parseCurrency(await this.getText(L.total)),
    };
  }

  async finish() {
    this.log.info('Finalizando la compra');
    await this.click(L.finish);
  }
}

module.exports = CheckoutOverviewPage;
