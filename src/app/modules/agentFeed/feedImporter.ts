import { Types } from "mongoose";
import { AgentFeed } from "./agentFeed.model";
import { TAgentFeed } from "./agentFeed.interface";
import { importXMLFeed } from "./xmlFeedImporter.service";
import { importBLMFeed } from "./blmFeedImporter.service";

export const importSingleFeed = async (
  feed: TAgentFeed & { _id: Types.ObjectId },
) => {
  const feedId = feed._id.toString();
  console.log(`🔄 Unified dispatcher running for feed: ${feedId} (Type: ${feed.feedType})`);

  const now = new Date();
  let xmlError: string | undefined = undefined;
  let blmError: string | undefined = undefined;

  let xmlResult = null;
  let blmResult = null;

  // Run XML importer if applicable
  if ((feed.feedType === "XML" || feed.feedType === "BOTH") && feed.xmlFeedUrl) {
    try {
      xmlResult = await importXMLFeed(feed);
    } catch (error: any) {
      console.error(`❌ XML feed sync error for feed ${feedId}:`, error);
      xmlError = error.message;
    }
  }

  // Run BLM importer if applicable
  if ((feed.feedType === "BLM" || feed.feedType === "BOTH") && feed.blmFeedUrl) {
    try {
      blmResult = await importBLMFeed(feed);
    } catch (error: any) {
      console.error(`❌ BLM feed sync error for feed ${feedId}:`, error);
      blmError = error.message;
    }
  }

  // Update AgentFeed sync state and errors
  const updateData: any = {
    lastSyncedAt: now,
    lastXmlSyncError: xmlError || null,
    lastBlmSyncError: blmError || null,
  };

  if (xmlError && blmError) {
    updateData.lastSyncError = `XML: ${xmlError} | BLM: ${blmError}`;
  } else if (xmlError) {
    updateData.lastSyncError = xmlError;
  } else if (blmError) {
    updateData.lastSyncError = blmError;
  } else {
    updateData.lastSyncError = null;
  }

  await AgentFeed.findByIdAndUpdate(feed._id, updateData);

  // If both failed and both were scheduled to run, throw an error so the queue job is marked failed
  const expectedXml = (feed.feedType === "XML" || feed.feedType === "BOTH") && feed.xmlFeedUrl;
  const expectedBlm = (feed.feedType === "BLM" || feed.feedType === "BOTH") && feed.blmFeedUrl;
  
  if (expectedXml && expectedBlm) {
    if (xmlError && blmError) {
      throw new Error(`Sync failed for both formats: XML: ${xmlError} | BLM: ${blmError}`);
    }
  } else if (expectedXml && xmlError) {
    throw new Error(`XML Sync failed: ${xmlError}`);
  } else if (expectedBlm && blmError) {
    throw new Error(`BLM Sync failed: ${blmError}`);
  }

  return {
    xmlResult,
    blmResult,
  };
};

export const importAllFeeds = async () => {
  console.log("🕒 Running bulk sync of all active feeds...");
  const activeFeeds = await AgentFeed.find({
    isActive: true,
    isDeleted: { $ne: true },
  });

  for (const feed of activeFeeds) {
    try {
      await importSingleFeed(
        feed as unknown as TAgentFeed & { _id: Types.ObjectId },
      );
    } catch (error) {
      console.error(`❌ Error syncing feed ${feed._id}:`, error);
    }
  }
};
