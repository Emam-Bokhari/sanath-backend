import { TListing } from "./listing.interface";
import { Listing } from "./listing.model";
import { canPublishListing, generateChecklist } from "./listing.utils";
import { LISTING_STATUS, LISTING_TYPE } from "./listing.constant";
import { FilterQuery, Types } from "mongoose";
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

const getleListingServiceByIdFromDB = async (listingId: string) => {

  if (!Types.ObjectId.isValid(listingId)) {
    throw new Error("Invalid listing id");
  }

  const listing = await Listing.findOne({
    _id: listingId,
    isDeleted: { $ne: true },
  }).lean(); 

  if (!listing) {
    throw new Error("Listing not found");
  }

  return listing;
};

/* ================= TYPES ================= */
/* ================= TYPES ================= */
type TSort =
  | "price_low_high"
  | "price_high_low"
  | "newest"
  | "oldest"
  | "nearest";

type TTimeFilter = "any" | "twentyFourHours" | "threeDays" | "sevenDays";

type TSearchParams = {
  searchTerm?: string;
  location?: string;

  listingType?: LISTING_TYPE;

  propertyType?: string;

  minPrice?: number;
  maxPrice?: number;

  bedrooms?: number;
  bathrooms?: number;

  tenure?: string;
  features?: string[];

  timeFilter?: TTimeFilter;

  sort?: TSort;

  lat?: number;
  lng?: number;

  radiusInKm?: number;
};

/* ================= SERVICE ================= */
export const searchListingsServiceFromDB = async (
  params: TSearchParams,
) => {
  const {
    searchTerm,
    location,
    listingType,
    propertyType,
    minPrice,
    maxPrice,
    bedrooms,
    bathrooms,
    tenure,
    features,
    timeFilter,
    sort,
    lat,
    lng,
    radiusInKm,
  } = params;

  /* ================= NORMALIZE NUMBERS ================= */
  const numericMinPrice = minPrice !== undefined ? Number(minPrice) : undefined;
  const numericMaxPrice = maxPrice !== undefined ? Number(maxPrice) : undefined;
  const numericBedrooms = bedrooms !== undefined ? Number(bedrooms) : undefined;
  const numericBathrooms = bathrooms !== undefined ? Number(bathrooms) : undefined;
  const numericLat = lat !== undefined ? Number(lat) : undefined;
  const numericLng = lng !== undefined ? Number(lng) : undefined;
  const numericRadiusInKm =
    radiusInKm !== undefined ? Number(radiusInKm) : undefined;

  /* ================= BASE QUERY ================= */
  const query: FilterQuery<any> = {
    isDeleted: { $ne: true },
    status: LISTING_STATUS.PUBLISHED,
  };

  /* ================= LISTING TYPE (SALE / RENT) ================= */
  if (listingType) {
    query.listingType = listingType;
  }

  /* ================= SEARCH ================= */
  if (searchTerm || location) {
    const keyword = searchTerm || location;

    query.$or = [
      { title: { $regex: keyword, $options: "i" } },
      { city: { $regex: keyword, $options: "i" } },
      { country: { $regex: keyword, $options: "i" } },
      { postalCode: { $regex: keyword, $options: "i" } },
    ];
  }

  /* ================= PROPERTY TYPE ================= */
  if (propertyType) {
    query.propertyType = propertyType;
  }

  /* ================= PRICE RANGE ================= */
  if (numericMinPrice !== undefined || numericMaxPrice !== undefined) {
    query.askingPrice = {};
    if (numericMinPrice !== undefined)
      query.askingPrice.$gte = numericMinPrice;
    if (numericMaxPrice !== undefined)
      query.askingPrice.$lte = numericMaxPrice;
  }

  /* ================= BED / BATH ================= */
  if (numericBedrooms) {
    query.propertyBedrooms = { $gte: numericBedrooms };
  }

  if (numericBathrooms) {
    query.propertyBathrooms = { $gte: numericBathrooms };
  }

  /* ================= TENURE ================= */
  if (tenure) {
    query.tenure = tenure;
  }

  /* ================= FEATURES ================= */
  if (features?.length) {
    query.features = { $in: features };
  }

  /* ================= TIME FILTER ================= */
  if (timeFilter && timeFilter !== "any") {
    const now = new Date();
    let fromDate: Date | null = null;

    if (timeFilter === "twentyFourHours") {
      fromDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    if (timeFilter === "threeDays") {
      fromDate = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    }

    if (timeFilter === "sevenDays") {
      fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    if (fromDate) {
      query.createdAt = { $gte: fromDate };
    }
  }

  /* ================= GEO SEARCH ================= */
  const isGeoSearch =
    numericLat !== undefined && numericLng !== undefined;

  if (isGeoSearch) {
    const safeRadius =
      numericRadiusInKm && numericRadiusInKm > 0
        ? Math.min(numericRadiusInKm, 100)
        : 5;

    const radiusInMeters = safeRadius * 1000;

    const pipeline: any[] = [
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [numericLng!, numericLat!],
          },
          distanceField: "distance",
          maxDistance: radiusInMeters,
          spherical: true,
          query,
        },
      },
      {
        $addFields: {
          distanceInKm: {
            $divide: ["$distance", 1000],
          },
        },
      },
    ];

    /* ================= SORT INSIDE GEO ================= */
    if (sort && sort !== "nearest") {
      let sortQuery: any = {};

      switch (sort) {
        case "price_low_high":
          sortQuery.askingPrice = 1;
          break;

        case "price_high_low":
          sortQuery.askingPrice = -1;
          break;

        case "newest":
          sortQuery.createdAt = -1;
          break;

        case "oldest":
          sortQuery.createdAt = 1;
          break;
      }

      if (Object.keys(sortQuery).length > 0) {
        pipeline.push({ $sort: sortQuery });
      }
    }

    return await Listing.aggregate(pipeline);
  }

  /* ================= NORMAL SORT ================= */
  let sortQuery: any = {};

  switch (sort) {
    case "price_low_high":
      sortQuery.askingPrice = 1;
      break;

    case "price_high_low":
      sortQuery.askingPrice = -1;
      break;

    case "newest":
      sortQuery.createdAt = -1;
      break;

    case "oldest":
      sortQuery.createdAt = 1;
      break;

    default:
      sortQuery.createdAt = -1;
  }

  /* ================= EXECUTE ================= */
  const listings = await Listing.find(query)
    .sort(sortQuery)
    .lean();

  return listings;
};

export const ListingServices = {
  createListingServiceToDB,
  getMyListingsServiceFromDB,
  getMyleListingServiceByIdFromDB,
  updateListingServiceToDB,
  deleteListingServiceByIdFromDB,
  getNearbyListingsServiceFromDB,
  getleListingServiceByIdFromDB,
  searchListingsServiceFromDB,
};
