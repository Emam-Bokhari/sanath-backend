import axios from "axios";
import { XMLParser } from "fast-xml-parser";
import { Types } from "mongoose";
import { Listing } from "../listing/listing.model";
import { TAgentFeed } from "./agentFeed.interface";
import { LISTING_STATUS } from "../listing/listing.constant";
import { makeSnapshot } from "./blmFeedImporter.service";
import {
  canAgentAddListings,
  decrementAgentRemainingListings,
} from "../listing/listing.utils";

// Helper to get first value if it's an array
const getSingleValue = (value: any): any => {
  return Array.isArray(value) ? value[0] : value;
};

// Helper to ensure we always get an array
const getArrayValue = (value: any): any[] => {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
};

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

export const importXMLFeed = async (
  feed: TAgentFeed & { _id: Types.ObjectId },
) => {
  const url = feed.xmlFeedUrl;
  if (!url) {
    throw new Error("XML feed URL is not specified");
  }

  console.log(`🔄 Fetching XML feed: ${url}`);
  const { data: xml } = await axios.get(url, {
    timeout: 90000,
    headers: { Accept: "application/xml, text/xml" },
  });

  const parser = new XMLParser({
    ignoreAttributes: false,
    parseAttributeValue: true,
    trimValues: true,
    isArray: () => true,
  });

  const parsed = parser.parse(xml);
  console.log("📄 Parsed XML:", JSON.stringify(parsed, null, 2));
  const properties = parsed?.properties?.[0]?.property || [];
  const propertyArray = Array.isArray(properties) ? properties : [properties];

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

  for (const prop of propertyArray) {
    try {
      const externalId = getSingleValue(prop.externalId);

      if (!externalId) {
        console.log(`❌ Skipping row: missing externalId`);
        failed++;
        continue;
      }

      if (seenExternalIds.has(externalId)) {
        console.log(`⚠️  Duplicate externalId in feed: ${externalId}`);
        duplicateInFeed++;
        continue;
      }
      seenExternalIds.add(externalId);

      const location = getSingleValue(prop.location);
      const details = getSingleValue(prop.details);
      const media = getSingleValue(prop.media);
      const features = getSingleValue(prop.features);
      const epcEnergyRatingVal = details
        ? getSingleValue(details.epcEnergyRating)
        : undefined;

      // Helper to deeply extract nested values, handling arrays at every level
      const extractNestedArray = (obj: any, path: string[]): any[] => {
        if (!obj || path.length === 0) return [];

        let current = obj;

        for (let i = 0; i < path.length - 1; i++) {
          const key = path[i];
          if (!current) return [];
          current = getSingleValue(current[key]);
        }

        const lastKey = path[path.length - 1];
        if (!current) return [];

        const finalValue = current[lastKey];
        const arrayValue = getArrayValue(finalValue);

        return arrayValue.map((item) => getSingleValue(item)).filter(Boolean);
      };

      // Helper to extract nested single value properly
      const extractNestedSingle = (obj: any, path: string[]): any => {
        let current = obj;
        for (const key of path) {
          if (!current) return undefined;
          current = getSingleValue(current[key]);
        }
        return getSingleValue(current);
      };

      const photos = extractNestedArray(media, ["photos", "photo"]);
      const epcEnergyRating = epcEnergyRatingVal
        ? {
            label: getSingleValue(epcEnergyRatingVal.label),
            score: Number(getSingleValue(epcEnergyRatingVal.score)) || 0,
          }
        : undefined;

      const baseListingData = {
        title: getSingleValue(prop.title),
        askingPrice: Number(getSingleValue(prop.price)) || 0,
        listingType: getSingleValue(prop.listingType),
        country: getSingleValue(location?.country),
        city: getSingleValue(location?.city),
        postalCode: getSingleValue(location?.postalCode),
        location:
          location?.lat && location?.lng
            ? {
                type: "Point" as const,
                coordinates: [
                  Number(getSingleValue(location.lng)),
                  Number(getSingleValue(location.lat)),
                ],
                address: getSingleValue(location?.address),
              }
            : undefined,
        propertyBedrooms: Number(getSingleValue(details?.bedrooms)) || 0,
        propertyBathrooms: Number(getSingleValue(details?.bathrooms)) || 0,
        propertySquareFoot:
          Number(getSingleValue(details?.squareFoot)) || undefined,
        propertyType: getSingleValue(details?.propertyType),
        tenure: getSingleValue(details?.tenure),
        councilTaxBand: getSingleValue(details?.councilTaxBand),
        photos: photos,
        videos: extractNestedArray(media, ["videos", "video"]),
        floorPlans: extractNestedArray(media, ["floorPlans", "floorPlan"]),
        brochure: extractNestedSingle(media, ["brochure"]),
        threeSixtyTour: extractNestedSingle(media, ["threeSixtyTour"]),
        epcEnergyRating,
        features: extractNestedArray(features, ["feature"]),
        description: getSingleValue(prop.description),
        agentId: feed.agentId,
        externalId: externalId,
        sourceUrl: url,
        source: "feed" as const,
        feedId: feed._id,
        feedSourceType: "XML" as const,
      };

      const generatedId = new Types.ObjectId();
      const shareId = generatedId.toString();

      // First check if listing already exists
      const existingListing = await Listing.findOne({
        feedId: feed._id,
        externalId,
        feedSourceType: "XML",
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
          { feedId: feed._id, externalId, feedSourceType: "XML" },
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
      const propExternalId = getSingleValue(prop.externalId);
      if (error.code === 11000) {
        console.log(
          `Duplicate key error (11000) caught for XML externalId ${propExternalId}. Skipping.`,
        );
        unchanged++;
      } else {
        console.error(`❌ Failed to process XML property ${propExternalId}:`, error);
        failed++;
      }
    }
  }

  // Soft-delete missing listings scoped to XML
  const listingsToDelete = await Listing.find({
    feedId: feed._id,
    feedSourceType: "XML",
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
    total: propertyArray.length,
  };
};
