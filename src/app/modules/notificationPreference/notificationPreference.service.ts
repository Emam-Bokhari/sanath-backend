import { NotificationPreferenceModel } from "./notificationPreference.model";
import { INotificationPreference } from "./notificationPreference.interface";


const getUserPreferenceFromDB = async (
  userId: string,
): Promise<INotificationPreference | Record<string, never>> => {
  const result = await NotificationPreferenceModel.findOne({ userId });
  if (!result) {
    return {};
  }
  return result;
};


const updateUserPreferenceToDB = async (
  userId: string,
  preferences: Partial<INotificationPreference>,
): Promise<INotificationPreference | null> => {
  // Using findOneAndUpdate with upsert: true handles both creation and update efficiently
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
