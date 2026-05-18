import { Types } from "mongoose";
import {
  COUNCIL_TAX_BAND,
  FEATURES,
  LISTING_STATUS,
  LISTING_TYPE,
  PROPERTY_TYPE,
  TENURE,
} from "./listing.constant";
import { ISoftDeleteModel } from "../../../types/softDelete";
import { TEnquery } from "../enquery/enquery.interface";

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
  listingType: LISTING_TYPE;
  askingPrice: number;
  country: string;
  city: string;
  postalCode: string;
  location?: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
    address: string;
  };
  agentId: Types.ObjectId;
  // photos & media
  photos: string[];
  videos: string[];
  views?: number;
  viewedBy?: Types.ObjectId[];
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
  features: FEATURES[];
  description: string;
  status: LISTING_STATUS;
  isFeatured: boolean;
  // leads info
  leadsCount?: number;
  leads?: TEnquery[];
  // listing checklist
  listingCheckList?: TListingChecklist;
  isDeleted?: boolean;
};

export type TSort =
  | "price_low_high"
  | "price_high_low"
  | "newest"
  | "oldest"
  | "nearest";

export type TTimeFilter = "any" | "twentyFourHours" | "threeDays" | "sevenDays";

export type TSearchParams = {
  searchTerm?: string;
  location?: string;
  listingType?: LISTING_TYPE;
  propertyType?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  tenure?: string | string[];
  features?: string | string[];
  isFeatured?: boolean | string;
  timeFilter?: TTimeFilter;
  sort?: TSort;
  lat?: number;
  lng?: number;
  radiusInKm?: number;
};

export type TListingModel = ISoftDeleteModel<TListing>;
