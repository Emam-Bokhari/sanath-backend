import { isAgent } from './../../../helpers/authHelper';
import express from "express";
import { ListingControllers } from "./listing.controller";
import fileUploadHandler from '../../middlewares/fileUploaderHandler';
import { parseFileData } from '../../middlewares/parseFileData';

const router = express.Router();

router.route("/")
    .post(
        isAgent,
        fileUploadHandler(),
        parseFileData({
            fieldName: "photos",
            mode: 'multiple',
        }, {
            fieldName: "videos",
            mode: 'multiple',
        }, {
            fieldName: "floorPlans",
            mode: 'multiple',
        }, {
            fieldName: "brochure",
            mode: 'single',
        }),
        ListingControllers.createListing
    );

router.route("/:listingId")
    .patch(
        isAgent,
        fileUploadHandler(),
        parseFileData({
            fieldName: "photos",
            mode: 'multiple',
        }, {
            fieldName: "videos",
            mode: 'multiple',
        }, {
            fieldName: "floorPlans",
            mode: 'multiple',
        }, {
            fieldName: "brochure",
            mode: 'single',
        }),
        ListingControllers.updateListing
    );


export const ListingRoutes = router;