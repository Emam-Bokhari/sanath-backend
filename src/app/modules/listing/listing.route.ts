import { isAgent } from './../../../helpers/authHelper';
import express from "express";
import { ListingControllers } from "./listing.controller";

const router = express.Router();

router.route("/")
    .post(
        isAgent,
        ListingControllers.createListing
    );

export const ListingRoutes = router;