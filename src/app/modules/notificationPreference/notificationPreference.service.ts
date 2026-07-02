import { NotificationPreferenceModel } from "./notificationPreference.model";
import { INotificationPreference } from "./notificationPreference.interface";
import { User } from "../user/user.model";
import { USER_ROLES } from "../../../enums/user";

export const ADMIN_NOTIFICATION_DEFAULTS = {
  email: true,
  push: false,
  socket: true,
  userSignup: true,
  subscription: true,
  listingApproved: false,
  listingRejected: false,
  enquiryCreated: false,
  enquiryReplied: false,
};

const getUserPreferenceFromDB = async (
  userId: string,
): Promise<INotificationPreference | Record<string, any>> => {
  const result = await NotificationPreferenceModel.findOne({ userId });
  if (!result) {
    const user = await User.findById(userId);
    if (
      user &&
      (user.role === USER_ROLES.ADMIN || user.role === USER_ROLES.SUPER_ADMIN)
    ) {
      return {
        userId,
        ...ADMIN_NOTIFICATION_DEFAULTS,
      };
    }
    return {};
  }
  return result;
};

const updateUserPreferenceToDB = async (
  userId: string,
  preferences: Partial<INotificationPreference>,
): Promise<INotificationPreference | null> => {
  // using findOneAndUpdate with upsert: true handles both creation and update efficiently
  const result = await NotificationPreferenceModel.findOneAndUpdate(
    { userId },
    { $set: preferences },
    { new: true, upsert: true },
  );
  return result;
};

export const NotificationPreferenceService = {
  getUserPreferenceFromDB,
  updateUserPreferenceToDB,
};
