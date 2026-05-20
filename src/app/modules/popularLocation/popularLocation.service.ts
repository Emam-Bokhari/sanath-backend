import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiErrors";
import { Listing } from "../listing/listing.model";
import { LISTING_STATUS } from "../listing/listing.constant";
import { TPopularLocation } from "./popularLocation.interface";
import { PopularLocation } from "./popularLocation.model";

const createPopularLocationIntoDB = async (payload: TPopularLocation) => {
 
  const isNameExist = await PopularLocation.findOne({
    name: { $regex: new RegExp(`^${payload.name}$`, "i") },
    isDeleted: false,
  });

  if (isNameExist) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "A popular location with this name already exists",
    );
  }

  if (payload.listings && payload.listings.length > 0) {
    for (const listingId of payload.listings) {
      const listing = await Listing.findById(listingId);
      if (!listing) {
        throw new ApiError(
          StatusCodes.NOT_FOUND,
          `Listing with ID ${listingId} not found`,
        );
      }
      if (listing.status !== LISTING_STATUS.PUBLISHED) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          `Listing ${listing.title} is not published`,
        );
      }


      const isListingUsed = await PopularLocation.findOne({
        listings: listingId,
        isDeleted: false,
      });
      if (isListingUsed) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          `Listing ${listing.title} is already added to another popular location`,
        );
      }
    }
    payload.totalListing = payload.listings.length;
  }

  const result = await PopularLocation.create(payload);
  return result;
};

const addListingsToLocationService = async (
  popularLocationId: string,
  listingIds: string[],
) => {
  const location = await PopularLocation.findOne({ _id: popularLocationId, isDeleted: false });
  if (!location) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Popular location not found");
  }

  for (const listingId of listingIds) {

    if (location.listings.includes(listingId)) {
      continue; 
    }

    const listing = await Listing.findById(listingId);
    if (!listing) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        `Listing with ID ${listingId} not found`,
      );
    }

    if (listing.status !== LISTING_STATUS.PUBLISHED) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `Listing ${listing.title} is not published`,
      );
    }


    const isListingUsed = await PopularLocation.findOne({
      listings: listingId,
      isDeleted: false,
      _id: { $ne: popularLocationId },
    });

    if (isListingUsed) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `Listing ${listing.title} is already added to another popular location`,
      );
    }

    location.listings.push(listingId);
  }

  location.totalListing = location.listings.length;
  await location.save();
  return location;
};

const getAllPopularLocationsFromDB = async () => {
  const result = await PopularLocation.find({ isDeleted: false }).populate(
    "listings",
  );
  return result;
};

const getSinglePopularLocationFromDB = async (popularLocationId: string) => {
    console.log(popularLocationId);
  const result = await PopularLocation.findOne({
    _id: popularLocationId,
  }).populate("listings");

  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Popular location not found");
  }

  return result;
};

const deletePopularLocationFromDB = async (popularLocationId: string) => {
  const result = await PopularLocation.findByIdAndUpdate(
    popularLocationId,
    { isDeleted: true },
    { new: true },
  );

  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Popular location not found");
  }

  return result;
};

export const PopularLocationServices = {
  createPopularLocationIntoDB,
  addListingsToLocationService,
  getAllPopularLocationsFromDB,
  getSinglePopularLocationFromDB,
  deletePopularLocationFromDB,
};
