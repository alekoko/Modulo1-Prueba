'use strict';
/**
 * Configuración del framework.
 * variables de entorno / .env  >  config/environments.json.
 */
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
require('dotenv').config({ path: path.join(ROOT, '.env') });

const environments = require('./environments.json');

const has = (key) => process.env[key] !== undefined && process.env[key] !== '';
const str = (key, fallback) => (has(key) ? process.env[key] : fallback);
const num = (key, fallback) => (has(key) && Number.isFinite(Number(process.env[key])) ? Number(process.env[key]) : fallback);
const bool = (key, fallback) => (has(key) ? ['true', '1', 'yes', 'y'].includes(process.env[key].toLowerCase()) : fallback);
const list = (key, fallback) => (has(key) ? process.env[key].split(',').map((v) => v.trim()).filter(Boolean) : fallback);

const envName = str('TEST_ENV', 'qa');
const profile = environments[envName];
if (!profile) {
  throw new Error(`Ambiente "${envName}" no definido en config/environments.json. Disponibles: ${Object.keys(environments).join(', ')}`);
}

const reportsDir = path.join(ROOT, str('REPORTS_DIR', 'reports'));

const deepFreeze = (obj) => {
  Object.values(obj).forEach((value) => value && typeof value === 'object' && deepFreeze(value));
  return Object.freeze(obj);
};

module.exports = deepFreeze({
  root: ROOT,
  env: envName,
  baseUrl: str('BASE_URL', profile.baseUrl),
  browser: {
    name: str('BROWSER', profile.browser.name).toLowerCase(),
    headless: bool('HEADLESS', profile.browser.headless),
    width: num('BROWSER_WIDTH', profile.browser.width),
    height: num('BROWSER_HEIGHT', profile.browser.height),
    remoteUrl: str('SELENIUM_REMOTE_URL', null),
  },
  timeouts: {
    explicit: num('EXPLICIT_WAIT', profile.timeouts.explicit),
    pageLoad: num('PAGE_LOAD_TIMEOUT', profile.timeouts.pageLoad),
    script: num('SCRIPT_TIMEOUT', profile.timeouts.script),
    step: num('STEP_TIMEOUT', profile.timeouts.step),
    polling: num('POLLING_INTERVAL', profile.timeouts.polling),
  },
  retry: {
    attempts: num('RETRY_ATTEMPTS', profile.retry.attempts),
    delayMs: num('RETRY_DELAY_MS', profile.retry.delayMs),
    driverAttempts: num('DRIVER_RETRY_ATTEMPTS', profile.retry.driverAttempts),
  },
  execution: {
    parallel: num('PARALLEL', 1),
    scenarioRetries: num('RETRY', profile.retry.scenarioRetries),
    retryTagFilter: str('RETRY_TAG_FILTER', ''),
    tags: str('TAGS', 'not @wip'),
  },
  evidence: {
    screenshotMode: str('SCREENSHOT_MODE', profile.evidence.screenshotMode).toLowerCase(),
    saveAllToDisk: bool('SAVE_ALL_SCREENSHOTS', profile.evidence.saveAllToDisk),
  },
  paths: {
    data: path.join(ROOT, 'test-data'),
    reports: reportsDir,
    json: path.join(reportsDir, 'json'),
    html: path.join(reportsDir, 'html'),
    dashboard: path.join(reportsDir, 'dashboard'),
    screenshots: path.join(reportsDir, 'screenshots'),
    notifications: path.join(reportsDir, 'notifications'),
    logs: path.join(ROOT, str('LOGS_DIR', 'logs')),
  },
  logLevel: str('LOG_LEVEL', 'info'),
  notification: {
    enabled: bool('NOTIFY_ENABLED', false),
    dryRun: bool('NOTIFY_DRY_RUN', true),
    channels: list('NOTIFY_CHANNELS', ['email', 'slack']),
    email: {
      host: str('SMTP_HOST'),
      port: num('SMTP_PORT', 587),
      secure: bool('SMTP_SECURE', false),
      user: str('SMTP_USER'),
      pass: str('SMTP_PASS'),
      from: str('EMAIL_FROM'),
      to: list('EMAIL_TO', []),
    },
    slack: {
      token: str('SLACK_BOT_TOKEN'),
      channelId: str('SLACK_CHANNEL_ID'),
      webhookUrl: str('SLACK_WEBHOOK_URL'),
    },
  },
});
