import { TListing, TSearchParams } from "./listing.interface";
import { Listing } from "./listing.model";
import { SavedSearch } from "../savedSearch/savedSearch.model";
import { canPublishListing, generateChecklist } from "./listing.utils";
import { LISTING_STATUS } from "./listing.constant";
import { FilterQuery, Types } from "mongoose";
import QueryBuilder from "../../builder/queryBuilder";

const createListingServiceToDB = async (payload: TListing, agentId: string) => {
  // force status to DRAFT or PENDING_APPROVAL if PUBLISHED is requested by agent
  let initialStatus = payload.status || LISTING_STATUS.DRAFT;

  if (initialStatus === LISTING_STATUS.PUBLISHED) {
    initialStatus = LISTING_STATUS.PENDING_APPROVAL;
  }

  // always create listing first (safe default)
  const listing = await Listing.create({
    ...payload,
    agentId,
    status: initialStatus,
  });

  //  generate checklist
  const checklist = generateChecklist(listing);
  listing.listingCheckList = checklist;

  // Validation if PENDING_APPROVAL is requested
  if (listing.status === LISTING_STATUS.PENDING_APPROVAL) {
    const allowed = canPublishListing(checklist);

    if (!allowed) {
      throw new Error(
        "Cannot request publication. Please complete required sections first.",
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

  if (payload.status === LISTING_STATUS.PUBLISHED) {
    payload.status = LISTING_STATUS.PENDING_APPROVAL;
  }

  Object.assign(existingListing, payload);

  const checklist = generateChecklist(existingListing);
  existingListing.listingCheckList = checklist;

  //  Validation if PENDING_APPROVAL is requested
  if (existingListing.status === LISTING_STATUS.PENDING_APPROVAL) {
    const allowed = canPublishListing(checklist);

    if (!allowed) {
      throw new Error(
        "Cannot request publication. Complete all required sections first.",
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

const getNearbyListingsServiceFromDB = async (
  {
    lat,
    lng,
    radiusInKm,
  }: {
    lat?: number;
    lng?: number;
    radiusInKm?: number;
  },
  query: Record<string, unknown>,
) => {
  let baseQuery;

  // If lat or lng is not provided or invalid, return all published listings as fallback
  if (lat === undefined || lng === undefined || isNaN(lat) || isNaN(lng)) {
    baseQuery = Listing.find({
      isDeleted: { $ne: true },
      status: LISTING_STATUS.PUBLISHED,
    });
  } else {
    const radiusInMeters =
      (radiusInKm && !isNaN(radiusInKm) ? radiusInKm : 10) * 1000;

    baseQuery = Listing.find({
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
  }

  const listingQuery = new QueryBuilder(baseQuery, query)
    .search(["title", "city", "country"])
    .filter()
    .paginate()
    .fields();

  const result = await listingQuery.modelQuery.populate("agentId");
  const meta = await listingQuery.countTotal();

  return {
    data: result,
    meta,
  };
};

const getleListingServiceByIdFromDB = async (
  listingId: string,
  userId?: string,
) => {
  if (!Types.ObjectId.isValid(listingId)) {
    throw new Error("Invalid listing id");
  }

  const listing = await Listing.findOne({
    _id: listingId,
    isDeleted: { $ne: true },
  }).populate("agentId");

  if (!listing) {
    throw new Error("Listing not found");
  }

  if (userId) {
    const agentId = (listing.agentId as any)?._id || listing.agentId;
    const isOwner = agentId.toString() === userId;
    const hasViewed = listing.viewedBy?.some((id) => id.toString() === userId);
    console.log(hasViewed);

    if (!isOwner && !hasViewed) {
      await Listing.findByIdAndUpdate(listingId, {
        $inc: { views: 1 },
        $push: { viewedBy: new Types.ObjectId(userId) },
      });
      listing.views = (listing.views || 0) + 1;
    }
  }

  console.log(listing);

  return listing;
};

const searchListingsServiceFromDB = async (
  params: TSearchParams,
  userId?: string,
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
    isFeatured,
    timeFilter,
    sort,
    lat,
    lng,
    radiusInKm,
  } = params;

  // Save search to history if userId is provided
  if (userId) {
    // We only save if there are actual search params
    const hasParams = Object.values(params).some((v) => v !== undefined);
    if (hasParams) {
      // Check if this exact search already exists to avoid duplicates in history
      const existingSearch = await SavedSearch.findOne({
        userId,
        params,
      });

      if (!existingSearch) {
        await SavedSearch.create({
          userId: userId as any,
          params,
        });
      }
    }
  }

  /* ================= NORMALIZE NUMBERS ================= */
  const numericMinPrice = minPrice !== undefined ? Number(minPrice) : undefined;
  const numericMaxPrice = maxPrice !== undefined ? Number(maxPrice) : undefined;
  const numericBedrooms = bedrooms !== undefined ? Number(bedrooms) : undefined;
  const numericBathrooms =
    bathrooms !== undefined ? Number(bathrooms) : undefined;
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

  /* ================= FEATURED ================= */
  if (isFeatured !== undefined) {
    query.isFeatured = String(isFeatured) === "true";
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
    if (numericMinPrice !== undefined) query.askingPrice.$gte = numericMinPrice;
    if (numericMaxPrice !== undefined) query.askingPrice.$lte = numericMaxPrice;
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
    let tenureArray = Array.isArray(tenure)
      ? tenure
      : typeof tenure === "string"
        ? tenure.split(",")
        : [tenure];

    // Trim spaces and filter out empty strings
    tenureArray = tenureArray
      .map((t: any) => (typeof t === "string" ? t.trim() : t))
      .filter((t: any) => t !== "");

    if (tenureArray.length > 0) {
      query.tenure = { $in: tenureArray };
    }
  }

  /* ================= FEATURES ================= */
  if (features) {
    let featuresArray = Array.isArray(features)
      ? features
      : typeof features === "string"
        ? features.split(",")
        : [features];

    // Trim spaces and filter out empty strings
    featuresArray = featuresArray
      .map((f: any) => (typeof f === "string" ? f.trim() : f))
      .filter((f: any) => f !== "");

    if (featuresArray.length > 0) {
      query.features = { $in: featuresArray };
    }
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
    numericLat !== undefined &&
    numericLng !== undefined &&
    !isNaN(numericLat) &&
    !isNaN(numericLng);

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
      {
        $lookup: {
          from: "users",
          localField: "agentId",
          foreignField: "_id",
          as: "agentId",
        },
      },
      {
        $unwind: {
          path: "$agentId",
          preserveNullAndEmptyArrays: true,
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
    .populate("agentId")
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
