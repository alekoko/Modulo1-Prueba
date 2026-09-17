'use strict';
const { When, Then } = require('@cucumber/cucumber');
const { expect } = require('chai');
const { ContextKeys } = require('../context/ScenarioContext');
const { sortedCopy } = require('../utils/sorting');

Then('debería visualizar el catálogo de productos', async function () {
  expect(await this.pages.inventory.isLoaded(), 'La página de inventario no cargó').to.equal(true);
  expect(await this.pages.header.getPageTitle()).to.equal(this.data.getMessage('inventory.title'));
  expect(await this.pages.inventory.getProductNames(), 'El catálogo no tiene productos').to.not.be.empty;
});

When('ordena los productos por {string}', async function (criteria) {
  await this.pages.inventory.sortBy(this.data.getSortOption(criteria).value);
});

Then('los productos deberían mostrarse ordenados por {string}', async function (criteria) {
  const { field, direction } = this.data.getSortOption(criteria);
  const { inventory } = this.pages;
  const actual = field === 'price' ? await inventory.getProductPrices() : await inventory.getProductNames();
  expect(actual, `Los productos no están ordenados por "${criteria}"`).to.deep.equal(sortedCopy(actual, field, direction));
});

When('agrega al carrito los productos del set {string}', async function (setKey) {
  const products = this.data.getProductSet(setKey);
  const prices = { ...this.context.get(ContextKeys.INVENTORY_PRICES, {}) };

  for (const product of products) {
    prices[product] = await this.pages.inventory.getPriceOf(product);
    await this.pages.inventory.addProduct(product);
  }

  const current = this.context.get(ContextKeys.CART_PRODUCTS, []);
  this.context.set(ContextKeys.CART_PRODUCTS, [...new Set([...current, ...products])]).set(ContextKeys.INVENTORY_PRICES, prices);
});

Then('los productos agregados deberían mostrar la opción de remover', async function () {
  for (const product of this.context.get(ContextKeys.CART_PRODUCTS)) {
    expect(await this.pages.inventory.isRemoveButtonVisible(product), `"${product}" no muestra el botón Remove`).to.equal(true);
  }
});

When('remueve del inventario los productos agregados', async function () {
  for (const product of this.context.get(ContextKeys.CART_PRODUCTS)) {
    await this.pages.inventory.removeProduct(product);
  }
  this.context.set(ContextKeys.CART_PRODUCTS, []);
});

Then('el contador del carrito debería reflejar los productos en el carrito', async function () {
  const expected = this.context.get(ContextKeys.CART_PRODUCTS).length;
  expect(await this.pages.header.waitForCartCount(expected), 'Contador del carrito').to.equal(expected);
});

Then('el carrito debería estar vacío', async function () {
  expect(await this.pages.header.waitForCartCount(0), 'El carrito debería estar vacío').to.equal(0);
});
