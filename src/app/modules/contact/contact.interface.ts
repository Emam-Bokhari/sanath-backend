import { Types } from "mongoose";
import { ISoftDeleteModel } from "../../../types/softDelete";

export type TContact = {
  userId?: Types.ObjectId;
  name: string;
  email?: string;
  subject: string;
  message: string;
};

export type TContactModel = ISoftDeleteModel<TContact>;
