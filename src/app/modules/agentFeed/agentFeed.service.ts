import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiErrors";
import { AgentFeed } from "./agentFeed.model";
import { Types } from "mongoose";
import { feedSyncQueue } from "../../../queues";
import { FEED_TYPE } from "./agentFeed.constant";

const createAgentFeedServiceToDB = async (
  payload: {
    feedType?: FEED_TYPE;
    xmlFeedUrl?: string | null;
    blmFeedUrl?: string | null;
    name?: string;
    isActive?: boolean;
  },
  agentId: string,
) => {
  // Check if there's an existing feed
  const existingFeed = await AgentFeed.findOne({ agentId: new Types.ObjectId(agentId) });
  
  // Determine final values
  const finalFeedType = payload.feedType ?? existingFeed?.feedType;
  const finalXmlFeedUrl = payload.xmlFeedUrl ?? existingFeed?.xmlFeedUrl;
  const finalBlmFeedUrl = payload.blmFeedUrl ?? existingFeed?.blmFeedUrl;
  
  // Validate only if we have a feedType to work with
  if (finalFeedType) {
    if ((finalFeedType === FEED_TYPE.XML || finalFeedType === FEED_TYPE.BOTH) && !finalXmlFeedUrl) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "xmlFeedUrl is required");
    }
    if ((finalFeedType === FEED_TYPE.BLM || finalFeedType === FEED_TYPE.BOTH) && !finalBlmFeedUrl) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "blmFeedUrl is required");
    }
  }

  // Prepare update data
  const updateData: any = { ...payload };
  if (!existingFeed) {
    updateData.isActive = true;
  }

  // Find existing feed or create new one, unsetting legacy feedUrl
  const feed = await AgentFeed.findOneAndUpdate(
    { agentId: new Types.ObjectId(agentId) },
    { $set: updateData, $unset: { feedUrl: "" } },
    { new: true, upsert: !existingFeed },
  );

  // Add initial feed sync to queue
  try {
    await feedSyncQueue.add("singleFeedSync", {
      feedId: feed!._id.toString(),
      feed: feed!,
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
