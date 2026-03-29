import { app } from "./app";
import { env } from "./config/env";
import { logger } from "./utils/logger";
import { startLogWorker } from "./queue/logQueue";

const server = app.listen(env.PORT, () => {
  logger.info(`Server running on port ${env.PORT}`);
});

startLogWorker();

const shutdown = async () => {
  logger.info("Received shutdown signal");
  server.close(() => {
    logger.info("HTTP server closed");
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
