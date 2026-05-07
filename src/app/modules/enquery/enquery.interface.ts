import { Types } from "mongoose";
import { ISoftDeleteModel } from "../../../types/softDelete";

export type TEnquery = {
  userId?: Types.ObjectId;
  listingId?: Types.ObjectId;
//   subject?: string;
  name: string;
  email: string;
  phone: string;
  postalCode: string;
  country: string;
  message: string;
};

export type TEnqueryModel = ISoftDeleteModel<TEnquery>;