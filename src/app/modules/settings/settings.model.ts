import { Schema, model } from "mongoose";
import { TSettings } from "./settings.interface";

const settingsSchema = new Schema<TSettings>(
  {
    priceReducedDurationDays: {
      type: Number,
      default: 30,
    },
    newListingDurationDays: {
      type: Number,
      default: 7,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const Settings = model<TSettings>("Settings", settingsSchema);
