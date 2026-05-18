import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import { SubscriptionService } from "./subscription.service";

const createCheckoutSession = catchAsync(async (req: Request, res: Response) => {
  const { id: userId } = req.user as { id: string };
  const { planId } = req.body;
  const result = await SubscriptionService.createCheckoutSession(userId, planId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Checkout session created successfully",
    data: result,
  });
});

const cancelSubscription = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user._id;
  const result = await SubscriptionService.cancelSubscription(userId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Subscription canceled successfully",
    data: result,
  });
});

const getMySubscription = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user._id;
  const result = await SubscriptionService.getMySubscription(userId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Subscription retrieved successfully",
    data: result,
  });
});

export const SubscriptionController = {
  createCheckoutSession,
  cancelSubscription,
  getMySubscription,
};
