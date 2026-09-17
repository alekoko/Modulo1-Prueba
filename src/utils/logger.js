'use strict';
/***/
const fs = require('fs');
const path = require('path');
const { createLogger, format, transports } = require('winston');
const config = require('../../config');

fs.mkdirSync(config.paths.logs, { recursive: true });

const worker = () => `W${process.env.CUCUMBER_WORKER_ID || '0'}`;

const line = format.printf(({ timestamp, level, message, scope, stack }) => {
  const scopeTag = scope ? ` [${scope}]` : '';
  return `${timestamp} ${level} [${worker()}]${scopeTag} ${stack || message}`;
});

module.exports = createLogger({
  level: config.logLevel,
  format: format.combine(format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }), format.errors({ stack: true })),
  transports: [
    new transports.Console({ format: format.combine(format.colorize(), line) }),
    new transports.File({ filename: path.join(config.paths.logs, 'execution.log'), format: line, maxsize: 5 * 1024 * 1024, maxFiles: 5 }),
    new transports.File({ filename: path.join(config.paths.logs, 'errors.log'), level: 'error', format: line }),
  ],
});
