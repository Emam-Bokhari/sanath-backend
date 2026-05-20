import express from "express";
import { isAdmin } from "../../../helpers/authHelper";
import { PopularLocationControllers } from "./popularLocation.controller";
import fileUploadHandler from "../../middlewares/fileUploaderHandler";
import { parseFileData } from "../../middlewares/parseFileData";

const router = express.Router();

router
    .route("/")
    .post(isAdmin,
        fileUploadHandler(),
        parseFileData({ fieldName: "image", mode: "single" }),
        PopularLocationControllers.createPopularLocation)
    .get(PopularLocationControllers.getAllPopularLocations);

router
    .route("/:popularLocationId")
    .get(PopularLocationControllers.getSinglePopularLocation)
    .patch(isAdmin,
        fileUploadHandler(),
        parseFileData({ fieldName: "image", mode: "single" }),
        PopularLocationControllers.addListingsToLocation)
    .delete(isAdmin, PopularLocationControllers.deletePopularLocation);

export const PopularLocationRoutes = router;
