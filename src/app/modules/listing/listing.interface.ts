import { Types } from "mongoose";
import { COUNCIL_TAX_BAND, FEATURES, LISTING_STATUS, PROPERTY_TYPE, TENURE } from "./listing.constant";


export type TListingChecklist = {
  basicInfo: boolean;
  media: boolean;
  propertyInfo: boolean;
  featureDescription: boolean;
  readyToPublish: boolean;
};

export type TListing = {
    // basic info
    title: string;
    askingPrice: number;
    country: string;
    city: string;
    postalCode: string;
    location?: {
        type: "Point";
        coordinates: [number, number]; // [longitude, latitude]
        address: string;
    };
    userId: Types.ObjectId;
    // photos & media
    photos: string[];
    videos: string[];
    floorPlans?: string[];
    brochure?: string;
    threeSixtyTour?: string;
    // property information
    propertyType: PROPERTY_TYPE;
    propertyBedrooms: number;
    propertyBathrooms: number;
    propertySquareFoot?: number;
    tenure?: TENURE;
    councilTaxBand?: COUNCIL_TAX_BAND;
    epcEnergyRating?: {
        label: string;
        score: number;
    };
    // feature & description
    features?: FEATURES[];
    description?: string;
    status: LISTING_STATUS;
    // listing checklist
     listingCheckList?: TListingChecklist;
}