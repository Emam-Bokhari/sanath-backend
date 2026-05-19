import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { ListingServices } from "./listing.service";

const createListing = catchAsync(async (req, res) => {
  const data = req.body;
  const { id: agentId } = req.user as { id: string };
  const listing = await ListingServices.createListingServiceToDB(data, agentId);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Listing created successfully",
    data: listing,
  });

});

const getMyListingsService = catchAsync(async (req, res) => {
  const { id: agentId } = req.user as { id: string };
  const query = req.query;
  const result = await ListingServices.getMyListingsServiceFromDB(
    agentId,
    query,
  );

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Listings retrieved successfully",
    data: result.data,
    meta: result.meta,
  });

});

const getListingById = catchAsync(async (req, res) => {
  const user = req?.user as { id: string } | undefined;
  const { listingId } = req.params;
  const listing = await ListingServices.getSingleListingByIdFromDB(
    listingId,
    user?.id,
  );

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Listing retrieved successfully",
    data: listing,
  });

});

const updateListing = catchAsync(async (req, res) => {
  const { id: agentId } = req.user as { id: string };
  const { listingId } = req.params;
  const data = req.body;
  const updatedListing = await ListingServices.updateListingServiceToDB(
    listingId,
    data,
    agentId,
  );

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Listing updated successfully",
    data: updatedListing,
  });

});

const deleteListing = catchAsync(async (req, res) => {
  const { id: agentId } = req.user as { id: string };
  const { listingId } = req.params;

  await ListingServices.deleteListingServiceByIdFromDB(listingId, agentId);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Listing deleted successfully",
  });

});

const updateListingStatusToSold = catchAsync(async (req, res) => {
  const { id: agentId } = req.user as { id: string };
  const { listingId } = req.params;

  const result = await ListingServices.updateListingStatusToSoldServiceToDB(
    listingId,
    agentId,
  );

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Listing status updated to SOLD successfully",
    data: result,
  });
});

const getNearbyListingsService = catchAsync(async (req, res) => {
  const { lat, lng, radiusInKm, ...query } = req.query;
  const user = req.user as { id: string } | undefined;
  const result = await ListingServices.getNearbyListingsServiceFromDB(
    {
      lat: lat ? Number(lat) : undefined,
      lng: lng ? Number(lng) : undefined,
      radiusInKm: radiusInKm ? Number(radiusInKm) : undefined,
    },
    query,
    user?.id,
  );

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Nearby listings retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getMyListingById = catchAsync(async (req, res) => {
  const { listingId } = req.params;
  const { id: agentId } = req.user as { id: string };
  const listing = await ListingServices.getAgentListingByIdFromDB(
    listingId,
    agentId,
  );

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Listing retrieved successfully",
    data: listing,
  });

});

const searchListingsService = catchAsync(async (req, res) => {
  const query = req.query;
  const user = req.user as { id: string } | undefined;
  const result = await ListingServices.searchListingsServiceFromDB(
    query,
    user?.id,
  );

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Listings retrieved successfully",
    data: result,
  });
  
});

const getAllListings = catchAsync(async (req, res) => {
  const query = req.query;
  const result = await ListingServices.getAllListingsServiceFromDB(query);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "All listings retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getSingleListingForAdmin = catchAsync(async (req, res) => {
  const { listingId } = req.params;
  const result = await ListingServices.getSingleListingForAdminFromDB(listingId);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Listing retrieved successfully",
    data: result,
  });
});

const updateListingStatusForAdmin = catchAsync(async (req, res) => {
  const { listingId } = req.params;
  const { status } = req.body;

  const result = await ListingServices.updateListingStatusForAdminServiceToDB(
    listingId,
    status,
  );

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Listing status updated successfully",
    data: result,
  });
});

const getListingStats = catchAsync(async (req, res) => {
  const result = await ListingServices.getListingStatsServiceFromDB();

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Listing statistics retrieved successfully",
    data: result,
  });
});

export const ListingControllers = {
  createListing,
  getMyListingsService,
  getMyListingById,
  updateListing,
  deleteListing,
  updateListingStatusToSold,
  getNearbyListingsService,
  getListingById,
  searchListingsService,
  getAllListings,
  getSingleListingForAdmin,
  updateListingStatusForAdmin,
  getListingStats,
};
