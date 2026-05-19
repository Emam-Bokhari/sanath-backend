import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import ApiError from "../../errors/ApiErrors";
import { User } from "../modules/user/user.model";
import { IPlanFeatures } from "../modules/plan/plan.interface";
import { Subscription } from "../modules/subscription/subscription.model";

/**
 * Middleware to check if the user has an active subscription and optionally check for specific features.
 * @param requiredFeature Optional feature key to check if the plan supports it.
 */
const checkSubscription = (requiredFeature?: keyof IPlanFeatures) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, "You are not authorized");
      }

      const user = await User.findById(userId).populate("plan");
      if (!user) {
        throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
      }

      // Check if user has active subscription access in user model
      if (!user.hasAccess || !user.isSubscribed || !user.plan) {
        throw new ApiError(
          StatusCodes.PAYMENT_REQUIRED,
          "You need an active subscription to access this feature",
        );
      }

      // Double check the subscription record for expiration
      const activeSubscription = await Subscription.findOne({
        userId: user._id,
        status: { $in: ["active", "trialing"] },
      }).sort({ createdAt: -1 });

      if (!activeSubscription) {
        throw new ApiError(
          StatusCodes.PAYMENT_REQUIRED,
          "No active subscription record found",
        );
      }

      // Check if current date is past currentPeriodEnd
      if (
        activeSubscription.currentPeriodEnd &&
        new Date() > activeSubscription.currentPeriodEnd
      ) {
        throw new ApiError(
          StatusCodes.PAYMENT_REQUIRED,
          "Your subscription has expired. Please renew to continue.",
        );
      }

      const plan = user.plan as any; // Populated plan

      // Check for specific feature if requested
      if (requiredFeature && !plan.features?.[requiredFeature]) {
        throw new ApiError(
          StatusCodes.FORBIDDEN,
          `Your current plan does not support ${requiredFeature}`,
        );
      }

      // Attach plan to request for use in controllers
      (req as any).plan = plan;

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default checkSubscription;
