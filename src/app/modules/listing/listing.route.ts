import {
  isAdmin,
  isAgent,
  isAuthenticated,
} from "./../../../helpers/authHelper";
import express from "express";
import { ListingControllers } from "./listing.controller";
import fileUploadHandler from "../../middlewares/fileUploaderHandler";
import { parseFileData } from "../../middlewares/parseFileData";
import optionalAuth from "../../middlewares/optionalAuth";
import checkSubscription from "../../middlewares/checkSubscription";

const router = express.Router();

router.route("/").post(
  isAgent,
  checkSubscription(),
  fileUploadHandler(),
  parseFileData(
    {
      fieldName: "photos",
      mode: "multiple",
    },
    {
      fieldName: "videos",
      mode: "multiple",
    },
    {
      fieldName: "floorPlans",
      mode: "multiple",
    },
    {
      fieldName: "brochure",
      mode: "single",
    },
    {
      fieldName: "threeSixtyTour",
      mode: "single",
    },
  ),
  ListingControllers.createListing,
);

router
  .route("/nearby")
  .get(optionalAuth(), ListingControllers.getNearbyListingsService);

router
  .route("/search")
  .get(optionalAuth(), ListingControllers.searchListingsService);

router.route("/my").get(isAgent, ListingControllers.getMyListingsService);

router
  .route("/my/:listingId")
  .get(isAgent, ListingControllers.getMyListingById)
  .patch(
    isAgent,
    checkSubscription(),
    fileUploadHandler(),
    parseFileData(
      {
        fieldName: "photos",
        mode: "multiple",
      },
      {
        fieldName: "videos",
        mode: "multiple",
      },
      {
        fieldName: "floorPlans",
        mode: "multiple",
      },
      {
        fieldName: "brochure",
        mode: "single",
      },
    ),
    ListingControllers.updateListing,
  )
  .delete(isAgent, ListingControllers.deleteListing);

router.route("/my/status-sold/:listingId").patch(isAgent, ListingControllers.updateListingStatusToSold);

router
  .route("/admin/all")
  .get(isAdmin, ListingControllers.getAllListings);

router
  .route("/:listingId")
  .get(optionalAuth(), ListingControllers.getListingById);

export const ListingRoutes = router;
