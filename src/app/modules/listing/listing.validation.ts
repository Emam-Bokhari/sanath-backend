import { z } from "zod";
import {
  COUNCIL_TAX_BAND,
  LISTING_TYPE,
  PROPERTY_TYPE,
  TENURE,
} from "./listing.constant";

export const csvListingSchema = z.object({
  title: z.string().min(1, "Title is required"),
  listingType: z.nativeEnum(LISTING_TYPE),
  askingPrice: z.coerce.number().positive("Price must be positive"),
  country: z.string().min(1, "Country is required"),
  city: z.string().min(1, "City is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  propertyType: z.nativeEnum(PROPERTY_TYPE),
  propertyBedrooms: z.coerce.number().int().nonnegative(),
  propertyBathrooms: z.coerce.number().int().nonnegative(),
  propertySquareFoot: z.coerce.number().optional(),
  tenure: z.nativeEnum(TENURE).optional(),
  councilTaxBand: z.nativeEnum(COUNCIL_TAX_BAND).optional(),
  description: z.string().min(1, "Description is required"),
  features: z.string().optional(), // Will be split by |
  photos: z.string().optional(), // Will be split by |
  videos: z.string().optional(), // Will be split by |
  floorPlans: z.string().optional(), // Will be split by |
  brochure: z.string().optional(),
  threeSixtyTour: z.string().optional(),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  address: z.string().optional(),
  isFeatured: z.coerce.boolean().optional().default(false),
});

export type TCSVListingRow = z.infer<typeof csvListingSchema>;
