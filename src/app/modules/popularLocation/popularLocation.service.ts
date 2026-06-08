import { StatusCodes } from "http-status-codes";
import { Types } from "mongoose";
import ApiError from "../../../errors/ApiErrors";
import { Listing } from "../listing/listing.model";
import { LISTING_STATUS } from "../listing/listing.constant";
import { TPopularLocation } from "./popularLocation.interface";
import { PopularLocation } from "./popularLocation.model";

const validateAndNormalizeListingIds = async (
  listingIds: string[],
  excludePopularLocationId?: string,
): Promise<Types.ObjectId[]> => {
  const uniqueIds = [
    ...new Set(listingIds.map((id) => id.toString()).filter(Boolean)),
  ];
  const validatedIds: Types.ObjectId[] = [];

  for (const listingId of uniqueIds) {
    if (!Types.ObjectId.isValid(listingId)) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `Invalid listing ID: ${listingId}`,
      );
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
      listings: new Types.ObjectId(listingId),
      isDeleted: false,
      ...(excludePopularLocationId
        ? { _id: { $ne: excludePopularLocationId } }
        : {}),
    });

    if (isListingUsed) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `Listing ${listing.title} is already added to another popular location`,
      );
    }

    validatedIds.push(new Types.ObjectId(listingId));
  }

  return validatedIds;
};

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
    const listingIdStrings = payload.listings.map((id) => id.toString());
    const validated = await validateAndNormalizeListingIds(listingIdStrings);
    payload.listings = validated;
    payload.totalListing = validated.length;
  } else {
    payload.listings = [];
    payload.totalListing = 0;
  }

  const result = await PopularLocation.create(payload);
  return result;
};

type TUpdatePopularLocationPayload = {
  name?: string;
  listingIds: string[];
  image?: string;
};

const updatePopularLocationService = async (
  popularLocationId: string,
  payload: TUpdatePopularLocationPayload,
) => {
  const location = await PopularLocation.findOne({
    _id: popularLocationId,
    isDeleted: false,
  });

  if (!location) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Popular location not found");
  }

  if (payload.name?.trim()) {
    const isNameExist = await PopularLocation.findOne({
      name: { $regex: new RegExp(`^${payload.name.trim()}$`, "i") },
      isDeleted: false,
      _id: { $ne: popularLocationId },
    });

    if (isNameExist) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "A popular location with this name already exists",
      );
    }

    location.name = payload.name.trim();
  }

  if (payload.image) {
    location.image = payload.image;
  }

  const validatedListings = await validateAndNormalizeListingIds(
    payload.listingIds,
    popularLocationId,
  );

  location.listings = validatedListings;
  location.totalListing = validatedListings.length;
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

const getAvailableListingsForPopularLocation = async (
  popularLocationId?: string,
) => {
  const popularLocations = await PopularLocation.find({
    isDeleted: false,
  }).select("listings _id");

  const assignedListingIds = popularLocations
    .filter((loc) => loc._id.toString() !== popularLocationId)
    .flatMap((loc) => loc.listings.map((id) => id.toString()));

  const result = await Listing.find({
    status: LISTING_STATUS.PUBLISHED,
    isDeleted: false,
    _id: { $nin: assignedListingIds },
  }).select("_id title country city location postalCode");

  return result;
};

export const PopularLocationServices = {
  createPopularLocationIntoDB,
  updatePopularLocationService,
  getAllPopularLocationsFromDB,
  getSinglePopularLocationFromDB,
  deletePopularLocationFromDB,
  getAvailableListingsForPopularLocation,
};
