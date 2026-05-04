import { model, Schema } from "mongoose";
import { TBanner, TBannerModel } from "./banner.interface";

const bannerSchema = new Schema<TBanner, TBannerModel>(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    status: {
      type: Boolean,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const Banner = model<TBanner, TBannerModel>("Banner", bannerSchema);
