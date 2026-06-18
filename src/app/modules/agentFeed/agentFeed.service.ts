import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiErrors";
import { AgentFeed } from "./agentFeed.model";
import { Types } from "mongoose";
import { feedSyncQueue } from "../../../queues";

const createAgentFeedServiceToDB = async (
  payload: { feedUrl: string; name?: string },
  agentId: string,
) => {
  const existingFeed = await AgentFeed.findOne({
    agentId: new Types.ObjectId(agentId),
    feedUrl: payload.feedUrl,
    isDeleted: { $ne: true },
  });

  if (existingFeed) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Feed URL already exists");
  }

  const feed = await AgentFeed.create({
    ...payload,
    agentId: new Types.ObjectId(agentId),
    isActive: true,
  });

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

const getMyAgentFeedsServiceFromDB = async (
  agentId: string,
  query: Record<string, unknown>,
) => {
  const baseQuery = AgentFeed.find({
    agentId: new Types.ObjectId(agentId),
    isDeleted: { $ne: true },
  });

  // TODO: Add query builder if needed

  const feeds = await baseQuery.sort({ createdAt: -1 });
  return feeds;
};

const getAgentFeedByIdServiceFromDB = async (
  feedId: string,
  agentId: string,
) => {
  const feed = await AgentFeed.findOne({
    _id: feedId,
    agentId: new Types.ObjectId(agentId),
    isDeleted: { $ne: true },
  });

  if (!feed) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Feed not found");
  }

  return feed;
};

const updateAgentFeedServiceToDB = async (
  feedId: string,
  payload: Partial<{ feedUrl: string; name?: string; isActive?: boolean }>,
  agentId: string,
) => {
  const feed = await AgentFeed.findOne({
    _id: feedId,
    agentId: new Types.ObjectId(agentId),
    isDeleted: { $ne: true },
  });

  if (!feed) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Feed not found");
  }

  Object.assign(feed, payload);
  await feed.save();

  return feed;
};

const deleteAgentFeedServiceFromDB = async (
  feedId: string,
  agentId: string,
) => {
  const feed = await AgentFeed.findOne({
    _id: feedId,
    agentId: new Types.ObjectId(agentId),
    isDeleted: { $ne: true },
  });

  if (!feed) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Feed not found");
  }

  (feed as any).isDeleted = true;
  await feed.save();

  return feed;
};

const triggerFeedSyncService = async (feedId: string, agentId: string) => {
  const feed = await getAgentFeedByIdServiceFromDB(feedId, agentId);
  
  // Add single feed sync job to queue
  const job = await feedSyncQueue.add("singleFeedSync", {
    feedId: feedId,
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
  getMyAgentFeedsServiceFromDB,
  getAgentFeedByIdServiceFromDB,
  updateAgentFeedServiceToDB,
  deleteAgentFeedServiceFromDB,
  triggerFeedSyncService,
};
