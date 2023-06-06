const pino = require("pino");
const pinoHttp = require("pino-http");

const defaults = {
  pino: {
    redact: {
      paths: [
        "req.headers.authorization",
        "req.headers.cookie",
      ],
      censor: "<HIDDEN>",
    },
    destination: { sync: false, minLength: 4096 },
    formatters: { // ensure the log line is { "level": "info", ... }, rather than { "level": 30, ... }
      level: function (label) {
        return { level: label };
      },
    },
  },
  pinoHttp: {
    customLogLevel: function (res, err) {
      if (res.statusCode >= 400 && res.statusCode < 500) {
        return "warn";
      } else if (res.statusCode >= 500 || err) {
        return "error";
      } else if (res.statusCode >= 300 && res.statusCode < 400) {
        return "silent";
      }
      return "info";
    },
  },
};

module.exports = anatomic;
module.exports.middleware = middleware;
module.exports.createLogger = createLogger;
module.exports.createMiddleware = createMiddleware;

function anatomic() {
  let logger;

  function start({ config, pkg = {} }) {
    logger = createLogger({ name: pkg.name, ...config });

    return logger;
  }

  return { start };
}

function middleware() {
  function start({ app, config, logger }) {
    if (!app) throw new Error("app is required");
    if (!logger) throw new Error("logger is required");

    app.use(createMiddleware(logger, config));
  }

  return { start };
}

function createLogger(config = {}) {
  const opts = { ...defaults.pino, ...config };
  const logger = pino(opts, pino.destination(opts.destination));
  logger.middleware = (cfg) => createMiddleware(logger, cfg);

  return logger;
}

function createMiddleware(logger, config = {}) {
  logger = logger || createLogger();
  const opts = { logger, ...defaults.pinoHttp, ...config };
  return pinoHttp(opts);
}
