import { TListing, TListingChecklist } from "./listing.interface";

const hasValue = (v: any) => v !== undefined && v !== null && v !== "";

export const generateChecklist = (listing: TListing) => {
  const basicInfo =
    hasValue(listing.title) &&
    hasValue(listing.askingPrice) &&
    hasValue(listing.country) &&
    hasValue(listing.city) &&
    hasValue(listing.postalCode);
  
  const media =
    (listing.photos?.length || 0) > 0 && (listing.videos?.length || 0) > 0;

  const propertyInfo =
    hasValue(listing.propertyType) &&
    hasValue(listing.propertyBedrooms) &&
    hasValue(listing.propertyBathrooms);

  const featureDescription =
    (listing.features?.length || 0) > 0 && hasValue(listing.description);

  const readyToPublish =
    basicInfo && media && propertyInfo && featureDescription;

  return {
    basicInfo,
    media,
    propertyInfo,
    featureDescription,
    readyToPublish,
  };
};

export const canPublishListing = (checklist?: TListingChecklist) => {
  return (
    checklist?.basicInfo &&
    checklist?.media &&
    checklist?.propertyInfo &&
    checklist?.featureDescription
  );
};
