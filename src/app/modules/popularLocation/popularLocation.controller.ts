import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { PopularLocationServices } from "./popularLocation.service";

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

const addListingsToLocation = catchAsync(async (req, res) => {
  const { popularLocationId } = req.params;
  const { listingIds } = req.body;
  const result = await PopularLocationServices.addListingsToLocationService(
    popularLocationId,
    listingIds,
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Listings added to location successfully",
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
  console.log(popularLocationId,"controller");
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
  console.log(popularLocationId,"controller");
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

export const PopularLocationControllers = {
  createPopularLocation,
  addListingsToLocation,
  getAllPopularLocations,
  getSinglePopularLocation,
  deletePopularLocation,
};
