'use strict';
const { When, Then } = require('@cucumber/cucumber');
const { expect } = require('chai');
const DataLoader = require('../core/utils/DataLoader');

Then('debería visualizar el catálogo de productos', async function () {
  const { inventory, header } = this.pages;
  expect(await inventory.isLoaded(), 'La página de inventario no cargó').to.equal(true);
  expect(await header.getPageTitle()).to.equal(DataLoader.getMessage('inventory.title'));
  expect(await inventory.getProductNames(), 'El catálogo no contiene productos').to.not.be.empty;
});

When('ordena los productos por {string}', async function (criteria) {
  await this.pages.inventory.sortBy(DataLoader.getSortOption(criteria).value);
});

Then('los productos deberían mostrarse ordenados por {string}', async function (criteria) {
  
});

When('agrega al carrito los productos del set {string}', async function (setKey) {
  const products = DataLoader.getProductSet(setKey);
  const prices = { ...this.context.getOrDefault(Keys.INVENTORY_PRICES, {}) };
  for (const product of products) {
    prices[product] = await this.pages.inventory.getPriceOf(product);
    await this.pages.inventory.addProduct(product);
  }
  const current = this.context.getOrDefault(Keys.CART_PRODUCTS, []);
  this.context.set(Keys.CART_PRODUCTS, [...new Set([...current, ...products])]);
  this.context.set(Keys.INVENTORY_PRICES, prices);
});

Then('los productos agregados deberían mostrar la opción de remover', async function () {

});

When('remueve del inventario los productos agregados', async function () {

});

Then('el contador del carrito debería reflejar los productos en el carrito', async function () {

});

Then('el carrito debería estar vacío', async function () {
  expect(await this.pages.header.waitForCartCount(0), 'El carrito debería estar vacío').to.equal(0);
});
