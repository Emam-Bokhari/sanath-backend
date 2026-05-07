import { Types } from "mongoose";

export type TEnquery = {
  userId?: Types.ObjectId;
  listingId?: Types.ObjectId;
  subject?: string;
  name: string;
  email: string;
  phone: string;
  postalCode: string;
  country: string;
  message: string;
};