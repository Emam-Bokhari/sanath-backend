import { connection, defaultJobOptions } from "../../config/bull";
import { Queue } from "bullmq";

export const feedSyncQueue = new Queue("feedSyncQueue", {
  connection,
  defaultJobOptions,
});
