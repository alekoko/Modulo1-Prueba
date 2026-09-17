'use strict';
const { When, Then } = require('@cucumber/cucumber');
const { expect } = require('chai');


When('abre el carrito de compras', async function () {
  await this.pages.header.openCart();
  expect(await this.pages.cart.isLoaded(), 'La página del carrito no cargó').to.equal(true);
});

Then('el carrito debería contener los productos agregados', async function () {

});

Then('los precios en el carrito deberían coincidir con los del inventario', async function () {

});

When('remueve del carrito el primer producto agregado', async function () {

});

Then('el carrito no debería contener el producto removido', async function () {

});

When('continúa comprando', async function () {
  await this.pages.cart.continueShopping();
});

When('procede al checkout', async function () {
  await this.pages.cart.checkout();
  expect(await this.pages.checkoutInformation.isLoaded(), 'No se abrió el formulario de checkout').to.equal(true);
});
