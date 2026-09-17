'use strict';

/** Extrae último número de un texto*/
function parseCurrency(text) {
  const matches = String(text).match(/-?\d+(?:[.,]\d+)?/g);
  if (!matches) throw new Error(`No se encontró un valor numérico en "${text}"`);
  return Number(matches[matches.length - 1].replace(',', '.'));
}

const round2 = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

module.exports = { parseCurrency, round2 };
