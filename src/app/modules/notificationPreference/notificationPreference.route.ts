import express from "express";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";
import { NotificationPreferenceController } from "./notificationPreference.controller";
import { isAuthenticated } from "../../../helpers/authHelper";

const router = express.Router();

router
  .route("/")
  .get(
    isAuthenticated,
    NotificationPreferenceController.getUserPreference
  )
  .patch(
    isAuthenticated,
    NotificationPreferenceController.updateUserPreference
  );

export const NotificationPreferenceRoutes = router;
