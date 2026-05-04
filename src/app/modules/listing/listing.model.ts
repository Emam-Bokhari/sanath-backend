import { Schema, model } from "mongoose";
import { TListing } from "./listing.interface";
import {
  COUNCIL_TAX_BAND,
  FEATURES,
  LISTING_STATUS,
  PROPERTY_TYPE,
  TENURE,
} from "./listing.constant";

const listingSchema = new Schema<TListing>(
  {
    title: {
      type: String,
      required: true,
    },
    askingPrice: {
      type: Number,
      required: true,
    },

    country: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    postalCode: {
      type: String,
      required: true,
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
      },
      coordinates: {
        type: [Number],
      },
      address: String,
    },

    agentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    photos: {
      type: [String],
      required: true,
      default: [],
    },
    videos: {
      type: [String],
      required: true,
      default: [],
    },
    floorPlans: {
      type: [String],
      default: [],
    },
    brochure: {
      type: String,
    },
    threeSixtyTour: {
      type: String,
    },

    propertyType: {
      type: String,
      enum: Object.values(PROPERTY_TYPE),
    },

    propertyBedrooms: {
      type: Number,
      required: true,
    },
    propertyBathrooms: {
      type: Number,
      required: true,
    },
    propertySquareFoot: {
      type: Number,
    },

    tenure: {
      type: String,
      enum: Object.values(TENURE),
    },

    councilTaxBand: {
      type: String,
      enum: Object.values(COUNCIL_TAX_BAND),
    },

    epcEnergyRating: {
      label: {
        type: String,
      },
      score: {
        type: Number,
      },
    },

    features: {
      type: [String],
      enum: Object.values(FEATURES),
      required: true,
    },
    description: {
      type: String,
      required: true,
    },

    listingCheckList: {
      basicInfo: {
        type: Boolean,
      },
      media: {
        type: Boolean,
      },
      propertyInfo: {
        type: Boolean,
      },
      featureDescription: {
        type: Boolean,
      },
      readyToPublish: {
        type: Boolean,
      },
    },

    status: {
      type: String,
      enum: Object.values(LISTING_STATUS),
      default: LISTING_STATUS.DRAFT,
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const Listing = model<TListing>("Listing", listingSchema);
