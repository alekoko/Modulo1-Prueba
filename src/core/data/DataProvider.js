'use strict';
/**
 * PATRÓN DATA-DRIVEN
 * ------------------
 * Única puerta de acceso a los datos de prueba (test-data/*.json).
 * Los features solo contienen CLAVES ("standard", "valid_customer", "multiples_productos");
 * este proveedor las traduce a los datos reales. Así un mismo escenario se ejecuta
 * con distintos datos cambiando la tabla Examples o el JSON, sin tocar código.
 *
 * archivo JSON por dominio: users, customers, catalog, messages.
 * "${VARIABLE:defecto}" variables de entorno.
 * error de claves disponibles
 */
const fs = require('fs');
const path = require('path');

const FILES = Object.freeze({
  users: 'users.json',
  customers: 'customers.json',
  catalog: 'catalog.json',
  messages: 'messages.json',
});

const ENV_PLACEHOLDER = /\$\{(\w+)(?::([^}]*))?\}/g; // expresion regular

const interpolateEnv = (value) => {
  if (typeof value === 'string') return value.replace(ENV_PLACEHOLDER, (_, name, fallback = '') => process.env[name] ?? fallback);
  if (Array.isArray(value)) return value.map(interpolateEnv);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, interpolateEnv(v)]));
  return value;
};

const pick = (data, key, source) => {
  if (key.startsWith('_') || !Object.prototype.hasOwnProperty.call(data, key)) {
    const available = Object.keys(data).filter((k) => !k.startsWith('_'));
    throw new Error(`"${key}" no está definido en ${source}. Disponibles: ${available.join(', ')}`);
  }
  return data[key];
};

class DataProvider {
  /** @param {string} dataDir carpeta de datos (inyectada desde la configuración) */
  constructor(dataDir) {
    this.dataDir = dataDir;
    this.cache = new Map();
  }

  load(file) {
    if (!this.cache.has(file)) {
      const fullPath = path.join(this.dataDir, file);
      if (!fs.existsSync(fullPath)) throw new Error(`Archivo de datos no encontrado: ${fullPath}`);
      try {
        this.cache.set(file, interpolateEnv(JSON.parse(fs.readFileSync(fullPath, 'utf8'))));
      } catch (err) {
        throw new Error(`JSON inválido en ${file}: ${err.message}`);
      }
    }
    return this.cache.get(file);
  }

  /** @returns {{alias:string, username:string, password:string}} */
  getUser(alias) {
    const user = pick(this.load(FILES.users), alias, FILES.users);
    return { alias, username: user.username ?? '', password: user.password ?? '' };
  }

  /** @returns {{firstName:string, lastName:string, postalCode:string}} */
  getCustomer(id) {
    const { firstName = '', lastName = '', postalCode = '' } = pick(this.load(FILES.customers), id, FILES.customers);
    return { firstName, lastName, postalCode };
  }

  /** @returns {string[]} nombres de productos */
  getProductSet(key) {
    const set = pick(this.load(FILES.catalog).productSets, key, `${FILES.catalog} > productSets`);
    if (!Array.isArray(set) || set.length === 0) throw new Error(`El set "${key}" de ${FILES.catalog} está vacío`);
    return [...set];
  }

  /** @returns {{value:string, field:'name'|'price', direction:'asc'|'desc'}} */
  getSortOption(label) {
    return pick(this.load(FILES.catalog).sortOptions, label, `${FILES.catalog} > sortOptions`);
  }

  getTaxRate() {
    return Number(this.load(FILES.catalog).taxRate);
  }

  /** @param {string} key ruta con puntos, ej. "login.lockedOut" */
  getMessage(key) {
    const value = key.split('.').reduce((node, part) => node?.[part], this.load(FILES.messages));
    if (typeof value !== 'string') throw new Error(`Mensaje "${key}" no definido en ${FILES.messages}`);
    return value;
  }
}

module.exports = DataProvider;
