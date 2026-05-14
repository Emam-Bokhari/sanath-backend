import { z } from "zod";

const toggleSavedSearchZodSchema = z.object({
  body: z.object({
    searchTerm: z.string().optional(),
    location: z.string().optional(),
    listingType: z.string().optional(),
    propertyType: z.string().optional(),
    minPrice: z.number().optional(),
    maxPrice: z.number().optional(),
    bedrooms: z.number().optional(),
    bathrooms: z.number().optional(),
    tenure: z.string().optional(),
    features: z.array(z.string()).optional(),
    timeFilter: z.string().optional(),
    sort: z.string().optional(),
    lat: z.number().optional(),
    lng: z.number().optional(),
    radiusInKm: z.number().optional(),
  }),
});


export const SavedSearchValidation = {
  toggleSavedSearchZodSchema,
};
