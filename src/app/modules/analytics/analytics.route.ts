import express from "express";
import { isAdmin, isAgent } from "../../../helpers/authHelper";
import { AnalyticsControllers } from "./analytics.controller";

const router = express.Router();

router.get("/agent-stats", isAgent, AnalyticsControllers.getAgentDashboardStats);

router.get(
  "/agent-enquiry-monthly-stats",
  isAgent,
  AnalyticsControllers.getAgentEnquiryStats
);

router.get("/stats", isAdmin, AnalyticsControllers.getAdminStats);

router.get(
  "/user-management-stats",
  isAdmin,
  AnalyticsControllers.getUserManagementStats
);

router.get("/revenue-stats", isAdmin, AnalyticsControllers.getRevenueStats);

router.get(
  "/revenue-monthly-stats",
  isAdmin,
  AnalyticsControllers.getMonthlyRevenueStats
);

router.get(
  "/overview-stats",
  isAdmin,
  AnalyticsControllers.getOverviewStats
);

export const AnalyticsRoutes = router;
