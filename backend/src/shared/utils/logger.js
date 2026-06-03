import { config } from '../../config/index.js';

function formatMessage(level, message, meta) {
  const base = `[${new Date().toISOString()}] ${level.toUpperCase()} ${message}`;
  if (!meta) return base;
  return `${base} ${JSON.stringify(meta)}`;
}

export const logger = {
  info(message, meta) {
    console.log(formatMessage('info', message, meta));
  },
  warn(message, meta) {
    console.warn(formatMessage('warn', message, meta));
  },
  error(message, meta) {
    console.error(formatMessage('error', message, meta));
  },
  debug(message, meta) {
    if (!config.isProduction) {
      console.debug(formatMessage('debug', message, meta));
    }
  },
};
