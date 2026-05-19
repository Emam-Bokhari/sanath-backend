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

export const AnalyticsRoutes = router;
