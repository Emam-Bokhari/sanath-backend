import { StatusCodes } from "http-status-codes";
import Stripe from "stripe";
import ApiError from "../errors/ApiErrors";
import stripe from "../config/stripe";
import { User } from "../app/modules/user/user.model";
import { Subscription } from "../app/modules/subscription/subscription.model";

export const handleSubscriptionDeleted = async (data: Stripe.Subscription) => {
  // Retrieve the subscription from Stripe
  const subscription = await stripe.subscriptions.retrieve(data.id);

  // Find the current active subscription
  const userSubscription = await Subscription.findOne({
    subscriptionId: subscription.id,
  });

  if (userSubscription) {
    // Deactivate the subscription
    await Subscription.findByIdAndUpdate(
      userSubscription._id,
      { status: "canceled" },
      { new: true },
    );

    // Find the user associated with the subscription
    const existingUser = await User.findById(userSubscription?.userId);

    if (existingUser) {
      await User.findByIdAndUpdate(
        existingUser._id,
        {
          hasAccess: false,
          isSubscribed: false,
          isAgentVerified: false,
          maxListings: 0,
          remainingListings: 0,
        },
        { new: true },
      );
    } else {
      console.error(`User not found for subscription ${subscription.id}`);
    }
  } else {
    console.error(`Subscription record not found for ${subscription.id}`);
  }
};
