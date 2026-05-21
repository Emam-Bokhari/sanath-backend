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
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true },

    // admin / super admin real-time
    socket: { type: Boolean, default: true },

    // system events
    listingApproved: { type: Boolean, default: true },
    listingRejected: { type: Boolean, default: true },
    subscriptionPurchase: { type: Boolean, default: true },
    userSignup: { type: Boolean, default: true },

    // enquiry flow
    enquiryCreated: { type: Boolean, default: true },
    enquiryReplied: { type: Boolean, default: true },
    enquiryAssigned: { type: Boolean, default: true },
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