import { Schema, model } from "mongoose";
import { TPopularLocation, TPopularLocationModel } from "./popularLocation.interface";
import { softDeletePlugin } from "../../../DB/plugins/softDeletePlugin";

const popularLocationSchema = new Schema<TPopularLocation,TPopularLocationModel>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    image: {
      type: String,
      required: true,
      trim: true,
    },

    listingId: {
      type: Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
      index: true,
    },

    totalListing: {
      type: Number,
      default: 0,
      min: 0,
    },

    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);


popularLocationSchema.index({
  isDeleted: 1,
  totalListing: -1,
});

popularLocationSchema.plugin(softDeletePlugin);

export const PopularLocation = model<TPopularLocation,TPopularLocationModel>(
  "PopularLocation",
  popularLocationSchema
);