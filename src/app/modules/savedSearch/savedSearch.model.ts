import { Schema, model } from "mongoose";
import { TSavedSearch } from "./savedSearch.interface";

const savedSearchSchema = new Schema<TSavedSearch>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    params: {
      searchTerm: { type: String },
      location: { type: String },
      listingType: { type: String },
      propertyType: { type: String },
      minPrice: { type: Number },
      maxPrice: { type: Number },
      bedrooms: { type: Number },
      bathrooms: { type: Number },
      tenure: { type: Schema.Types.Mixed },
      features: { type: Schema.Types.Mixed },
      // isFeatured: { type: Boolean },
      timeFilter: { type: String },
      sort: { type: String },
      lat: { type: Number },
      lng: { type: Number },
      radiusInMiles: { type: Number },
    },
    name: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

savedSearchSchema.index({ userId: 1, createdAt: -1 });
savedSearchSchema.index({ userId: 1, "params.searchTerm": 1 });

export const SavedSearch = model<TSavedSearch>(
  "SavedSearch",
  savedSearchSchema,
);
