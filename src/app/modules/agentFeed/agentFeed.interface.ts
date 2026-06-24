import { Types } from "mongoose";
import { ISoftDeleteModel } from "../../../types/softDelete";
import { FEED_TYPE } from "./agentFeed.constant";

export type TAgentFeed = {
  agentId: Types.ObjectId;
  feedType: FEED_TYPE;
  xmlFeedUrl?: string;
  blmFeedUrl?: string;
  name?: string;
  isActive: boolean;
  lastSyncedAt?: Date;
  lastSyncError?: string;
  lastXmlSyncError?: string;
  lastBlmSyncError?: string;
  isDeleted?: boolean;
};

export type TAgentFeedModel = ISoftDeleteModel<TAgentFeed>;
