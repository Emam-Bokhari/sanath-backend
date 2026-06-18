import express from "express";
import { AgentFeedControllers } from "./agentFeed.controller";
import { isAgent } from "../../../helpers/authHelper";
import checkSubscription from "../../middlewares/checkSubscription";
import validateRequest from "../../middlewares/validateRequest";
import { AgentFeedValidation } from "./agentFeed.validation";

const router = express.Router();

router
  .route("/")
  .post(
    isAgent,
    checkSubscription(),
    validateRequest(AgentFeedValidation.createAgentFeedValidationSchema),
    AgentFeedControllers.createOrUpdateAgentFeed
  )
  .get(isAgent, checkSubscription(), AgentFeedControllers.getAgentFeed);

router
  .route("/sync")
  .post(isAgent, checkSubscription(), AgentFeedControllers.triggerFeedSync);

export const AgentFeedRoutes = router;