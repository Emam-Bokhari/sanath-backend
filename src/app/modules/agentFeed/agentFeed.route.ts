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
    AgentFeedControllers.createAgentFeed
  )
  .get(isAgent, checkSubscription(), AgentFeedControllers.getMyAgentFeeds);

router
  .route("/:feedId")
  .get(isAgent, checkSubscription(), AgentFeedControllers.getAgentFeedById)
  .patch(
    isAgent,
    checkSubscription(),
    validateRequest(AgentFeedValidation.updateAgentFeedValidationSchema),
    AgentFeedControllers.updateAgentFeed
  )
  .delete(isAgent, checkSubscription(), AgentFeedControllers.deleteAgentFeed);

router
  .route("/:feedId/sync")
  .post(isAgent, checkSubscription(), AgentFeedControllers.triggerFeedSync);

export const AgentFeedRoutes = router;