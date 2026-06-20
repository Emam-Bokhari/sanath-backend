import { connection } from "../../config/bull";
import { Worker } from "bullmq";
import {
  importAllFeeds,
  importSingleFeed,
} from "../../app/modules/agentFeed/xmlFeedImporter";
import { TAgentFeed } from "../../app/modules/agentFeed/agentFeed.interface";
import { Types } from "mongoose";

export const feedSyncWorker = new Worker(
  "feedSyncQueue",
  async (job) => {
    console.log("🔄 Running feed sync job...", job.data);

    if (job.data.feedId) {
      // Sync single feed
      const feed = job.data.feed as TAgentFeed & { _id: Types.ObjectId };
      await importSingleFeed(feed);
    } else {
      // Sync all feeds
      await importAllFeeds();
    }
  },
  { connection },
);

// events
feedSyncWorker.on("completed", (job) => {
  console.log(`✅ Feed Sync Completed: ${job.id}`);
});

feedSyncWorker.on("failed", (job, error) => {
  console.log(
    `❌ Feed Sync Failed: ${job?.id}, Error Message: ${error.message}`,
  );
});
