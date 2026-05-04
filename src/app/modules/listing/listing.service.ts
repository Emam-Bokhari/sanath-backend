import { TListing } from "./listing.interface";
import { Listing } from "./listing.model";
import { generateChecklist } from "./listing.utils";

const createListingServiceToDB = async (payload: TListing, userId: string) => {
    const listing = await Listing.create({
        ...payload,
        userId,
    });

    const checklist = generateChecklist(listing);

    listing.listingCheckList = checklist;
    await listing.save();

    return listing;
};


export const ListingServices={
    createListingServiceToDB,
}