import express from "express";
import { isAdmin, isAgent } from "../../../helpers/authHelper";
import { AnalyticsControllers } from "./analytics.controller";
import checkSubscription from "../../middlewares/checkSubscription";

const router = express.Router();

router.get(
  "/agent-stats",
  isAgent,
  checkSubscription(),
  AnalyticsControllers.getAgentDashboardStats,
);

router.get(
  "/agent-enquiry-monthly-stats",
  isAgent,
  checkSubscription(),
  AnalyticsControllers.getAgentEnquiryStats,
);

router.get("/stats", isAdmin, AnalyticsControllers.getAdminStats);

router.get(
  "/user-management-stats",
  isAdmin,
  AnalyticsControllers.getUserManagementStats,
);

router.get("/revenue-stats", isAdmin, AnalyticsControllers.getRevenueStats);

router.get(
  "/revenue-monthly-stats",
  isAdmin,
  AnalyticsControllers.getMonthlyRevenueStats,
);

router.get(
  "/user-monthly-stats",
  isAdmin,
  AnalyticsControllers.getMonthlyUserStats,
);

router.get(
  "/agent-monthly-stats",
  isAdmin,
  AnalyticsControllers.getMonthlyAgentStats,
);

router.get("/overview-stats", isAdmin, AnalyticsControllers.getOverviewStats);

export const AnalyticsRoutes = router;
