'use strict';
const { Then } = require('@cucumber/cucumber');
const { expect } = require('chai');

Then('debería visualizar el mensaje de error {string}', async function (messageKey) {
  const expected = this.data.getMessage(messageKey);
  expect(await this.pages.login.getErrorMessage(), 'Mensaje de error mostrado').to.equal(expected);
});
