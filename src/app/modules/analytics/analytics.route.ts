import express from "express";
import { isAgent } from "../../../helpers/authHelper";
import { AnalyticsController } from "./analytics.controller";

const router = express.Router();

router.get(
  "/agent-stats",
  isAgent,
  AnalyticsController.getAgentDashboardStats
);

export const AnalyticsRoutes = router;
