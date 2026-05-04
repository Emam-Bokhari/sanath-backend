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

export const ListingControllers = {
  createListing,
  updateListing,
};
