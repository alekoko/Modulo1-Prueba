'use strict';
const { When, Then } = require('@cucumber/cucumber');
const { expect } = require('chai');
const { ContextKeys } = require('../context/ScenarioContext');

When('abre el carrito de compras', async function () {
  await this.pages.header.openCart();
  expect(await this.pages.cart.isLoaded(), 'La página del carrito no cargó').to.equal(true);
});

Then('el carrito debería contener los productos agregados', async function () {
  const expected = this.context.get(ContextKeys.CART_PRODUCTS);
  await this.pages.cartItems.waitForCount(expected.length);
  expect(await this.pages.cartItems.getNames()).to.have.members(expected);
});

Then('los precios en el carrito deberían coincidir con los del inventario', async function () {
  const inventoryPrices = this.context.get(ContextKeys.INVENTORY_PRICES);
  for (const { name, price } of await this.pages.cartItems.getItems()) {
    expect(price, `Precio de "${name}" en el carrito`).to.equal(inventoryPrices[name]);
  }
});

When('remueve del carrito el primer producto agregado', async function () {
  const [removed, ...remaining] = this.context.get(ContextKeys.CART_PRODUCTS);
  await this.pages.cart.removeProduct(removed);
  this.context.set(ContextKeys.REMOVED_PRODUCT, removed).set(ContextKeys.CART_PRODUCTS, remaining);
});

Then('el carrito no debería contener el producto removido', async function () {
  await this.pages.cartItems.waitForCount(this.context.get(ContextKeys.CART_PRODUCTS).length);
  expect(await this.pages.cartItems.getNames()).to.not.include(this.context.get(ContextKeys.REMOVED_PRODUCT));
});

When('continúa comprando', async function () {
  await this.pages.cart.continueShopping();
});

When('procede al checkout', async function () {
  await this.pages.cart.checkout();
  expect(await this.pages.checkoutInformation.isLoaded(), 'No se abrió el formulario de checkout').to.equal(true);
});
