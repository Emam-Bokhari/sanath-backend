import { model, Schema } from "mongoose";

import { TEnquery, TEnqueryModel } from "./enquery.interface";
import { ENQUERY_STATUS } from "./enquery.constant";

const enquerySchema = new Schema<TEnquery, TEnqueryModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    listingId: {
      type: Schema.Types.ObjectId,
      ref: "Listing",
    },
    status: {
      type: String,
      enum: Object.values(ENQUERY_STATUS),
      default: ENQUERY_STATUS.ENQUERED
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    postalCode: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const Enquery = model<TEnquery, TEnqueryModel>("Enquery", enquerySchema);
