import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { NotificationPreferenceService } from "./notificationPreference.service";

const getUserPreference = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const result =
    await NotificationPreferenceService.getUserPreferenceFromDB(userId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Notification preferences retrieved successfully",
    data: result,
  });
});

const updateUserPreference = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const result = await NotificationPreferenceService.updateUserPreferenceToDB(
    userId,
    req.body,
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Notification preferences updated successfully",
    data: result,
  });
});

export const NotificationPreferenceController = {
  getUserPreference,
  updateUserPreference,
};
