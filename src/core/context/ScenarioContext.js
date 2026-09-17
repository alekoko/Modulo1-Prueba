'use strict';
/**
 * patron diseño: CONTEXT OBJECT
 *
 * Objeto transporta el estado de UN escenario entre sus pasos.
 * Cucumber (ScenarioContext nuevo) por escenario,
 */
class ScenarioContext {
  #store = new Map();

  set(key, value) {
    this.#store.set(key, value);
    return this;
  }

  /**
   * @param {string} key
   * @param {*} [fallback] si se omite y la clave no existe, se lanza un error descriptivo
   */
  get(key, ...fallback) {
    if (this.#store.has(key)) return this.#store.get(key);
    if (fallback.length > 0) return fallback[0];
    throw new Error(`La clave "${key}" no existe en el contexto del escenario. ¿Se ejecutó el paso que la guarda?`);
  }

  has(key) {
    return this.#store.has(key);
  }
}

const ContextKeys = Object.freeze({
  CART_PRODUCTS: 'cartProducts',
  INVENTORY_PRICES: 'inventoryPrices',
  REMOVED_PRODUCT: 'removedProduct',
  CUSTOMER: 'customer',
});

module.exports = { ScenarioContext, ContextKeys };
