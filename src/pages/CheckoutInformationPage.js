'use strict';
const BasePage = require('./BasePage');
const { By, locator, dataTest } = require('./locator');

const L = {
  firstName: locator('Checkout.firstName', dataTest('firstName'), By.id('first-name')),
  lastName: locator('Checkout.lastName', dataTest('lastName'), By.id('last-name')),
  postalCode: locator('Checkout.postalCode', dataTest('postalCode'), By.id('postal-code')),
  continue: locator('Checkout.continue', dataTest('continue'), By.id('continue')),
};

class CheckoutInformationPage extends BasePage {
  get path() {
    return '/checkout-step-one.html';
  }

  get readyLocator() {
    return L.firstName;
  }

  /** @param {{firstName:string, lastName:string, postalCode:string}} customer */
  async fillForm(customer) {
    this.log.info('Completando la información de envío');
    await this.type(L.firstName, customer.firstName);
    await this.type(L.lastName, customer.lastName);
    await this.type(L.postalCode, customer.postalCode);
  }

  async continue() {
    await this.click(L.continue);
  }
}

module.exports = CheckoutInformationPage;
