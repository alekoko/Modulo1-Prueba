'use strict';

const { By } = require('selenium-webdriver');

const locator = (name, ...strategies) => Object.freeze({ name, strategies: Object.freeze(strategies) });

/** Selector por atributo data-test. */
const dataTest = (value) => By.css(`[data-test="${value}"]`);

/** "Sauce Labs. */
const toSlug = (text) => String(text).trim().toLowerCase().replace(/\s+/g, '-');

/** Literal XPath seguro aunque el texto tenga comillas. */
const xpathLiteral = (text) => {
  const value = String(text);
  if (!value.includes('"')) return `"${value}"`;
  if (!value.includes("'")) return `'${value}'`;
  return `concat("${value.replace(/"/g, '", \'"\', "')}")`;
};

module.exports = { By, locator, dataTest, toSlug, xpathLiteral };
