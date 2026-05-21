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
  subscriptionPurchase: boolean;
  userSignup: boolean;

  // enquiry flow
  enquiryCreated: boolean;     // নতুন enquiry তৈরি হলে
  enquiryReplied: boolean;     // যাকে enquiry পাঠানো হয়েছে সে reply করলে
  enquiryAssigned: boolean;    // agent/vendor কে assign করা হলে

  createdAt?: Date;
  updatedAt?: Date;
}