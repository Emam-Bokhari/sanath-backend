import express from "express";
import { EnqueryControllers } from "./enquery.controller";
import { isAgent, isAuthenticated } from "../../../helpers/authHelper";

const router = express.Router();

router
    .route("/")
    .post(
        isAuthenticated,
        EnqueryControllers.createEnquery,
    )
    .get(
        isAgent,
        EnqueryControllers.getAllEnqueries,
    );

router
    .route("/:enqueryId")
    .get(
        isAgent,
        EnqueryControllers.getEnqueryById,
    );

export const EnqueryRoutes = router;