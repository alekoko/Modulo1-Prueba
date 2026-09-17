'use strict';
/** localizadores de cada Page Object. */
const { By } = require('selenium-webdriver');

/** respaldo. */
const locator = (name, ...strategies) => Object.freeze({ name, strategies: Object.freeze(strategies) });

/** Selector por atributo data-test. */
const dataTest = (value) => By.css(`[data-test="${value}"]`);

const toSlug = (text) => String(text).trim().toLowerCase().replace(/\s+/g, '-');

const xpathLiteral = (text) => {
  const value = String(text);
  if (!value.includes('"')) return `"${value}"`;
  if (!value.includes("'")) return `'${value}'`;
  return `concat("${value.replace(/"/g, '", \'"\', "')}")`;
};

module.exports = { By, locator, dataTest, toSlug, xpathLiteral };
