import { StatusCodes } from "http-status-codes";
import Stripe from "stripe";
import ApiError from "../errors/ApiErrors";
import stripe from "../config/stripe";
import { User } from "../app/modules/user/user.model";
import { Subscription } from "../app/modules/subscription/subscription.model";
import { Plan } from "../app/modules/plan/plan.model";
import { sendNotifications } from "../helpers/notificationsHelper";
import {
  NOTIFICATION_REFERENCE_MODEL,
  NOTIFICATION_TYPE,
} from "../app/modules/notification/notification.constant";

export const handleSubscriptionUpdated = async (data: Stripe.Subscription) => {
  // Retrieve the subscription from Stripe
  const subscription = await stripe.subscriptions.retrieve(data.id);

  // Retrieve the customer associated with the subscription
  const customer = (await stripe.customers.retrieve(
    subscription.customer as string,
  )) as Stripe.Customer;

  // Extract price ID from subscription items
  const priceId = subscription.items.data[0]?.price?.id;

  // Retrieve the invoice to get the transaction ID and amount paid
  let trxId: string | undefined;
  let amountPaid = 0;

  if (subscription.latest_invoice) {
    const invoice = await stripe.invoices.retrieve(
      subscription.latest_invoice as string,
    );
    trxId =
      typeof invoice?.payment_intent === "string"
        ? invoice.payment_intent
        : undefined;
    amountPaid = invoice?.total ? invoice.total / 100 : 0;
  }

  if (customer?.email) {
    // Find the user by email
    const existingUser = await User.findOne({ email: customer?.email });

    if (existingUser) {
      // Find the pricing plan by priceId
      const pricingPlan = await Plan.findOne({ priceId });

      if (pricingPlan) {
        // Find the current active subscription
        const currentActiveSubscription = await Subscription.findOne({
          subscriptionId: subscription.id,
        });

        if (currentActiveSubscription) {
          // Update existing subscription record
          let status = subscription.status;
          if (
            status === "past_due" ||
            status === "unpaid" ||
            status === "incomplete" ||
            status === "incomplete_expired"
          ) {
            status = "canceled" as any;
          }

          await Subscription.findByIdAndUpdate(currentActiveSubscription._id, {
            status: status as any,
            planId: pricingPlan._id,
            amountPaid,
            trxId,
            currentPeriodStart: new Date(
              subscription.current_period_start * 1000,
            ),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          });

          // Send Notification
          if (status === "active" || status === "trialing") {
            await sendNotifications({
              receiver: existingUser._id.toString(),
              title: "Subscription Updated",
              text: `Your subscription has been updated to the ${pricingPlan.title} plan.`,
              type: NOTIFICATION_TYPE.AGENT,
              referenceId: currentActiveSubscription._id.toString(),
              referenceModel: NOTIFICATION_REFERENCE_MODEL.SUBSCRIPTION,
              event: "subscriptionPurchase",
            });
          }

          // Update user
          const hasAccess = status === "active" || status === "trialing";
          await User.findByIdAndUpdate(existingUser._id, {
            plan: pricingPlan._id,
            hasAccess,
            isAgentVerified: hasAccess
              ? !!pricingPlan.features?.verifiedBadge
              : false,
            maxListings: hasAccess ? pricingPlan.limits?.maxListings || 0 : 0,
            remainingListings: hasAccess
              ? pricingPlan.limits?.maxListings || 0
              : 0,
          });
        } else {
          // Create if not exists and it's active
          const status = subscription.status;
          if (status !== "active" && status !== "trialing") {
            console.log(
              `Subscription ${subscription.id} is not active (status: ${status}). Skipping database creation in update handler.`,
            );
            return;
          }

          const newSubscription = new Subscription({
            userId: existingUser._id,
            customerId: customer?.id,
            planId: pricingPlan._id,
            subscriptionId: subscription.id,
            status: status as any,
            amountPaid,
            trxId,
            currentPeriodStart: new Date(
              subscription.current_period_start * 1000,
            ),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          });
          await newSubscription.save();

          await User.findByIdAndUpdate(existingUser._id, {
            isSubscribed: true,
            hasAccess: status === "active" || status === "trialing",
            plan: pricingPlan._id,
            subscriptionId: subscription.id,
            customerId: customer.id,
            isAgentVerified: !!pricingPlan.features?.verifiedBadge,
            maxListings: pricingPlan.limits?.maxListings || 0,
            remainingListings: pricingPlan.limits?.maxListings || 0,
          });
        }
      } else {
        console.error(`Pricing plan with Price ID: ${priceId} not found!`);
      }
    } else {
      console.error(`User with Email: ${customer.email} not found!`);
    }
  } else {
    console.error("No email found for the customer!");
  }
};
