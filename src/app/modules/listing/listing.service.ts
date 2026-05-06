import { TListing } from "./listing.interface";
import { Listing } from "./listing.model";
import { canPublishListing, generateChecklist } from "./listing.utils";
import { LISTING_STATUS } from "./listing.constant";
import { Types } from "mongoose";
import QueryBuilder from "../../builder/queryBuilder";

const createListingServiceToDB = async (payload: TListing, agentId: string) => {
  // always create listing first (safe default)
  const listing = await Listing.create({
    ...payload,
    agentId,
    status: payload.status || LISTING_STATUS.DRAFT,
  });

  //  generate checklist
  const checklist = generateChecklist(listing);
  listing.listingCheckList = checklist;

  // PUBLISH validation on CREATE (IMPORTANT)
  if (listing.status === LISTING_STATUS.PUBLISHED) {
    const allowed = canPublishListing(checklist);

    if (!allowed) {
      throw new Error(
        "Cannot publish listing on create. Please complete required sections first.",
      );
    }
  }

  await listing.save();

  return listing;
};

const getMyListingsServiceFromDB = async (
  agentId: string,
  query: Record<string, unknown>,
) => {
  // base query (IMPORTANT: ownership locked)
  const baseQuery = Listing.find({
    agentId: new Types.ObjectId(agentId),
  });

  // apply QueryBuilder
  const listingQuery = new QueryBuilder(baseQuery, query)
    .search(["title", "city", "country"])
    .filter()
    .sort()
    .paginate()
    .fields();

  // execute query
  const result = await listingQuery.modelQuery;

  // meta count
  const meta = await listingQuery.countTotal();

  return {
    data: result,
    meta,
  };
};

const getMyleListingServiceByIdFromDB = async (
  listingId: string,
  agentId: string,
) => {
  const listing = await Listing.findOne({
    _id: listingId,
    agentId: new Types.ObjectId(agentId),
  });

  if (!listing) {
    throw new Error("Listing not found or unauthorized");
  }

  return listing;
};

const updateListingServiceToDB = async (
  listingId: string,
  payload: Partial<TListing>,
  agentId: string,
) => {
  const existingListing = await Listing.findOne({
    _id: listingId,
    agentId,
  });

  if (!existingListing) {
    throw new Error("Listing not found or unauthorized");
  }

  Object.assign(existingListing, payload);

  const checklist = generateChecklist(existingListing);
  existingListing.listingCheckList = checklist;

  //  PUBLISH validation on UPDATE
  if (payload.status === LISTING_STATUS.PUBLISHED) {
    const allowed = canPublishListing(checklist);

    if (!allowed) {
      throw new Error(
        "Cannot publish listing. Complete all required sections first.",
      );
    }
  }

  await existingListing.save();

  return existingListing;
};

const deleteListingServiceByIdFromDB = async (
  listingId: string,
  agentId: string,
) => {
  const listing = await Listing.findOne({
    _id: listingId,
    agentId: new Types.ObjectId(agentId),
  });

  if (!listing) {
    throw new Error("Listing not found or unauthorized");
  }

  // soft delete
  const result = await Listing.findOneAndUpdate(
    {
      _id: listingId,
      agentId: new Types.ObjectId(agentId),
    },
    {
      isDeleted: true,
    },
    {
      new: true,
    },
  );

  return result;
};

const getNearbyListingsServiceFromDB = async ({
  lat,
  lng,
  radiusInKm,
}: {
  lat: number;
  lng: number;
  radiusInKm: number;
}) => {
  console.log(lat, lng, radiusInKm);
  const radiusInMeters = radiusInKm * 1000;

  const listings = await Listing.find({
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [lng, lat], // IMPORTANT: [lng, lat]
        },
        $maxDistance: radiusInMeters,
      },
    },
    isDeleted: { $ne: true },
    status: LISTING_STATUS.PUBLISHED,
  });

  return listings;
};

const getleListingServiceByIdFromDB = async (id: string) => {

  if (!Types.ObjectId.isValid(id)) {
    throw new Error("Invalid listing id");
  }

  const listing = await Listing.findOne({
    _id: id,
    isDeleted: { $ne: true },
  }).lean(); 

  if (!listing) {
    throw new Error("Listing not found");
  }

  return listing;
};

export const ListingServices = {
  createListingServiceToDB,
  getMyListingsServiceFromDB,
  getMyleListingServiceByIdFromDB,
  updateListingServiceToDB,
  deleteListingServiceByIdFromDB,
  getNearbyListingsServiceFromDB,
  getleListingServiceByIdFromDB,
};
