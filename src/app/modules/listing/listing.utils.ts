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
    (listing.photos?.length || 0) >= 6 && (listing.videos?.length || 0) > 0;

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

export const getMissingChecklistItems = (checklist: TListingChecklist) => {
  const missing = [];
  if (!checklist.basicInfo) missing.push("Basic Info (title, price, location)");
  if (!checklist.media) missing.push("Media (at least 6 photos and 1 video)");
  if (!checklist.propertyInfo)
    missing.push("Property Info (type, bedrooms, bathrooms)");
  if (!checklist.featureDescription)
    missing.push("Feature & Description (features and description text)");

  return missing;
};
