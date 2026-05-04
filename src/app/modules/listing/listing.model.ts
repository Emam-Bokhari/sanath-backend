import { Schema, model } from "mongoose";
import { TListing } from "./listing.interface";
import {
    COUNCIL_TAX_BAND,
    LISTING_STATUS,
    PROPERTY_TYPE,
    TENURE,
} from "./listing.constant";

const ListingSchema = new Schema<TListing>(
    {
        title: { type: String, required: true },
        askingPrice: { type: Number, required: true },

        country: String,
        city: String,
        postalCode: String,

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

        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        photos: [String],
        videos: [String],
        floorPlan: String,
        brochure: String,
        threeSixtyTour: String,

        propertyType: {
            type: String,
            enum: Object.values(PROPERTY_TYPE),
        },

        propertyBedrooms: Number,
        propertyBathrooms: Number,
        propertySquareFoot: Number,

        tenure: {
            type: String,
            enum: Object.values(TENURE),
        },

        councilTaxBand: {
            type: String,
            enum: Object.values(COUNCIL_TAX_BAND),
        },

        epcEnergyRating: {
            label: String,
            score: Number,
        },

        features: [String],
        description: String,

        listingCheckList: {
            basicInfo: Boolean,
            media: Boolean,
            propertyInfo: Boolean,
            featureDescription: Boolean,
            readyToPublish: Boolean,
        },

        status: {
            type: String,
            enum: Object.values(LISTING_STATUS),
            default: LISTING_STATUS.DRAFT,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

export const ListingModel = model<TListing>("Listing", ListingSchema);