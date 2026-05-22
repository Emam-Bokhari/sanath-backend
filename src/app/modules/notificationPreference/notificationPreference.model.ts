import { Schema, model, Types } from "mongoose";
import { INotificationPreference } from "./notificationPreference.interface";

const NotificationPreferenceSchema = new Schema<INotificationPreference>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    // channel preferences
    email: { type: Boolean, default: false },
    push: { type: Boolean, default: false },

    // admin / super admin real-time
    socket: { type: Boolean, default: false },

    // system events
    listingApproved: { type: Boolean, default: false },
    listingRejected: { type: Boolean, default: false },
    subscription: { type: Boolean, default: false },
    userSignup: { type: Boolean, default: false },

    // enquiry flow
    enquiryCreated: { type: Boolean, default: false },
    enquiryReplied: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const NotificationPreferenceModel = model<INotificationPreference>(
  "NotificationPreference",
  NotificationPreferenceSchema
);