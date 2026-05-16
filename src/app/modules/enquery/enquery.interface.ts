import { Types } from "mongoose";
import { ISoftDeleteModel } from "../../../types/softDelete";
import { ENQUERY_STATUS } from "./enquery.constant";

export type TEnquery = {
  userId?: Types.ObjectId;
  listingId?: Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  postalCode: string;
  country: string;
  message: string;
  status: ENQUERY_STATUS;
};

export type TEnqueryModel = ISoftDeleteModel<TEnquery>;
