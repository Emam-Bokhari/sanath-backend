import { TListing, TListingChecklist } from "./listing.interface";
import { Types } from "mongoose";
import fs from "fs";
import path from "path";
import * as csv from "fast-csv";
import { User } from "../user/user.model";
import { Listing } from "./listing.model";

const FRONTEND_URL = process.env.CLIENT_URL!;

export const generateShareLink = (shareId: string) => {
  return `${FRONTEND_URL}/share/${shareId}`;
};

const hasValue = (v: any) => v !== undefined && v !== null && v !== "";

export const parseCSVFile = <T>(filePath: string): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    const results: T[] = [];
    fs.createReadStream(filePath)
      .pipe(csv.parse({ headers: true, trim: true }))
      .on("data", (data) => results.push(data))
      .on("error", (error) => reject(error))
      .on("end", () => resolve(results));
  });
};

export const resolveLocalMediaPath = (filename: string, folder: string) => {
  if (!filename) return "";
  // Ensure we don't double slash or miss one
  return `/uploads/${folder}/${filename}`;
};

export const checkFileExists = (filename: string, folder: string) => {
  if (!filename) return false;
  const filePath = path.join(process.cwd(), "uploads", folder, filename);
  return fs.existsSync(filePath);
};

export const generateChecklist = (listing: TListing) => {
  const basicInfo =
    hasValue(listing.title) &&
    hasValue(listing.askingPrice) &&
    hasValue(listing.country) &&
    hasValue(listing.city) &&
    hasValue(listing.postalCode);

  const media =
    (listing.photos?.length || 0) >= 6 && (listing.videos?.length || 0) > 0;

  const propertyInfo =
    hasValue(listing.propertyType) &&
    hasValue(listing.propertyBedrooms) &&
    hasValue(listing.propertyBathrooms);

  const featureDescription =
    (listing.features?.length || 0) > 0 && hasValue(listing.description);

  const readyToPublish =
    basicInfo && media && propertyInfo && featureDescription;

  return {
    basicInfo,
    media,
    propertyInfo,
    featureDescription,
    readyToPublish,
  };
};

export const canPublishListing = (checklist?: TListingChecklist) => {
  return (
    checklist?.basicInfo &&
    checklist?.media &&
    checklist?.propertyInfo &&
    checklist?.featureDescription
  );
};

export const getMissingChecklistItems = (checklist: TListingChecklist) => {
  const missing = [];
  if (!checklist.basicInfo) missing.push("Basic Info (title, price, location)");
  if (!checklist.media) missing.push("Media (at least 6 photos and 1 video)");
  if (!checklist.propertyInfo)
    missing.push("Property Info (type, bedrooms, bathrooms)");
  if (!checklist.featureDescription)
    missing.push("Feature & Description (features and description text)");

  return missing;
};

export interface ListingLimitInfo {
  maxListings: number;
  currentListings: number;
  remainingListings: number;
  canAddMore: boolean;
}

export const getAgentListingLimitInfo = async (
  agentId: string | Types.ObjectId
): Promise<ListingLimitInfo> => {
  const user = await User.findById(agentId).populate("plan");
  if (!user) {
    console.log(`❌ User not found for agentId: ${agentId}`);
    return {
      maxListings: 0,
      currentListings: 0,
      remainingListings: 0,
      canAddMore: false,
    };
  }

  console.log(`🔍 User data for ${agentId}:`, {
    isSubscribed: user.isSubscribed,
    hasAccess: user.hasAccess,
    maxListings: user.maxListings,
    remainingListings: user.remainingListings,
    plan: user.plan ? (user.plan as any)._id : null,
    planDetails: user.plan ? (user.plan as any).limits : null,
  });

  const currentListings = await Listing.countDocuments({
    agentId: new Types.ObjectId(agentId),
    isDeleted: { $ne: true },
  });

  const maxListings = user.maxListings ?? 0;

  const remainingListings =
    maxListings === -1 ? -1 : Math.max(0, maxListings - currentListings);

  return {
    maxListings,
    currentListings,
    remainingListings,
    canAddMore: maxListings === -1 || remainingListings > 0,
  };
};

export const canAgentAddListings = async (
  agentId: string | Types.ObjectId,
  numberOfListingsToAdd: number = 1
): Promise<{ allowed: boolean; remaining: number; max: number }> => {
  const limitInfo = await getAgentListingLimitInfo(agentId);
  
  if (limitInfo.maxListings === -1) {
    return { allowed: true, remaining: -1, max: -1 };
  }

  const allowed = limitInfo.remainingListings >= numberOfListingsToAdd;
  
  return {
    allowed,
    remaining: limitInfo.remainingListings,
    max: limitInfo.maxListings,
  };
};

export const decrementAgentRemainingListings = async (
  agentId: string | Types.ObjectId,
  decrementBy: number = 1
): Promise<void> => {
  await User.findByIdAndUpdate(agentId, {
    $inc: { remainingListings: -decrementBy },
  });
};

export const incrementAgentRemainingListings = async (
  agentId: string | Types.ObjectId,
  incrementBy: number = 1
): Promise<void> => {
  const user = await User.findById(agentId);
  if (!user) return;

  const maxListings = user.maxListings ?? 0;
  if (maxListings === -1) return;

  // Don't let remainingListings exceed maxListings
  await User.findByIdAndUpdate(agentId, {
    $inc: { remainingListings: incrementBy },
  });
};
