import { createLogger, format, transports } from "winston";

const consoleFormat = format.combine(
  format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  format.errors({ stack: true }),
  format.splat(),
  format.colorize(),
  format.printf(({ timestamp, level, message, stack }) => {
    return `${timestamp} [${level}] ${message}${stack ? `\n${stack}` : ""}`;
  }),
);

const logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json(),
  ),

  defaultMeta: {
    service: process.env.SERVICE_NAME || "api",
    environment: process.env.NODE_ENV,
  },

  transports: [
    new transports.Console({
      format: consoleFormat,
    }),
  ],

  exitOnError: false,
});

export default logger;
