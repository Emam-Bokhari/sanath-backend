import { model, Schema } from "mongoose";

import { TEnquery, TEnqueryModel } from "./enquery.interface";

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
    // subject: {
    //     type: String,
    //     default: ""
    // },
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
