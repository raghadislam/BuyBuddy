import { Worker } from "bullmq";
import { notificationProcessor } from "./notification.processor";
import { connection } from "./notification.queue";
import logger from "../../config/logger.config";

const concurrency = 5;

export function notificationWorker() {
  const worker = new Worker("notificationQ", notificationProcessor, {
    connection,
    concurrency,
  });

  worker.on("completed", (job) => {
    logger.info(`Notification job completed (${job.id})`);
  });

  worker.on("failed", (job, err) => {
    logger.error("Notification job failed:", job?.id, err);
  });

  process.on("SIGINT", async () => {
    logger.info(`Notification worker stopped`);
    await worker.close();
    process.exit(0);
  });
}
