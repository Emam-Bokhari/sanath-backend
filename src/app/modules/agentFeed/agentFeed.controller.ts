import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { AgentFeedServices } from "./agentFeed.service";

const createOrUpdateAgentFeed = catchAsync(async (req, res) => {
  const data = req.body;
  const { id: agentId } = req.user as { id: string };
  const feed = await AgentFeedServices.createAgentFeedServiceToDB(data, agentId);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Feed saved successfully",
    data: feed,
  });
});

const getAgentFeed = catchAsync(async (req, res) => {
  const { id: agentId } = req.user as { id: string };
  const feed = await AgentFeedServices.getAgentFeedServiceFromDB(agentId);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Feed retrieved successfully",
    data: feed,
  });
});

const triggerFeedSync = catchAsync(async (req, res) => {
  const { id: agentId } = req.user as { id: string };
  const result = await AgentFeedServices.triggerFeedSyncService(agentId);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Feed sync triggered successfully",
    data: result,
  });
});

export const AgentFeedControllers = {
  createOrUpdateAgentFeed,
  getAgentFeed,
  triggerFeedSync,
};
