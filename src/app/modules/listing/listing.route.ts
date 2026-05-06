import { isAgent, isAuthenticated, isUser } from "./../../../helpers/authHelper";
import express from "express";
import { ListingControllers } from "./listing.controller";
import fileUploadHandler from "../../middlewares/fileUploaderHandler";
import { parseFileData } from "../../middlewares/parseFileData";

const router = express.Router();

router.route("/").post(
  isAgent,
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
  ListingControllers.createListing,
);

router.route("/nearby").get(isUser, ListingControllers.getNearbyListingsService);

router.route("/search").get(isUser, ListingControllers.searchListingsService);



router.route("/my").get(isAgent, ListingControllers.getMyListingsService);

router
  .route("/my/:listingId")
  .get(isAgent, ListingControllers.getListingById)
  .patch(
    isAgent,
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


router.route("/:listingId")
  .get(
    isAuthenticated,
    ListingControllers.getleListingById);


export const ListingRoutes = router;
