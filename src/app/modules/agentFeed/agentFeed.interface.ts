import { Types } from "mongoose";
import { ISoftDeleteModel } from "../../../types/softDelete";

export type TAgentFeed = {
  agentId: Types.ObjectId;
  feedUrl: string;
  name?: string;
  isActive: boolean;
  lastSyncedAt?: Date;
  lastSyncError?: string;
  isDeleted?: boolean;
};

export type TAgentFeedModel = ISoftDeleteModel<TAgentFeed>;
