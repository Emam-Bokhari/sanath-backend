import { INotificationPreference } from "../app/modules/notificationPreference/notificationPreference.interface";
import { NotificationPreferenceModel } from "../app/modules/notificationPreference/notificationPreference.model";


export const canSendNotification = async (
  userId: string,
  channel: 'email' | 'push' | 'socket',
  event?: keyof Omit<INotificationPreference, 'userId' | 'agentId' | 'email' | 'push' | 'socket' | 'createdAt' | 'updatedAt'>
): Promise<boolean> => {
  const userPref = await NotificationPreferenceModel.findOne({ userId });

  // If no preference is found, we might want to default to true for basic channels
  // but let's check if the model defaults are being used.
  // In the current model, defaults are 'false'. 
  // If we want to be strict, we return false if no pref exists or if disabled.
  if (!userPref) {
    // If no preference record exists:
    // 1. If a specific event is requested, we default to FALSE (matching schema defaults)
    // 2. Otherwise, we default to TRUE for the channel itself to allow basic notifications
    if (event) return false;
    return true;
  }

  // Check channel preference
  if (channel === 'email' && !userPref.email) return false;
  if (channel === 'push' && !userPref.push) return false;
  if (channel === 'socket' && !userPref.socket) return false;

  // Check event preference if provided
  if (event && !userPref[event as keyof INotificationPreference]) {
    return false;
  }

  return true;
};

export const notificationPreferenceHelper = {
  canSendNotification,
};
