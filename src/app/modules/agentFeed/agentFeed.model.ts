import { model, Schema } from "mongoose";
import { TAgentFeed, TAgentFeedModel } from "./agentFeed.interface";
import { softDeletePlugin } from "../../../DB/plugins/softDeletePlugin";
import { FEED_TYPE } from "./agentFeed.constant";

const agentFeedSchema = new Schema<TAgentFeed, TAgentFeedModel>(
  {
    agentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    feedType: {
      type: String,
      enum: Object.values(FEED_TYPE),
      required: true,
    },
    xmlFeedUrl: {
      type: String,
    },
    blmFeedUrl: {
      type: String,
    },
    name: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastSyncedAt: {
      type: Date,
    },
    lastSyncError: {
      type: String,
    },
    lastXmlSyncError: {
      type: String,
    },
    lastBlmSyncError: {
      type: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

agentFeedSchema.plugin(softDeletePlugin);

export const AgentFeed = model<TAgentFeed, TAgentFeedModel>(
  "AgentFeed",
  agentFeedSchema,
);
