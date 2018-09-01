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

module.exports = (loggerName, options = {}) => {
  const opts = {...options, logger: loggerName };
  if (!Object.keys(pino.levels).includes(opts.level)) {
    Reflect.deleteProperty(opts, 'level');
  }

  const log = logBase.child(opts);

  Object.keys(pino.levels.values).forEach((lvl) => {
    const orig = log[lvl];
    log[lvl] = (msg, ...objs) => {
      const objects = { level: lvl };
      if (objs) {
        objs.forEach((obj) => {
          if (typeof obj === 'object' && obj !== null) {
            if (obj instanceof Error) {
              console.log("WTF", obj);
              objects.error = obj;
            } else {
              Object.assign(objects, obj);
            }
          } else {
            msg += ` ${obj}`;
          }
        });
      }
      orig.apply(log, [objects, msg]);
    };
  });

  return log;
};
