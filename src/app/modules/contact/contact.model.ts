import { model, Schema } from "mongoose";
import { softDeletePlugin } from "../../../DB/plugins/softDeletePlugin";
import { TContact, TContactModel } from "./contact.interface";

const contactSchema = new Schema<TContact, TContactModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    name: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: false,
    },
    subject: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    }
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

contactSchema.plugin(softDeletePlugin);

export const Contact = model<TContact, TContactModel>("Contact", contactSchema);
