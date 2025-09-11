import { Job } from "bullmq";
import { emailQueue } from "./queue";
import { EmailJobPayload } from "./type";

const REMOVE_CONFIG = {
  removeOnComplete: false, // 1 hour
  removeOnFail: false, // 1 day
};

export async function addEmailJob(
  name: string,
  data: EmailJobPayload
): Promise<Job> {
  return await emailQueue.add(name, data, {
    ...REMOVE_CONFIG,
    attempts: 50,
    backoff: { type: "exponential", delay: 1000 },
  });
}
