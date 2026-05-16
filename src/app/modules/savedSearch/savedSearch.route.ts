import express from "express";
import { isAuthenticated } from "./../../../helpers/authHelper";
import { SavedSearchController } from "./savedSearch.controller";
import validateRequest from "../../middlewares/validateRequest";
import { SavedSearchValidation } from "./savedSearch.validation";

const router = express.Router();

router
  .route("/")
  .post(
    isAuthenticated,
    validateRequest(SavedSearchValidation.toggleSavedSearchZodSchema),
    SavedSearchController.toggleSavedSearch,
  )
  .get(isAuthenticated, SavedSearchController.getMySavedSearches);

router
  .route("/:savedSearchId")
  .delete(isAuthenticated, SavedSearchController.deleteSavedSearch);

export const SavedSearchRoutes = router;
