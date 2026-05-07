import { Types, Document } from "mongoose";
import { ISoftDeleteModel } from "../../../types/softDelete";

export interface TFavoriteProperty extends Document {
  userId: Types.ObjectId;
  listingId: Types.ObjectId;
}

export type TFavoriteModel=ISoftDeleteModel<TFavoriteProperty>
