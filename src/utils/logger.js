import winston from "winston";
import config from "../config/config.js";

const customLevelsOptions = {
  levels: {
    fatal: 0,
    error: 1,
    warning: 2,
    info: 3,
    http: 4,
    debug: 5,
  },
  colors: {
    fatal: "magenta",
    error: "red",
    warning: "yellow",
    http: "cyan",
    info: "blue",
    debug: "green",
  },
};

const devLogger = winston.createLogger({
  levels: customLevelsOptions.levels,
  transports: [
    new winston.transports.Console({
      level: "debug",
      format: winston.format.combine(winston.format.colorize({ colors: customLevelsOptions.colors }), winston.format.simple()),
    }),
  ],
});

const prodLogger = winston.createLogger({
  levels: customLevelsOptions.levels,
  transports: [
    new winston.transports.Console({
      level: "info",
      format: winston.format.combine(winston.format.colorize({ colors: customLevelsOptions.colors }), winston.format.simple()),
    }),
    new winston.transports.File({
      filename: "./src/logs/errors.log",
      level: "error",
      format: winston.format.simple(),
    }),
  ],
});

const node_env = config.NODE_ENV || "DEVELOPMENT";

export const addLogger = (req, res, next) => {
  if (node_env == "DEVELOPMENT") {
    req.logger = devLogger;
  } else if (node_env == "PRODUCTION") {
    req.logger = prodLogger;
  }
  next();
};
