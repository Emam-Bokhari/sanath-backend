import { Types } from "mongoose";
import { ISoftDeleteModel } from "../../../types/softDelete";

export type TPopularLocation = {
  name: string;
  image: string;
  listings: (Types.ObjectId | string)[];
  totalListing?: number;
  isDeleted: boolean;
};

export type TPopularLocationModel = ISoftDeleteModel<TPopularLocation>;
