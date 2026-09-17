'use strict';
const BasePage = require('./BasePage');
const { By, locator, dataTest, toSlug } = require('./locator');

const L = {
  checkout: locator('Cart.checkout', dataTest('checkout'), By.id('checkout')),
  continueShopping: locator('Cart.continueShopping', dataTest('continue-shopping'), By.id('continue-shopping')),
  removeButton: (name) => locator(`Cart.remove(${name})`, dataTest(`remove-${toSlug(name)}`), By.id(`remove-${toSlug(name)}`)),
};

class CartPage extends BasePage {
  get path() {
    return '/cart.html';
  }

  get readyLocator() {
    return L.checkout;
  }

  async removeProduct(productName) {
    this.log.info(`Removiendo "${productName}" desde el carrito`);
    await this.click(L.removeButton(productName));
    await this.waits.notVisible(L.removeButton(productName));
  }

  async checkout() {
    await this.click(L.checkout);
  }

  async continueShopping() {
    await this.click(L.continueShopping);
  }
}

module.exports = CartPage;
