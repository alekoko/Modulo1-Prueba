'use strict';

const COMPARATORS = {
  name: (a, b) => a.localeCompare(b, 'en'),
  price: (a, b) => a - b,
};

/** Copia ordenada el campo y la dirección definidos en catalog.json */
function sortedCopy(values, field, direction = 'asc') {
  const comparator = COMPARATORS[field];
  if (!comparator) throw new Error(`Campo de ordenamiento no soportado: "${field}"`);
  const sorted = [...values].sort(comparator);
  return direction === 'desc' ? sorted.reverse() : sorted;
}

module.exports = { sortedCopy };
