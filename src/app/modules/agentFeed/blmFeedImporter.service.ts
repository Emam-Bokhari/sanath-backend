import axios from "axios";
import { Types } from "mongoose";
import { Listing } from "../listing/listing.model";
import { TAgentFeed } from "./agentFeed.interface";
import { LISTING_STATUS } from "../listing/listing.constant";
import { FIELD_MAP, parseBLMContent, splitMultiValueField } from "./blm.utils";
import {
  canAgentAddListings,
  decrementAgentRemainingListings,
} from "../listing/listing.utils";

const CONTENT_FIELDS = [
  "title",
  "askingPrice",
  "listingType",
  "country",
  "city",
  "postalCode",
  "location",
  "propertyBedrooms",
  "propertyBathrooms",
  "propertySquareFoot",
  "propertyType",
  "tenure",
  "councilTaxBand",
  "epcEnergyRating",
  "photos",
  "videos",
  "floorPlans",
  "brochure",
  "threeSixtyTour",
  "features",
  "description",
] as const;

export function makeSnapshot(data: any) {
  const normalized: any = {};
  for (const key of CONTENT_FIELDS) {
    const val = data[key];
    if (val === undefined || val === null) {
      normalized[key] = null;
    } else if (key === "location") {
      normalized[key] = {
        type: val.type || "Point",
        coordinates: Array.isArray(val.coordinates)
          ? val.coordinates.map(Number)
          : null,
        address: val.address || null,
      };
    } else if (key === "epcEnergyRating") {
      normalized[key] = {
        label: val.label || null,
        score:
          val.score !== undefined && val.score !== null
            ? Number(val.score)
            : null,
      };
    } else if (Array.isArray(val)) {
      normalized[key] = val.map((item: any) =>
        item === undefined || item === null ? null : item,
      );
    } else {
      normalized[key] = val;
    }
  }
  return JSON.stringify(normalized);
}

export const importBLMFeed = async (
  feed: TAgentFeed & { _id: Types.ObjectId },
) => {
  const url = feed.blmFeedUrl;
  if (!url) {
    throw new Error("BLM feed URL is not specified");
  }

  console.log(`🔄 Fetching BLM feed: ${url}`);
  const { data: content } = await axios.get(url, {
    timeout: 90000,
    responseType: "text",
  });

  const rows = parseBLMContent(content);
  console.log(`📄 Parsed ${rows.length} BLM rows`);

  const now = new Date();
  const seenExternalIds = new Set<string>();

  let created = 0;
  let replaced = 0;
  let unchanged = 0;
  let duplicateInFeed = 0;
  let failed = 0;
  let skippedDueToLimit = 0;

  // Get initial limit info
  const initialLimitCheck = await canAgentAddListings(feed.agentId, 1);
  let remainingSlots = initialLimitCheck.remaining;
  const maxListings = initialLimitCheck.max;

  // Add more detailed logging
  console.log(`📊 Listing limits for agent ${feed.agentId}: max=${maxListings}, remaining=${remainingSlots}`);

  for (const row of rows) {
    const externalId = row["EXTERNALID"];

    if (!externalId) {
      console.log(`❌ Skipping row: missing EXTERNALID`);
      failed++;
      continue;
    }

    if (seenExternalIds.has(externalId)) {
      console.log(`⚠️  Duplicate EXTERNALID in feed: ${externalId}`);
      duplicateInFeed++;
      continue;
    }
    seenExternalIds.add(externalId);

    try {
      const title = row["TITLE"] || "";
      const price = Number(row["PRICE"]) || 0;
      const listingType = row["LISTINGTYPE"] || "";
      const country = row["COUNTRY"] || "";
      const city = row["CITY"] || "";
      const postalCode = row["POSTALCODE"] || "";
      const address = row["ADDRESS"] || "";
      const lat = row["LAT"];
      const lng = row["LNG"];
      const bedrooms = Number(row["BEDROOMS"]) || 0;
      const bathrooms = Number(row["BATHROOMS"]) || 0;
      const squareFoot = row["SQUAREFOOT"]
        ? Number(row["SQUAREFOOT"])
        : undefined;
      const propertyType = row["PROPERTYTYPE"] || "";
      const tenure = row["TENURE"] || "";
      const councilTaxBand = row["COUNCILTAXBAND"] || "";
      const epcLabel = row["EPCLABEL"] || "";
      const epcScore = row["EPCSCORE"];

      const photos = splitMultiValueField(row["PHOTOS"]);
      const videos = splitMultiValueField(row["VIDEOS"]);
      const floorPlans = splitMultiValueField(row["FLOORPLANS"]);
      const brochure = row["BROCHURE"] || undefined;
      const threeSixtyTour = row["THREESIXTYTOUR"] || undefined;
      const features = splitMultiValueField(row["FEATURES"]);
      const description = row["DESCRIPTION"] || "";

      const location =
        lat && lng
          ? {
              type: "Point" as const,
              coordinates: [Number(lng), Number(lat)] as [number, number],
              address: address,
            }
          : undefined;

      const epcEnergyRating =
        epcLabel || epcScore
          ? {
              label: epcLabel,
              score: Number(epcScore) || 0,
            }
          : undefined;

      const baseListingData = {
        title,
        askingPrice: price,
        listingType: listingType as any,
        country,
        city,
        postalCode,
        location,
        propertyBedrooms: bedrooms,
        propertyBathrooms: bathrooms,
        propertySquareFoot: squareFoot,
        propertyType: propertyType as any,
        tenure: tenure as any,
        councilTaxBand: councilTaxBand as any,
        epcEnergyRating,
        photos,
        videos,
        floorPlans,
        brochure,
        threeSixtyTour,
        features,
        description,
        agentId: feed.agentId,
        externalId,
        source: "feed" as const,
        sourceUrl: url,
        feedId: feed._id,
        feedSourceType: "BLM" as const,
      };

      const generatedId = new Types.ObjectId();
      const shareId = generatedId.toString();

      // First check if listing already exists
      const existingListing = await Listing.findOne({
        feedId: feed._id,
        externalId,
        feedSourceType: "BLM",
      });

      if (existingListing) {
        // Listing exists - check if it's identical or needs update
        const snapExisting = makeSnapshot(existingListing.toObject());
        const snapIncoming = makeSnapshot(baseListingData);

        if (snapExisting !== snapIncoming || existingListing.isDeleted) {
          // Content has changed or listing was soft-deleted: fully replace all content fields
          const updateDoc: any = {
            status: LISTING_STATUS.PENDING_APPROVAL,
            lastSyncedAt: now,
            isDeleted: false,
          };

          for (const key of CONTENT_FIELDS) {
            updateDoc[key] =
              (baseListingData as any)[key] !== undefined
                ? (baseListingData as any)[key]
                : null;
          }

          await Listing.updateOne(
            { _id: existingListing._id },
            { $set: updateDoc },
          );
          console.log(`✅ Updated existing listing: ${externalId}`);
          replaced++;
        } else {
          console.log(`⏭️  Listing unchanged: ${externalId}`);
          unchanged++;
        }
      } else {
        // New listing - check if we have remaining slots
        if (maxListings !== -1 && remainingSlots <= 0) {
          console.log(`⏭️  Skipping due to limit: ${externalId}`);
          skippedDueToLimit++;
          continue;
        }

        // Atomic, race-safe upsert using updateOne + $setOnInsert
        const upsertResult = await Listing.updateOne(
          { feedId: feed._id, externalId, feedSourceType: "BLM" },
          {
            $setOnInsert: {
              _id: generatedId,
              shareId,
              status: LISTING_STATUS.PENDING_APPROVAL,
              isDeleted: false,
              lastSyncedAt: now,
              ...baseListingData,
            },
          },
          { upsert: true },
        );

        if (upsertResult.upsertedCount > 0) {
          console.log(`✅ Created new listing: ${externalId}`);
          created++;
          if (maxListings !== -1) {
            remainingSlots--;
            console.log(`📉 Remaining slots: ${remainingSlots}`);
          }
        }
      }
    } catch (error: any) {
      if (error.code === 11000) {
        console.log(
          `Duplicate key error (11000) caught for BLM externalId ${externalId}. Skipping.`,
        );
        unchanged++;
      } else {
        console.error(
          `❌ Failed to process BLM property ${externalId}:`,
          error,
        );
        failed++;
      }
    }
  }

  // Soft-delete missing listings scoped to BLM
  const listingsToDelete = await Listing.find({
    feedId: feed._id,
    feedSourceType: "BLM",
    externalId: { $nin: Array.from(seenExternalIds) },
    isDeleted: { $ne: true },
  });

  for (const listing of listingsToDelete) {
    listing.isDeleted = true;
    await listing.save();
  }

  // Update remaining listings count
  if (created > 0) {
    await decrementAgentRemainingListings(feed.agentId, created);
  }

  return {
    created,
    replaced,
    unchanged,
    duplicateInFeed,
    deleted: listingsToDelete.length,
    failed,
    skippedDueToLimit,
    total: rows.length,
  };
};
