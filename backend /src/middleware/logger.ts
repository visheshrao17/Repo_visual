import pinoHttp from "pino-http";
import { logger } from "../utils/logger";

export const loggerMiddleware = pinoHttp({
  logger,
  customLogLevel: (_req, res, err) => {
    if (err || res.statusCode >= 500) {
      return "error";
    }

    if (res.statusCode >= 400) {
      return "warn";
    }

    return "info";
  }
});
