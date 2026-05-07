import { Types, Document } from "mongoose";

export interface TFavoriteProperty extends Document {
  userId: Types.ObjectId;
  listingId: Types.ObjectId;
}