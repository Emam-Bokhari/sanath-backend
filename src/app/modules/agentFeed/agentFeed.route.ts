import express from "express";
import { AgentFeedControllers } from "./agentFeed.controller";
import { isAgent } from "../../../helpers/authHelper";
import checkSubscription from "../../middlewares/checkSubscription";

const router = express.Router();

router
  .route("/")
  .post(
    isAgent,
    // checkSubscription(),
    AgentFeedControllers.createOrUpdateAgentFeed,
  )
  .get(isAgent, checkSubscription(), AgentFeedControllers.getAgentFeed);

router.route("/sync").post(
  isAgent,
  // checkSubscription(),
  AgentFeedControllers.triggerFeedSync,
);

export const AgentFeedRoutes = router;
