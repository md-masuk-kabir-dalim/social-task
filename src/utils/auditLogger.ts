import { createLogger, format, transports } from "winston";

// -------------------- Console-only audit logger --------------------
const auditLogger = createLogger({
  level: "warn",
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.json(),
  ),
  transports: [new transports.Console()],
  exitOnError: false,
});

// -------------------- Export function --------------------
export const logSecurityEvent = (
  event: string,
  meta: Record<string, any> = {},
) => {
  auditLogger.warn({ event, ...meta });
};
