import express from "express";
import { EnqueryControllers } from "./enquery.controller";
import { isAdmin, isAgent, isAuthenticated } from "../../../helpers/authHelper";
import checkSubscription from "../../middlewares/checkSubscription";

const router = express.Router();

// admin routes
router.get("/admin/stats", isAdmin, EnqueryControllers.getEnqueryStatsForAdmin);
router.get("/admin/all-enqueries", isAdmin, EnqueryControllers.getAllEnqueriesForAdmin);
router.get("/admin/all-enqueries/:enqueryId", isAdmin, EnqueryControllers.getEnqueryByIdForAdmin);

// general routes
router
  .route("/")
  .post(isAuthenticated, EnqueryControllers.createEnquery)
  .get(isAgent, checkSubscription("leadAccess"), EnqueryControllers.getAllEnqueries);

// my enqueries (User/Agent)
router
  .route("/my-enqueries")
  .get(isAuthenticated, EnqueryControllers.getMyEnqueries);

router
  .route("/my-enqueries/:enqueryId")
  .get(isAuthenticated, EnqueryControllers.getMyEnqueryById);

// specific enquery routes
router.route("/:enqueryId").get(isAgent, checkSubscription("leadAccess"), EnqueryControllers.getEnqueryById);

// update enquery status
router
  .route("/:enqueryId/status")
  .patch(isAgent, checkSubscription("leadAccess"), EnqueryControllers.updateEnqueryStatus);

export const EnqueryRoutes = router;
