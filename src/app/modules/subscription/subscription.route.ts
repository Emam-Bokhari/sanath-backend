import express from "express";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";
import { SubscriptionController } from "./subscription.controller";
import validateRequest from "../../middlewares/validateRequest";
import { SubscriptionValidations } from "./subscription.validation";

const router = express.Router();

router.post(
  "/create-checkout-session",
  auth(USER_ROLES.USER, USER_ROLES.AGENT),
  validateRequest(SubscriptionValidations.createCheckoutSessionValidationSchema),
  SubscriptionController.createCheckoutSession
);

router.post(
  "/cancel-subscription",
  auth(USER_ROLES.USER, USER_ROLES.AGENT),
  SubscriptionController.cancelSubscription
);

router.get(
  "/my-subscription",
  auth(USER_ROLES.USER, USER_ROLES.AGENT),
  SubscriptionController.getMySubscription
);

export const SubscriptionRoutes = router;
