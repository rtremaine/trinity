import pino from "pino";
import { env } from "@/env";

const globalForLogger = globalThis as unknown as {
  logger: pino.Logger | undefined;
};

export const logger =
  globalForLogger.logger ??
  pino({
    level: env.LOG_LEVEL,
    base: { env: env.NODE_ENV },
    redact: {
      paths: [
        "password",
        "passwordHash",
        "*.password",
        "*.passwordHash",
        "req.headers.authorization",
        "req.headers.cookie",
      ],
      censor: "[REDACTED]",
    },
    ...(env.NODE_ENV === "development"
      ? {
          transport: {
            target: "pino-pretty",
            options: { colorize: true, translateTime: "SYS:HH:MM:ss" },
          },
        }
      : {}),
  });

if (env.NODE_ENV !== "production") globalForLogger.logger = logger;
