import express from "express";
import auth from "../../middlewares/auth";
import { FavoritePropertyControllers } from "./favoriteProperty.controller";

const router = express.Router();


router
  .route("/toggle")
  .post(
    auth(),
    FavoritePropertyControllers.toggleFavoriteProperty,
  );

router
  .route("/")
  .get(
    auth(),
    FavoritePropertyControllers.getFavoriteProperties,
  );


router
  .route("/status/:listingId")
  .get(
    auth(),
    FavoritePropertyControllers.checkFavoritePropertyStatus,
  );


router
  .route("/:favoriteId")
  .get(
    auth(),
    FavoritePropertyControllers.getFavoritePropertyById,
  );


router
  .route("/listing/:listingId")
  .delete(
    auth(),
    FavoritePropertyControllers.deleteFavoriteProperty,
  );

export const FavoritePropertyRoutes = router;