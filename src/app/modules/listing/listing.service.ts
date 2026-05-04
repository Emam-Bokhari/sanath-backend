import { Types } from "mongoose";
import { TListing } from "./listing.interface";
import { Listing } from "./listing.model";
import { canPublishListing, generateChecklist } from "./listing.utils";
import { LISTING_STATUS } from "./listing.constant";

const createListingServiceToDB = async (
  payload: TListing,
  agentId: string
) => {
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
        "Cannot publish listing on create. Please complete required sections first."
      );
    }
  }

  await listing.save();

  return listing;
};

const updateListingServiceToDB = async (
  listingId: string,
  payload: Partial<TListing>,
  agentId: string
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
        "Cannot publish listing. Complete all required sections first."
      );
    }
  }

  await existingListing.save();

  return existingListing;
};


export const ListingServices = {
    createListingServiceToDB,
    updateListingServiceToDB,
}