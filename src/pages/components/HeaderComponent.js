'use strict';
/** Page Object de la cabecera (visible en todas las páginas internas): título, carrito y menú. */
const { error } = require('selenium-webdriver');
const BasePage = require('../BasePage');
const { By, locator, dataTest } = require('../locator');

const L = {
  pageTitle: locator('Header.title', dataTest('title'), By.css('.title')),
  cartLink: locator('Header.cartLink', dataTest('shopping-cart-link'), By.css('.shopping_cart_link')),
  cartBadge: locator('Header.cartBadge', dataTest('shopping-cart-badge'), By.css('.shopping_cart_badge')),
  menuButton: locator('Header.menu', By.id('react-burger-menu-btn'), By.css('.bm-burger-button button')),
  logoutLink: locator('Menu.logout', dataTest('logout-sidebar-link'), By.id('logout_sidebar_link')),
};

class HeaderComponent extends BasePage {
  getPageTitle() {
    return this.getText(L.pageTitle);
  }

  /** Número del badge del carrito; 0 cuando el badge no existe. */
  async getCartCount() {
    const badges = await this.waits.elements(L.cartBadge, { allowEmpty: true });
    if (badges.length === 0) return 0;
    return Number((await badges[0].getText()).trim()) || 0;
  }

  /** Espera a que el badge muestre el valor esperado y devuelve el valor real para asertar. */
  async waitForCartCount(expected) {
    try {
      await this.waits.condition(async () => {
        try {
          return (await this.getCartCount()) === expected;
        } catch (err) {
          if (err instanceof error.StaleElementReferenceError) return false;
          throw err;
        }
      }, `contador del carrito = ${expected}`);
    } catch (err) {
      if (!(err instanceof error.TimeoutError)) throw err;
    }
    return this.getCartCount();
  }

  async openCart() {
    this.log.info('Abriendo el carrito');
    await this.click(L.cartLink);
  }

  async logout() {
    this.log.info('Cerrando sesión');
    await this.click(L.menuButton);
    await this.click(L.logoutLink);
  }
}

module.exports = HeaderComponent;
