import { Queue } from "bullmq";
import env from "../../config/env.config";

export const connection = { url: env.REDIS_QUEUE_URL };

export const emailQueue = new Queue("emailQ", { connection });
