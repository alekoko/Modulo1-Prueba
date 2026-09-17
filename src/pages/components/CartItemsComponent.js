'use strict';
/** Page Object de la lista de productos del Carrito y Resumen de compra. */
const BasePage = require('../BasePage');
const { By, locator, dataTest } = require('../locator');
const { parseCurrency } = require('../../utils/numbers');

const L = {
  item: locator('CartItems.item', dataTest('inventory-item'), By.css('.cart_item')),
  name: locator('CartItems.name', dataTest('inventory-item-name'), By.css('.inventory_item_name')),
  price: locator('CartItems.price', dataTest('inventory-item-price'), By.css('.inventory_item_price')),
};

class CartItemsComponent extends BasePage {
  /** @returns {Promise<{name:string, price:number}[]>} */
  getItems() {
    return this.retry(async () => {
      const rows = await this.waits.elements(L.item, { allowEmpty: true });
      return Promise.all(
        rows.map(async (row) => ({
          name: await this.childText(row, L.name),
          price: parseCurrency(await this.childText(row, L.price)),
        })),
      );
    }, 'leer productos del carrito');
  }

  async getNames() {
    return (await this.getItems()).map((item) => item.name);
  }

  waitForCount(expected) {
    return this.waits.condition(async () => (await this.count(L.item)) === expected, `cantidad de productos = ${expected}`);
  }
}

module.exports = CartItemsComponent;
