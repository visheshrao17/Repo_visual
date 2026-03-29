import { Queue, Worker } from "bullmq";
import { prisma } from "../config/db";
import { githubService } from "../integrations/github";
import { parseZipLogs } from "../utils/logParser";
import { logger } from "../utils/logger";
import { getRedisConnection } from "./redis";

const queueName = "fetch-run-logs";
const redis = getRedisConnection();

export const logQueue = redis ? new Queue(queueName, { connection: redis }) : null;

export const enqueueLogFetch = async (runId: string) => {
  if (!logQueue) {
    logger.warn("Log queue skipped because REDIS_URL is not configured");
    return;
  }

  await logQueue.add("fetch", { runId }, { attempts: 3, backoff: { type: "exponential", delay: 1000 } });
};

export const startLogWorker = () => {
  if (!redis) {
    logger.warn("Log worker not started because REDIS_URL is not configured");
    return null;
  }

  const worker = new Worker(
    queueName,
    async (job) => {
      const run = await prisma.workflowRun.findUnique({
        where: { id: job.data.runId },
        include: {
          workflow: {
            include: {
              repository: {
                include: {
                  user: true
                }
              }
            }
          }
        }
      });

      if (!run) {
        logger.warn({ runId: job.data.runId }, "Run not found for log processing");
        return;
      }

      const { owner, repoName } = run.workflow.repository;
      const accessToken = run.workflow.repository.user.accessToken;
      const zipBuffer = await githubService.downloadLogs(owner, repoName, run.githubRunId, accessToken);
      const parsed = await parseZipLogs(zipBuffer);

      await prisma.log.create({
        data: {
          runId: run.id,
          content: parsed
        }
      });

      logger.info({ runId: run.id }, "Logs fetched and stored");
    },
    {
      connection: redis,
      concurrency: 2
    }
  );

  worker.on("failed", (job, error) => {
    logger.error({ runId: job?.data.runId, err: error }, "Failed to process logs job");
  });

  return worker;
};
