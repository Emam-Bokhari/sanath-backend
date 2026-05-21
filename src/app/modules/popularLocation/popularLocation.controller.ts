import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import ApiError from "../../../errors/ApiErrors";
import { PopularLocationServices } from "./popularLocation.service";

const parseListingIds = (listingIds: unknown): string[] => {
  if (Array.isArray(listingIds)) {
    return listingIds.map((id) => String(id));
  }

  if (typeof listingIds === "string") {
    try {
      const parsed = JSON.parse(listingIds);
      if (Array.isArray(parsed)) {
        return parsed.map((id) => String(id));
      }
    } catch {
      return [listingIds];
    }
  }

  return [];
};

const createPopularLocation = catchAsync(async (req, res) => {
  const result = await PopularLocationServices.createPopularLocationIntoDB(
    req.body,
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Popular location created successfully",
    data: result,
  });
});

const updatePopularLocation = catchAsync(async (req, res) => {
  const { popularLocationId } = req.params;
  const listingIds = parseListingIds(req.body?.listingIds);

  if (!listingIds.length) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "At least one listingId is required",
    );
  }

  const result = await PopularLocationServices.updatePopularLocationService(
    popularLocationId,
    {
      name: req.body?.name,
      listingIds,
      image: req.body?.image,
    },
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Popular location updated successfully",
    data: result,
  });
});

const getAllPopularLocations = catchAsync(async (req, res) => {
  const result = await PopularLocationServices.getAllPopularLocationsFromDB();

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Popular locations retrieved successfully",
    data: result,
  });
});

const getSinglePopularLocation = catchAsync(async (req, res) => {
  const { popularLocationId } = req.params;
  const result = await PopularLocationServices.getSinglePopularLocationFromDB(
    popularLocationId,
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Popular location retrieved successfully",
    data: result,
  });
});

const deletePopularLocation = catchAsync(async (req, res) => {
  const { popularLocationId } = req.params;
  const result = await PopularLocationServices.deletePopularLocationFromDB(
    popularLocationId,
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Popular location deleted successfully",
    data: result,
  });
});

const getAvailableListings = catchAsync(async (req, res) => {
  const popularLocationId = req.query.popularLocationId as string | undefined;
  const result =
    await PopularLocationServices.getAvailableListingsForPopularLocation(
      popularLocationId,
    );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Available listings retrieved successfully",
    data: result,
  });
});

export const PopularLocationControllers = {
  createPopularLocation,
  updatePopularLocation,
  getAllPopularLocations,
  getSinglePopularLocation,
  deletePopularLocation,
  getAvailableListings,
};
