import { Schema, model } from "mongoose";
import { TSavedSearch, TSavedSearchModel } from "./savedSearch.interface";
import { softDeletePlugin } from "../../../DB/plugins/softDeletePlugin";

const savedSearchSchema = new Schema<TSavedSearch, TSavedSearchModel>(
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
      isFeatured: { type: Boolean },
      timeFilter: { type: String },
      sort: { type: String },
      lat: { type: Number },
      lng: { type: Number },
      radiusInKm: { type: Number },
    },
    name: {
      type: String,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

savedSearchSchema.plugin(softDeletePlugin);

export const SavedSearch = model<TSavedSearch, TSavedSearchModel>(
  "SavedSearch",
  savedSearchSchema,
);
