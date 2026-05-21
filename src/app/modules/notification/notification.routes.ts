import express from "express";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";
import { NotificationController } from "./notification.controller";

const router = express.Router();

// --- USER & AGENT ROUTES ---
router
  .route("/")
  .get(
    auth(USER_ROLES.USER, USER_ROLES.AGENT),
    NotificationController.getNotifications,
  )
  .patch(
    auth(USER_ROLES.USER, USER_ROLES.AGENT),
    NotificationController.readNotifications,
  );

router
  .route("/:id")
  .get(
    auth(USER_ROLES.USER, USER_ROLES.AGENT),
    NotificationController.getSingleNotification,
  )
  .patch(
    auth(USER_ROLES.USER, USER_ROLES.AGENT),
    NotificationController.readSingleNotification,
  );

// --- ADMIN & SUPER_ADMIN ROUTES ---
router
  .route("/admin")
  .get(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    NotificationController.getAdminNotifications,
  )
  .patch(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    NotificationController.readAdminNotifications,
  );

router
  .route("/admin/:id")
  .get(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    NotificationController.getAdminSingleNotification,
  )
  .patch(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    NotificationController.readAdminSingleNotification,
  );

export const NotificationRoutes = router;
