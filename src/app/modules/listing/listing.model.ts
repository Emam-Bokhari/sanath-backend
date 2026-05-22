import { Schema, model } from "mongoose";
import { TListing, TListingModel } from "./listing.interface";
import {
  COUNCIL_TAX_BAND,
  FEATURES,
  LISTING_STATUS,
  LISTING_TYPE,
  PROPERTY_TYPE,
  TENURE,
} from "./listing.constant";
import { softDeletePlugin } from "../../../DB/plugins/softDeletePlugin";

const listingSchema = new Schema<TListing, TListingModel>(
  {
    title: {
      type: String,
    },
    listingType: {
      type: String,
      enum: Object.values(LISTING_TYPE),
    },
    askingPrice: {
      type: Number,
    },

    country: {
      type: String,
    },
    city: {
      type: String,
    },
    postalCode: {
      type: String,
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
      default: [],
    },
    videos: {
      type: [String],
      default: [],
    },
    views: {
      type: Number,
      default: 0,
    },
    viewedBy: {
      type: [Schema.Types.ObjectId],
      ref: "User",
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
    },
    propertyBathrooms: {
      type: Number,
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
    },
    description: {
      type: String,
    },
    // isFeatured: {
    //   type: Boolean,
    //   default: false,
    // },
    leadsCount: {
      type: Number,
      default: 0,
    },
    leads: {
      type: [Schema.Types.ObjectId],
      ref: "Enquery",
      default: [],
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

listingSchema.index({ location: "2dsphere" });

listingSchema.plugin(softDeletePlugin);

export const Listing = model<TListing, TListingModel>("Listing", listingSchema);
