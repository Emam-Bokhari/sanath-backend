import axios from "axios";
import { XMLParser } from "fast-xml-parser";
import { Types } from "mongoose";
import { Listing } from "../listing/listing.model";
import { TAgentFeed } from "./agentFeed.interface";
import { AgentFeed } from "./agentFeed.model";
import { LISTING_STATUS } from "../listing/listing.constant";

// Helper to get first value if it's an array
const getSingleValue = (value: any): any => {
  return Array.isArray(value) ? value[0] : value;
};

// Helper to ensure we always get an array
const getArrayValue = (value: any): any[] => {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
};

export const importSingleFeed = async (
  feed: TAgentFeed & { _id: Types.ObjectId },
) => {
  try {
    console.log(`🔄 Importing feed: ${feed.feedUrl}`);

    const { data: xml } = await axios.get(feed.feedUrl, {
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
    console.log("📄 Parsed XML:", JSON.stringify(parsed, null, 2)); // Debug: See the full parsed structure
    const properties = parsed?.properties?.[0]?.property || [];
    const propertyArray = Array.isArray(properties) ? properties : [properties];

    const now = new Date();
    const externalIdsFromFeed: string[] = [];
    let created = 0;
    let updated = 0;
    let failed = 0;

    for (const prop of propertyArray) {
      try {
        const externalId = getSingleValue(prop.externalId);

        if (!externalId) {
          failed++;
          continue;
        }

        externalIdsFromFeed.push(externalId);

        const location = getSingleValue(prop.location);
        const details = getSingleValue(prop.details);
        const media = getSingleValue(prop.media);
        const features = getSingleValue(prop.features);
        const epcEnergyRating = details
          ? getSingleValue(details.epcEnergyRating)
          : undefined;

        // Helper to deeply extract nested values, handling arrays at every level
        const extractNestedArray = (obj: any, path: string[]): any[] => {
          if (!obj || path.length === 0) return [];

          let current = obj;

          // Traverse all keys except the last one
          for (let i = 0; i < path.length - 1; i++) {
            const key = path[i];
            if (!current) return [];
            // Unwrap arrays at every step
            current = getSingleValue(current[key]);
          }

          const lastKey = path[path.length - 1];
          if (!current) return [];

          // Get the final array, unwrapping if necessary
          const finalValue = current[lastKey];
          const arrayValue = getArrayValue(finalValue);

          // Unwrap each individual item in the array
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

        // Create base listing data without status (we'll set status conditionally)
        const photos = extractNestedArray(media, ["photos", "photo"]);
        console.log(
          `🖼️ Extracted ${photos.length} photos for ${externalId}:`,
          photos,
        );

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
          epcEnergyRating: epcEnergyRating
            ? {
                label: getSingleValue(epcEnergyRating.label),
                score: Number(getSingleValue(epcEnergyRating.score)) || 0,
              }
            : undefined,
          features: extractNestedArray(features, ["feature"]),
          description: getSingleValue(prop.description),
          agentId: feed.agentId,
          externalId: externalId,
          sourceUrl: feed.feedUrl,
          source: "feed" as const,
          feedId: feed._id,
          lastSyncedAt: now,
        };

        const existingListing = await Listing.findOne({
          feedId: feed._id,
          externalId: externalId,
          isDeleted: { $ne: true },
        });

        if (existingListing) {
          // Update existing listing: keep current status, update everything else
          Object.assign(existingListing, baseListingData);
          await existingListing.save();
          updated++;
        } else {
          // When creating new listing: set to PENDING_APPROVAL
          const newListing = await Listing.create({
            ...baseListingData,
            status: LISTING_STATUS.PENDING_APPROVAL,
          });
          newListing.shareId = newListing._id.toString();
          await newListing.save();
          created++;
        }
      } catch (error) {
        failed++;
        console.error(`❌ Failed to process property:`, error);
      }
    }

    // Soft delete listings that are no longer in the feed
    const listingsToDelete = await Listing.find({
      feedId: feed._id,
      externalId: { $nin: externalIdsFromFeed },
      isDeleted: { $ne: true },
    });

    console.log(listingsToDelete, "listings to delete");

    for (const listing of listingsToDelete) {
      listing.isDeleted = true;
      await listing.save();
    }

    // Update feed's last synced time
    await AgentFeed.findByIdAndUpdate(feed._id, {
      lastSyncedAt: now,
      lastSyncError: undefined,
    });

    const result = {
      created,
      updated,
      deleted: listingsToDelete.length,
      failed,
      total: propertyArray.length,
    };

    console.log(`✅ Feed import completed:`, result);
    return result;
  } catch (error: any) {
    console.error("❌ Feed import error:", error);
    await AgentFeed.findByIdAndUpdate(feed._id, {
      lastSyncError: error.message,
    });
    throw error;
  }
};

export const importAllFeeds = async () => {
  const activeFeeds = await AgentFeed.find({
    isActive: true,
    isDeleted: { $ne: true },
  } as any);

  for (const feed of activeFeeds) {
    try {
      await importSingleFeed(
        feed as unknown as TAgentFeed & { _id: Types.ObjectId },
      );
    } catch (error) {
      console.error(`Error importing feed ${feed._id}:`, error);
    }
  }
};
