import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { AgentFeedServices } from "./agentFeed.service";

const createAgentFeed = catchAsync(async (req, res) => {
  const data = req.body;
  const { id: agentId } = req.user as { id: string };
  const feed = await AgentFeedServices.createAgentFeedServiceToDB(data, agentId);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Feed created successfully",
    data: feed,
  });
});

const getMyAgentFeeds = catchAsync(async (req, res) => {
  const { id: agentId } = req.user as { id: string };
  const query = req.query;
  const feeds = await AgentFeedServices.getMyAgentFeedsServiceFromDB(agentId, query);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Feeds retrieved successfully",
    data: feeds,
  });
});

const getAgentFeedById = catchAsync(async (req, res) => {
  const { id: agentId } = req.user as { id: string };
  const { feedId } = req.params;
  const feed = await AgentFeedServices.getAgentFeedByIdServiceFromDB(feedId, agentId);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Feed retrieved successfully",
    data: feed,
  });
});

const updateAgentFeed = catchAsync(async (req, res) => {
  const { id: agentId } = req.user as { id: string };
  const { feedId } = req.params;
  const data = req.body;
  const feed = await AgentFeedServices.updateAgentFeedServiceToDB(feedId, data, agentId);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Feed updated successfully",
    data: feed,
  });
});

const deleteAgentFeed = catchAsync(async (req, res) => {
  const { id: agentId } = req.user as { id: string };
  const { feedId } = req.params;
  await AgentFeedServices.deleteAgentFeedServiceFromDB(feedId, agentId);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Feed deleted successfully",
  });
});

const triggerFeedSync = catchAsync(async (req, res) => {
  const { id: agentId } = req.user as { id: string };
  const { feedId } = req.params;
  const result = await AgentFeedServices.triggerFeedSyncService(feedId, agentId);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Feed sync triggered successfully",
    data: result,
  });
});

export const AgentFeedControllers = {
  createAgentFeed,
  getMyAgentFeeds,
  getAgentFeedById,
  updateAgentFeed,
  deleteAgentFeed,
  triggerFeedSync,
};
