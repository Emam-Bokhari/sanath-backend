import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiErrors";
import { FavoriteProperty } from "./favoriteProperty.model";
import { Listing } from "../listing/listing.model";

const checkFavoritePropertyStatus = async (
  userId: string,
  listingId: string,
) => {
  const favorite = await FavoriteProperty.exists({
    userId,
    listingId,
  });

  return {
    isFavorite: !!favorite,
  };
};

const toggleFavoriteProperty = async (payload: {
  userId: string;
  listingId: string;
}) => {
  const { userId, listingId } = payload;

  const listing = await Listing.findOne({
    _id: listingId,
    isDeleted: { $ne: true },
  }).select("_id");

  if (!listing) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Property not found");
  }

  const existingFavorite = await FavoriteProperty.findOne({
    userId,
    listingId,
  });

  if (existingFavorite) {
    await FavoriteProperty.deleteOne({
      _id: existingFavorite._id,
    });

    return {
      message: "Property removed from favorites successfully",
      isFavorite: false,
    };
  }

  const favorite = await FavoriteProperty.create({
    userId: new mongoose.Types.ObjectId(userId),
    listingId: new mongoose.Types.ObjectId(listingId),
  });

  return {
    message: "Property added to favorites successfully",
    isFavorite: true,
    data: favorite,
  };
};

const getFavoriteProperties = async (userId: string) => {
  const favorites = await FavoriteProperty.find({
    userId,
  })
    .populate({
      path: "listingId",
      populate: {
        path: "agentId",
        select: "name email profileImage phone isAgentVerified",
      },
    })
    .sort({ createdAt: -1 })
    .lean();

  return favorites;
};

const getFavoritePropertyByIdFromDB = async (
  userId: string,
  favoriteId: string,
) => {
  const favorite = await FavoriteProperty.findOne({
    _id: favoriteId,
    userId,
  })
    .populate({
      path: "listingId",
      populate: {
        path: "agentId",
        select: "name email profileImage phone isAgentVerified",
      },
    })
    .lean();

  if (!favorite) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Favorite property not found");
  }

  return favorite;
};

const deleteFavoriteProperty = async (userId: string, listingId: string) => {
  const result = await FavoriteProperty.deleteOne({
    userId,
    listingId,
  });

  if (!result.deletedCount) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Favorite property not found");
  }

  return {
    message: "Property removed from favorites successfully",
  };
};

export const FavoritePropertyServices = {
  toggleFavoriteProperty,
  checkFavoritePropertyStatus,
  getFavoriteProperties,
  getFavoritePropertyByIdFromDB,
  deleteFavoriteProperty,
};
