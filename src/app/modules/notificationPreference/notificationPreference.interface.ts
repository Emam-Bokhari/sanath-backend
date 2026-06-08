import { Types } from "mongoose";

export interface INotificationPreference {
  userId: Types.ObjectId;

  // channel preferences
  email: boolean;
  push: boolean;

  // admin / super admin real-time
  socket: boolean;

  // system events (flat)
  listingApproved: boolean;
  listingRejected: boolean;
  subscription: boolean;
  userSignup: boolean;

  // enquiry flow
  enquiryCreated: boolean;
  enquiryReplied: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}
