import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { AnalyticsService } from "./analytics.service";

const getAgentDashboardStats = catchAsync(async (req, res) => {
  const { id: agentId } = req.user as { id: string };
  const result = await AnalyticsService.getAgentDashboardStats(agentId);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Agent dashboard stats retrieved successfully",
    data: result,
  });
});

export const AnalyticsController = {
  getAgentDashboardStats,
};
