'use strict';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * @template T
 * @param {(attempt:number) => Promise<T>} operation
 * @param {{attempts?:number, delayMs?:number, retryOn?:(e:Error)=>boolean, label?:string, logger?:object}} [options]
 * @returns {Promise<T>}
 */
async function withRetry(operation, { attempts = 3, delayMs = 500, retryOn = () => true, label = 'operación', logger } = {}) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await operation(attempt);
    } catch (err) {
      lastError = err;
      if (attempt === attempts || !retryOn(err)) break;
      logger?.warn(`↻ Reintento ${attempt}/${attempts - 1} de "${label}" tras ${err.name}: ${String(err.message).split('\n')[0]}`);
      await sleep(delayMs * attempt);
    }
  }
  throw lastError;
}

module.exports = { withRetry, sleep };
