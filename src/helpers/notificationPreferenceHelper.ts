import { INotificationPreference } from "../app/modules/notificationPreference/notificationPreference.interface";
import { NotificationPreferenceModel } from "../app/modules/notificationPreference/notificationPreference.model";
import { User } from "../app/modules/user/user.model";
import { USER_ROLES } from "../enums/user";
import { ADMIN_NOTIFICATION_DEFAULTS } from "../app/modules/notificationPreference/notificationPreference.service";


export const canSendNotification = async (
  userId: string,
  channel: 'email' | 'push' | 'socket',
  event?: keyof Omit<INotificationPreference, 'userId' | 'agentId' | 'email' | 'push' | 'socket' | 'createdAt' | 'updatedAt'>
): Promise<boolean> => {
  const userPref = await NotificationPreferenceModel.findOne({ userId });

  if (!userPref) {
    // Check if user is Admin or Super Admin to apply defaults
    const user = await User.findById(userId);
    if (user && (user.role === USER_ROLES.ADMIN || user.role === USER_ROLES.SUPER_ADMIN)) {
      // Use Admin Defaults
      const defaults = ADMIN_NOTIFICATION_DEFAULTS as any;
      
      // Check channel preference in defaults
      if (channel === 'email' && !defaults.email) return false;
      if (channel === 'push' && !defaults.push) return false;
      if (channel === 'socket' && !defaults.socket) return false;

      // Check event preference in defaults if provided
      if (event && !defaults[event]) {
        return false;
      }
      return true;
    }

    // If no preference record exists and not an admin:
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
