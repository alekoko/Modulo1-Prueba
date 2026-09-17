'use strict';
const { When, Then } = require('@cucumber/cucumber');
const { expect } = require('chai');
const { ContextKeys } = require('../context/ScenarioContext');
const { round2 } = require('../utils/numbers');

When('completa la información de envío con el cliente {string}', async function (customerId) {
  const customer = this.data.getCustomer(customerId);
  this.context.set(ContextKeys.CUSTOMER, customer);
  await this.pages.checkoutInformation.fillForm(customer);
  await this.pages.checkoutInformation.continue();
});

Then('debería permanecer en el paso de información de envío', async function () {
  expect(await this.pages.checkoutInformation.isLoaded(), 'Se abandonó el paso de información').to.equal(true);
});

Then('el resumen debería listar los productos agregados', async function () {
  await this.pages.checkoutOverview.waitUntilLoaded();
  expect(await this.pages.cartItems.getNames()).to.have.members(this.context.get(ContextKeys.CART_PRODUCTS));
});

Then('el subtotal debería corresponder a la suma de los precios', async function () {
  await this.pages.checkoutOverview.waitUntilLoaded();
  const items = await this.pages.cartItems.getItems();
  const { subtotal } = await this.pages.checkoutOverview.getTotals();
  expect(subtotal, 'Subtotal vs suma de los productos').to.be.closeTo(round2(items.reduce((sum, i) => sum + i.price, 0)), 0.001);

  const inventoryPrices = this.context.get(ContextKeys.INVENTORY_PRICES, null);
  if (inventoryPrices) {
    items.forEach(({ name, price }) => expect(price, `Precio de "${name}" en el resumen`).to.equal(inventoryPrices[name]));
  }
});

Then('el total debería corresponder al subtotal más impuestos', async function () {
  await this.pages.checkoutOverview.waitUntilLoaded();
  const { subtotal, tax, total } = await this.pages.checkoutOverview.getTotals();
  const taxRate = this.data.getTaxRate();
  expect(tax, `Impuesto (${taxRate * 100}% de ${subtotal})`).to.be.closeTo(round2(subtotal * taxRate), 0.01);
  expect(total, 'Total = subtotal + impuesto').to.be.closeTo(round2(subtotal + tax), 0.001);
});

When('finaliza la compra', async function () {
  await this.pages.checkoutOverview.finish();
});

Then('debería visualizar la confirmación de la orden', async function () {
  expect(await this.pages.checkoutComplete.isLoaded(), 'No se mostró la confirmación de la orden').to.equal(true);
  expect(await this.pages.checkoutComplete.getConfirmationHeader()).to.equal(this.data.getMessage('checkout.completeHeader'));
  this.context.set(ContextKeys.CART_PRODUCTS, []);
});

When('regresa al inventario', async function () {
  await this.pages.checkoutComplete.backHome();
  expect(await this.pages.inventory.isLoaded(), 'No se regresó al inventario').to.equal(true);
});
