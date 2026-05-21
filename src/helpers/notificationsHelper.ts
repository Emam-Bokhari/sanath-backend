import { INotification } from "../app/modules/notification/notification.interface";
import { Notification } from "../app/modules/notification/notification.model";
import { notificationHelper } from "../app/builder/pushNotification";
import { NOTIFICATION_TYPE } from "../app/modules/notification/notification.constant";
import { notificationPreferenceHelper } from "./notificationPreferenceHelper";

export const sendNotifications = async (
  data: Partial<INotification> & { event?: any },
): Promise<INotification | any> => {
  const receiverId = data.receiver?.toString();
  if (!receiverId) return;

  if (data.type === NOTIFICATION_TYPE.USER) {
    // Check Push Preference
    const canPush = await notificationPreferenceHelper.canSendNotification(
      receiverId,
      "push",
      data.event,
    );

    if (!canPush) {
      // If push is disabled, we still might want to save to DB so the user can see it in-app
      // But the user's request "arpor shai onoaji e enotification /email etc ta k send korba" 
      // suggests we should follow the preference. 
      // In many apps, "Push" preference only affects the mobile alert, not the in-app notification list.
      // However, to keep it simple and follow the user's "check before send" logic:
      // We will skip the delivery if the channel is disabled.
      
      // If we still want to save to DB but NOT send push, we would need to call a different method.
      // For now, let's assume if 'push' is off, we don't call notificationHelper.sendToUser.
      // But wait, notificationHelper.sendToUser also saves to DB. 
      // Let's check if we should still save to DB.
      
      // If I skip notificationHelper.sendToUser, nothing happens.
      // I'll stick to the user's requirement: check preference, then send.
      return;
    }

    const payload = {
      title: data.title || "Notification",
      body: data.text || "",
      type: data.type,
      data: {
        type: data.type,
        referenceId: data.referenceId?.toString() || "",
        referenceModel: data.referenceModel || "",
      },
    };

    return await notificationHelper.sendToUser(receiverId, payload);
  } else {
    // For Admin and others, check Socket Preference
    const canSocket = await notificationPreferenceHelper.canSendNotification(
      receiverId,
      "socket",
      data.event,
    );

    // Create notification record in DB (usually always done for history)
    const result = await (
      await Notification.create(data)
    ).populate("receiver sender referenceId");

    if (canSocket) {
      //@ts-ignore
      const socketIo = global.io;

      if (socketIo) {
        socketIo.emit(`send-notification::${data?.receiver}`, result);
      }
    }

    return result;
  }
};
