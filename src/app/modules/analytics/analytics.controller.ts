import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { AnalyticsServices } from "./analytics.service";

const getAgentDashboardStats = catchAsync(async (req, res) => {
  const { id: agentId } = req.user as { id: string };
  const result = await AnalyticsServices.getAgentDashboardStats(agentId);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Agent dashboard stats retrieved successfully",
    data: result,
  });
});

const getAdminStats = catchAsync(async (req, res) => {
  const result = await AnalyticsServices.getAdminStatsFromDB();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Admin Stats retrieved Successfully",
    data: result,
  });
});

const getAgentEnquiryStats = catchAsync(async (req, res) => {
  const { id: agentId } = req.user as { id: string };
  const { year } = req.query;
  const result = await AnalyticsServices.getAgentEnquiryStatsFromDB(
    agentId,
    year as string,
  );

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Agent enquiry stats retrieved successfully",
    data: result,
  });
});

const getUserManagementStats = catchAsync(async (req, res) => {
  const { role } = req.query;
  const result = await AnalyticsServices.getUserManagementStatsFromDB(
    role as string,
  );

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Dashboard stats retrieved successfully",
    data: result,
  });
});

const getRevenueStats = catchAsync(async (req, res) => {
  const result = await AnalyticsServices.getRevenueStatsFromDB();

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Revenue stats retrieved successfully",
    data: result,
  });
});

const getMonthlyRevenueStats = catchAsync(async (req, res) => {
  const { year } = req.query;
  const result = await AnalyticsServices.getMonthlyRevenueStatsFromDB(
    year as string,
  );

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Monthly revenue stats retrieved successfully",
    data: result,
  });
});

const getMonthlyUserStats = catchAsync(async (req, res) => {
  const { year } = req.query;
  const result = await AnalyticsServices.getMonthlyUserStatsFromDB(
    year as string,
  );

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Monthly user stats retrieved successfully",
    data: result,
  });
});

const getMonthlyAgentStats = catchAsync(async (req, res) => {
  const { year } = req.query;
  const result = await AnalyticsServices.getMonthlyAgentStatsFromDB(
    year as string,
  );

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Monthly agent stats retrieved successfully",
    data: result,
  });
});

const getOverviewStats = catchAsync(async (req, res) => {
  const result = await AnalyticsServices.getOverviewStatsFromDB();

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Overview stats retrieved successfully",
    data: result,
  });
});

export const AnalyticsControllers = {
  getAgentDashboardStats,
  getAdminStats,
  getAgentEnquiryStats,
  getUserManagementStats,
  getRevenueStats,
  getMonthlyRevenueStats,
  getMonthlyUserStats,
  getMonthlyAgentStats,
  getOverviewStats,
};
