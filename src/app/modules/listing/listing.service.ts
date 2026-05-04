import { Types } from "mongoose";
import { TListing } from "./listing.interface";
import { Listing } from "./listing.model";
import { generateChecklist } from "./listing.utils";

const createListingServiceToDB = async (payload: TListing, agentId: string) => {
    const listing = await Listing.create({
        ...payload,
        agentId,
    });

    const checklist = generateChecklist(listing);

    listing.listingCheckList = checklist;
    await listing.save();

    return listing;
};

const updateListingServiceToDB = async (
    listingId: string,
    payload: Partial<TListing>,
    agentId: string
) => {
    //  check ownership
    const existingListing = await Listing.findOne({
        _id: listingId,
        agentId: new Types.ObjectId(agentId),
    });

    if (!existingListing) {
        throw new Error("Listing not found or unauthorized");
    }

    // update listing 
    Object.assign(existingListing, payload);

    //  regenerate checklist after update
    const checklist = generateChecklist(existingListing);

    existingListing.listingCheckList = checklist;

    // save updated listing
    await existingListing.save();

    return existingListing;
};


export const ListingServices = {
    createListingServiceToDB,
    updateListingServiceToDB,
}