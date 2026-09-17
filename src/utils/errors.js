'use strict';
/** Clasifica errores transitorios para decidir si una operación merece reintento. */
const INTERACTION_ERRORS = new Set([
  'StaleElementReferenceError',
  'ElementClickInterceptedError',
  'ElementNotInteractableError',
  'MoveTargetOutOfBoundsError',
]);

const NETWORK_PATTERN =
  /(ECONNREFUSED|ECONNRESET|ETIMEDOUT|EAI_AGAIN|socket hang up|net::ERR_|ERR_CONNECTION|ERR_NAME_NOT_RESOLVED|Timed out receiving message from renderer)/i;

const isInteractionError = (err) => Boolean(err && INTERACTION_ERRORS.has(err.name));
const isNetworkError = (err) => Boolean(err && NETWORK_PATTERN.test(`${err.name} ${err.message}`));

module.exports = { isInteractionError, isNetworkError };
