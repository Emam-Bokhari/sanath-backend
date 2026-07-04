import { Types } from "mongoose";
import { TSearchParams } from "../listing/listing.interface";

export type TSavedSearch = {
  userId: Types.ObjectId;
  params: TSearchParams;
  name?: string;
};
