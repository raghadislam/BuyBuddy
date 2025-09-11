import { Worker } from "bullmq";
import { emailProcessor } from "./email.processor";
import { connection } from "../queue";
import logger from "../../config/logger.config";

const concurrency = 5;

export function emailWorker() {
  const worker = new Worker("emailQ", emailProcessor, {
    connection,
    concurrency,
  });

  worker.on("completed", (job) => {
    logger.info(`Email job completed (${job.id})`);
  });
  worker.on("failed", (job, err) => {
    logger.error("Email job failed:", job?.id, err);
  });

  // graceful shutdown handlers
  process.on("SIGINT", async () => {
    logger.info(`Email worker stopped`);

    await worker.close();
    process.exit(0);
  });
}
