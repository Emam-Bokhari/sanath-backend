import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { ListingServices } from "./listing.service";

const createListing = catchAsync(async (req, res) => {
    const data = req.body;
    const { id: userId } = req.user as { id: string };
    const listing = await ListingServices.createListingServiceToDB(data, userId);

    sendResponse(res, {
        success: true,
        statusCode: 200,
        message: "Listing created successfully",
        data: listing,
    })

})

export const ListingControllers = {
    createListing,
}