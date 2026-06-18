import { model, Schema } from "mongoose";
import { TAgentFeed, TAgentFeedModel } from "./agentFeed.interface";
import { softDeletePlugin } from "../../../DB/plugins/softDeletePlugin";

const agentFeedSchema = new Schema<TAgentFeed, TAgentFeedModel>(
  {
    agentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    feedUrl: {
      type: String,
      required: true,
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
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

agentFeedSchema.plugin(softDeletePlugin);

export const AgentFeed = model<TAgentFeed, TAgentFeedModel>("AgentFeed", agentFeedSchema);
