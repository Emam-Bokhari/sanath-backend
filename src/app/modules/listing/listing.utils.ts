import { TListing, TListingChecklist } from "./listing.interface";
import fs from "fs";
import path from "path";
import * as csv from "fast-csv";
import crypto from "crypto";

const FRONTEND_URL = process.env.CLIENT_URL!;

export const generateShareId = () => {
  return crypto.randomBytes(8).toString("hex");
};

export const generateSlug = (title: string) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
};

export const generateShareLink = (shareId: string, slug: string) => {
  return `${FRONTEND_URL}/l/${shareId}/${slug}`;
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
