import { Schema, model } from "mongoose";
import { TFavoriteProperty } from "./favoriteProperty.interface";

const favoritePropertySchema = new Schema<TFavoriteProperty>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    listingId: {
      type: Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

favoritePropertySchema.index({ userId: 1, listingId: 1 }, { unique: true });

export const FavoriteProperty = model<TFavoriteProperty>(
  "FavoriteProperty",
  favoritePropertySchema,
);
