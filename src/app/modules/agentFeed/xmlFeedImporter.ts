import axios from "axios";
import { XMLParser } from "fast-xml-parser";
import { Types } from "mongoose";
import { Listing } from "../listing/listing.model";
import { TAgentFeed } from "./agentFeed.interface";
import { AgentFeed } from "./agentFeed.model";
import { LISTING_STATUS } from "../listing/listing.constant";

export const importSingleFeed = async (feed: TAgentFeed & { _id: Types.ObjectId }) => {
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
    const properties = parsed?.properties?.[0]?.property || [];
    const propertyArray = Array.isArray(properties) ? properties : [properties];

    const now = new Date();
    const externalIdsFromFeed: string[] = [];
    let created = 0;
    let updated = 0;
    let failed = 0;

    for (const prop of propertyArray) {
      try {
        if (!prop.externalId) {
          failed++;
          continue;
        }

        externalIdsFromFeed.push(prop.externalId);

        const listingData = {
          title: prop.title,
          askingPrice: Number(prop.price) || 0,
          listingType: prop.listingType,
          country: prop.location?.country,
          city: prop.location?.city,
          postalCode: prop.location?.postalCode,
          location:
            prop.location?.lat && prop.location?.lng
              ? {
                  type: "Point" as const,
                  coordinates: [
                    Number(prop.location.lng),
                    Number(prop.location.lat),
                  ],
                  address: prop.location?.address,
                }
              : undefined,
          propertyBedrooms: Number(prop.details?.bedrooms) || 0,
          propertyBathrooms: Number(prop.details?.bathrooms) || 0,
          propertySquareFoot: Number(prop.details?.squareFoot) || undefined,
          propertyType: prop.details?.propertyType,
          tenure: prop.details?.tenure,
          councilTaxBand: prop.details?.councilTaxBand,
          photos: prop.media?.photos?.photo || [],
          videos: prop.media?.videos?.video || [],
          floorPlans: prop.media?.floorPlans?.floorPlan || [],
          brochure: prop.media?.brochure,
          threeSixtyTour: prop.media?.threeSixtyTour,
          epcEnergyRating: prop.details?.epcEnergyRating
            ? {
                label: prop.details.epcEnergyRating.label,
                score: Number(prop.details.epcEnergyRating.score) || 0,
              }
            : undefined,
          features: prop.features?.feature || [],
          description: prop.description,
          agentId: feed.agentId,
          status: LISTING_STATUS.PUBLISHED,
          externalId: prop.externalId,
          sourceUrl: feed.feedUrl,
          source: "feed" as const,
          feedId: feed._id,
          lastSyncedAt: now,
        };

        const existingListing = await Listing.findOne({
          feedId: feed._id,
          externalId: prop.externalId,
          isDeleted: { $ne: true },
        });

        if (existingListing) {
          Object.assign(existingListing, listingData);
          await existingListing.save();
          updated++;
        } else {
          const newListing = await Listing.create(listingData);
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

  console.log(`Found ${activeFeeds.length} active feeds to import`);

  for (const feed of activeFeeds) {
    try {
      await importSingleFeed(feed as unknown as TAgentFeed & { _id: Types.ObjectId });
    } catch (error) {
      console.error(`Error importing feed ${feed._id}:`, error);
    }
  }
};
