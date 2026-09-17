'use strict';
const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('chai');

Given('que el usuario navega a la página de login', async function () {
  await this.pages.login.open();
  expect(await this.pages.login.isLoaded(), 'El formulario de login no se mostró').to.equal(true);
});

When('inicia sesión con el usuario {string}', async function (userAlias) {
  await this.pages.login.login(this.data.getUser(userAlias));
});

Given('que el usuario ha iniciado sesión como {string}', async function (userAlias) {
  await this.pages.login.open();
  await this.pages.login.login(this.data.getUser(userAlias));
  expect(await this.pages.inventory.isLoaded(), 'No se accedió al inventario tras el login').to.equal(true);
});

When('cierra la sesión desde el menú lateral', async function () {
  await this.pages.header.logout();
});

Then(/^debería (?:permanecer en|regresar a) la página de login$/, async function () {
  expect(await this.pages.login.isLoaded(), 'No se visualiza la página de login').to.equal(true);
  expect(await this.pages.login.currentUrl()).to.not.include(this.pages.inventory.path);
});
