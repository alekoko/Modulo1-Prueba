'use strict';
const BasePage = require('./BasePage');
const { By, locator, dataTest, toSlug, xpathLiteral } = require('./locator');
const { parseCurrency } = require('../utils/numbers');

/** XPath de la tarjeta de un producto a partir de su nombre visible. */
const cardByName = (name) =>
  `//div[contains(@class,'inventory_item_description')][.//div[contains(@class,'inventory_item_name') and normalize-space(.)=${xpathLiteral(name)}]]`;

const L = {
  container: locator('Inventory.container', dataTest('inventory-container'), By.id('inventory_container')),
  names: locator('Inventory.names', dataTest('inventory-item-name'), By.css('.inventory_item_name')),
  prices: locator('Inventory.prices', dataTest('inventory-item-price'), By.css('.inventory_item_price')),
  sortSelect: locator('Inventory.sort', dataTest('product-sort-container'), By.css('select.product_sort_container')),

  /* Selectores dinámicos: se construyen con el nombre del producto que viene del JSON */
  addButton: (name) =>
    locator(
      `Inventory.add(${name})`,
      dataTest(`add-to-cart-${toSlug(name)}`),
      By.id(`add-to-cart-${toSlug(name)}`),
      By.xpath(`${cardByName(name)}//button[starts-with(@id,'add-to-cart')]`),
    ),
  removeButton: (name) =>
    locator(
      `Inventory.remove(${name})`,
      dataTest(`remove-${toSlug(name)}`),
      By.id(`remove-${toSlug(name)}`),
      By.xpath(`${cardByName(name)}//button[starts-with(@id,'remove')]`),
    ),
  priceOf: (name) => locator(`Inventory.priceOf(${name})`, By.xpath(`${cardByName(name)}//div[contains(@class,'inventory_item_price')]`)),
};

class InventoryPage extends BasePage {
  get path() {
    return '/inventory.html';
  }

  get readyLocator() {
    return L.container;
  }

  getProductNames() {
    return this.getTexts(L.names);
  }

  async getProductPrices() {
    return (await this.getTexts(L.prices)).map(parseCurrency);
  }

  async getPriceOf(productName) {
    return parseCurrency(await this.getText(L.priceOf(productName)));
  }

  async sortBy(optionValue) {
    this.log.info(`Ordenando productos por "${optionValue}"`);
    await this.selectByValue(L.sortSelect, optionValue);
    await this.waits.condition(
      async () => (await (await this.waits.present(L.sortSelect)).getAttribute('value')) === optionValue,
      `orden "${optionValue}" aplicado`,
    );
  }

  async addProduct(productName) {
    this.log.info(`Agregando "${productName}" al carrito`);
    await this.click(L.addButton(productName));
    await this.waits.visible(L.removeButton(productName));
  }

  async removeProduct(productName) {
    this.log.info(`Removiendo "${productName}" desde el inventario`);
    await this.click(L.removeButton(productName));
    await this.waits.visible(L.addButton(productName));
  }

  isRemoveButtonVisible(productName) {
    return this.isVisible(L.removeButton(productName), 3000);
  }
}

module.exports = InventoryPage;
