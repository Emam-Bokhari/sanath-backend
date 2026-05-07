import express from "express";
import { FavoritePropertyControllers } from "./favoriteProperty.controller";
import { isAuthenticated } from "../../../helpers/authHelper";

const router = express.Router();

router
  .route("/toggle")
  .post(isAuthenticated, FavoritePropertyControllers.toggleFavoriteProperty);

router
  .route("/")
  .get(isAuthenticated, FavoritePropertyControllers.getFavoriteProperties);

router
  .route("/status/:listingId")
  .get(
    isAuthenticated,
    FavoritePropertyControllers.checkFavoritePropertyStatus,
  );

router
  .route("/:favoriteId")
  .get(isAuthenticated, FavoritePropertyControllers.getFavoritePropertyById);

router
  .route("/listing/:listingId")
  .delete(isAuthenticated, FavoritePropertyControllers.deleteFavoriteProperty);

export const FavoritePropertyRoutes = router;
