import { Schema, model } from "mongoose";

const paymentNumberSchema = new Schema(
  {
    label: {
      type: String,
      required: true,
      trim: true,
    },
    number: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false },
);

const settingsSchema = new Schema(
  {
    paymentNumbers: {
      type: [paymentNumberSchema],
      default: [],
    },
    currency: {
      type: String,
      required: true,
      trim: true,
    },
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

export const Settings = model("Settings", settingsSchema);
