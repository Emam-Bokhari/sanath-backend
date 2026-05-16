import { Types } from "mongoose";
import { TSearchParams } from "../listing/listing.interface";
import { ISoftDeleteModel } from "../../../types/softDelete";

export type TSavedSearch = {
  userId: Types.ObjectId;
  params: TSearchParams;
  name?: string;
  isDeleted?: boolean;
};

export type TSavedSearchModel = ISoftDeleteModel<TSavedSearch>;
