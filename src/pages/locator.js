'use strict';
/**
 * localizadores de cada Page Object.
 */
const { By } = require('selenium-webdriver');

/** Localizador con nombre y estrategias de respaldo. */
const locator = (name, ...strategies) => Object.freeze({ name, strategies: Object.freeze(strategies) });

/** Selector por atributo data-test. */
const dataTest = (value) => By.css(`[data-test="${value}"]`);

/** "Sauce Labs Bolt T-Shirt" -> "sauce-labs-bolt-t-shirt" (convención de data-test del sitio). */
const toSlug = (text) => String(text).trim().toLowerCase().replace(/\s+/g, '-');

/** Literal XPath seguro aunque el texto tenga comillas. */
const xpathLiteral = (text) => {
  const value = String(text);
  if (!value.includes('"')) return `"${value}"`;
  if (!value.includes("'")) return `'${value}'`;
  return `concat("${value.replace(/"/g, '", \'"\', "')}")`;
};

module.exports = { By, locator, dataTest, toSlug, xpathLiteral };
