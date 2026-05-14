import express from "express";
import { isUser } from "./../../../helpers/authHelper";
import { SavedSearchController } from "./savedSearch.controller";
import validateRequest from "../../middlewares/validateRequest";
import { SavedSearchValidation } from "./savedSearch.validation";

const router = express.Router();

router
  .route("/")
  .post(
    isUser,
    validateRequest(SavedSearchValidation.toggleSavedSearchZodSchema),
    SavedSearchController.toggleSavedSearch,
  )
  .get(isUser, SavedSearchController.getMySavedSearches);

router.route("/:savedSearchId").delete(isUser, SavedSearchController.deleteSavedSearch);

export const SavedSearchRoutes = router;
