import express from "express";
import { EnqueryControllers } from "./enquery.controller";
import { isAgent, isAuthenticated } from "../../../helpers/authHelper";

const router = express.Router();

router
  .route("/")
  .post(isAuthenticated, EnqueryControllers.createEnquery)
  .get(isAgent, EnqueryControllers.getAllEnqueries);

router
  .route("/my-enqueries")
  .get(isAuthenticated, EnqueryControllers.getMyEnqueries);

router
  .route("/my-enqueries/:enqueryId")
  .get(isAuthenticated, EnqueryControllers.getMyEnqueryById);

router.route("/:enqueryId").get(isAgent, EnqueryControllers.getEnqueryById);

router
  .route("/:enqueryId/status")
  .patch(isAgent, EnqueryControllers.updateEnqueryStatus);


export const EnqueryRoutes = router;