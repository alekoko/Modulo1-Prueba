'use strict';
const { Then } = require('@cucumber/cucumber');
const { expect } = require('chai');
const DataLoader = require('../core/utils/DataLoader');

Then('debería visualizar el mensaje de error {string}', async function (messageKey) {
  const expected = DataLoader.getMessage(messageKey);
  const actual = await this.pages.errorBanner.getMessage();
  expect(actual, 'Mensaje de error mostrado').to.equal(expected);
});
