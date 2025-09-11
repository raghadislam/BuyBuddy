import Arena from "bull-arena";
import env from "../config/env.config";

const arena = Arena(
  {
    BullMQ: require("bullmq").Queue,
    queues: [
      {
        type: "bullmq",
        name: "emailQ",
        hostId: "server",
        redis: { url: env.REDIS_QUEUE_URL },
      },
      {
        type: "bullmq",
        name: "notificationQ",
        hostId: "server",
        redis: { url: env.REDIS_QUEUE_URL },
      },
    ],
  },
  {
    basePath: "/arena",
    disableListen: true,
  }
);

export default arena;
