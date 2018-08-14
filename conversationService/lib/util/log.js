const pino = require('pino');
const { fullStack } = require('verror');
const { inspect } = require('util');

const prettyPrint = String(process.env.NODE_LOGGING).toLowerCase() !== 'production' && String(process.env.NODE_ENV).toLowerCase() !== 'production';

const lvl = String(process.env.LOG_LEVEL).toLowerCase();
const level = Object.keys(pino.levels).includes(lvl) ? lvl : 'info';

const logBase = pino({
  prettyPrint: prettyPrint ? {translateTime: true } : false,
  level,
  safe: true,
  serializers: {
    jse_cause: cause => (cause instanceof Error ? fullStack(cause) : inspect(cause)),
    error: error => (error instanceof Error ? fullStack(error) : inspect(error)),
  },
});

module.exports = (loggerName, opts = {}) => {
  const options = {...opts, logger: loggerName };
  if (!Object.keys(pino.levels).includes(opts.level)) {
    Reflect.deleteProperty(opts, 'level');
  }
  return logBase.child(options);
};
