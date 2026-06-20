import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiErrors";
import { AgentFeed } from "./agentFeed.model";
import { Types } from "mongoose";
import { feedSyncQueue } from "../../../queues";

const createAgentFeedServiceToDB = async (
  payload: { feedUrl: string; name?: string },
  agentId: string,
) => {
  // Find existing feed or create new one
  const feed = await AgentFeed.findOneAndUpdate(
    { agentId: new Types.ObjectId(agentId) },
    { ...payload, isActive: true },
    { new: true, upsert: true },
  );

  // Add initial feed sync to queue
  try {
    await feedSyncQueue.add("singleFeedSync", {
      feedId: feed._id.toString(),
      feed: feed,
    });
  } catch (error) {
    console.error("Error adding feed sync to queue:", error);
  }

  return feed;
};

const getAgentFeedServiceFromDB = async (agentId: string) => {
  const feed = await AgentFeed.findOne({
    agentId: new Types.ObjectId(agentId),
  });
  return feed;
};

const triggerFeedSyncService = async (agentId: string) => {
  const feed = await getAgentFeedServiceFromDB(agentId);

  if (!feed) {
    throw new ApiError(StatusCodes.NOT_FOUND, "No feed found for this agent");
  }

  // Add single feed sync job to queue
  const job = await feedSyncQueue.add("singleFeedSync", {
    feedId: feed._id.toString(),
    feed: feed,
  });

  return {
    jobId: job.id,
    status: "queued",
    message: "Feed sync added to queue",
  };
};

export const AgentFeedServices = {
  createAgentFeedServiceToDB,
  getAgentFeedServiceFromDB,
  triggerFeedSyncService,
};
