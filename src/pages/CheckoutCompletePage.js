'use strict';
const BasePage = require('./BasePage');
const { By, locator, dataTest } = require('./locator');

const L = {
  header: locator('Complete.header', dataTest('complete-header'), By.css('.complete-header')),
  backHome: locator('Complete.backHome', dataTest('back-to-products'), By.id('back-to-products')),
};

class CheckoutCompletePage extends BasePage {
  get path() {
    return '/checkout-complete.html';
  }

  get readyLocator() {
    return L.header;
  }

  getConfirmationHeader() {
    return this.getText(L.header);
  }

  async backHome() {
    await this.click(L.backHome);
  }
}

module.exports = CheckoutCompletePage;
