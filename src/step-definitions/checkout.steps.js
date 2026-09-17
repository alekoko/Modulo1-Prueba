'use strict';
const { When, Then } = require('@cucumber/cucumber');
const { expect } = require('chai');
const DataLoader = require('../core/utils/DataLoader');


When('completa la información de envío con el cliente {string}', async function (customerId) {
  const page = this.pages.checkoutInformation;
  await page.fillForm(DataLoader.getCustomer(customerId));
  await page.continue();
});

Then('debería permanecer en el paso de información de envío', async function () {
  expect(await this.pages.checkoutInformation.isLoaded(), 'Se abandonó el paso de información').to.equal(true);
});

Then('el resumen debería listar los productos agregados', async function () {

});

Then('el subtotal debería corresponder a la suma de los precios', async function () {

});

Then('el total debería corresponder al subtotal más impuestos', async function () {

});

When('finaliza la compra', async function () {
  await this.pages.checkoutOverview.finish();
});

Then('debería visualizar la confirmación de la orden', async function () {

});

When('regresa al inventario', async function () {
  await this.pages.checkoutComplete.backHome();
  expect(await this.pages.inventory.isLoaded(), 'No se regresó al inventario').to.equal(true);
});
