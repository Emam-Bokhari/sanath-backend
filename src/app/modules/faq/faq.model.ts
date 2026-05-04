import { model, Schema } from "mongoose";
import { TFaq, TFaqModel } from "./faq.interface";

const faqSchema = new Schema<TFaq, TFaqModel>(
  {
    question: {
      type: String,
      required: true,
    },
    answer: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);
export const Faq = model<TFaq, TFaqModel>("Faq", faqSchema);
