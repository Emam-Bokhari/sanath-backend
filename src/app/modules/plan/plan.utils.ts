import Stripe from "stripe";
import stripe from "../../../config/stripe";
import { PLATFORM_PLAN_DURATION } from "./plan.constant";

export const createSubscriptionProduct = async (payload: {
  title: string;
  description?: string;
  duration: PLATFORM_PLAN_DURATION;
  price: number;
  currency?: string;
}) => {
  try {
    // 1. Create Product
    const product = await stripe.products.create({
      name: payload.title,
      description: payload.description,
    });

    // 2. Map duration to Stripe recurring interval
    let interval: Stripe.PriceCreateParams.Recurring.Interval = "month";
    let interval_count = 1;

    switch (payload.duration) {
      case PLATFORM_PLAN_DURATION.MONTHLY:
        interval = "month";
        interval_count = 1;
        break;
      case PLATFORM_PLAN_DURATION.QUARTERLY:
        interval = "month";
        interval_count = 3;
        break;
      case PLATFORM_PLAN_DURATION.HALF_YEARLY:
        interval = "month";
        interval_count = 6;
        break;
      case PLATFORM_PLAN_DURATION.YEARLY:
        interval = "year";
        interval_count = 1;
        break;
    }

    // 3. Create Price
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(payload.price * 100), // amount in cents
      currency: payload.currency || "gbp",
      recurring: {
        interval,
        interval_count,
      },
    });

    return {
      productId: product.id,
      priceId: price.id,
    };
  } catch (error: any) {
    console.error("Stripe Product Creation Error:", error);
    return null;
  }
};
