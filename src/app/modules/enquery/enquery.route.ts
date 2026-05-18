import express from "express";
import { EnqueryControllers } from "./enquery.controller";
import { isAgent, isAuthenticated } from "../../../helpers/authHelper";
import checkSubscription from "../../middlewares/checkSubscription";

const router = express.Router();

router
  .route("/")
  .post(isAuthenticated, EnqueryControllers.createEnquery)
  .get(isAgent, checkSubscription("leadAccess"), EnqueryControllers.getAllEnqueries);

router
  .route("/my-enqueries")
  .get(isAuthenticated, EnqueryControllers.getMyEnqueries);

router
  .route("/my-enqueries/:enqueryId")
  .get(isAuthenticated, EnqueryControllers.getMyEnqueryById);

router.route("/:enqueryId").get(isAgent, checkSubscription("leadAccess"), EnqueryControllers.getEnqueryById);

router
  .route("/:enqueryId/status")
  .patch(isAgent, checkSubscription("leadAccess"), EnqueryControllers.updateEnqueryStatus);

export const EnqueryRoutes = router;
