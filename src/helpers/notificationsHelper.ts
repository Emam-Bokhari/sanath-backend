import { INotification } from "../app/modules/notification/notification.interface";
import { Notification } from "../app/modules/notification/notification.model";
import { notificationHelper } from "../app/builder/pushNotification";
import { NOTIFICATION_TYPE } from "../app/modules/notification/notification.constant";
import { notificationPreferenceHelper } from "./notificationPreferenceHelper";
import { User } from "../app/modules/user/user.model";
import { emailQueue } from "../queues";

export const sendNotifications = async (
  data: Partial<INotification> & {
    event?: any;
    html?: string;
    subject?: string;
  },
): Promise<INotification | any> => {
  const receiverId = data.receiver?.toString();
  if (!receiverId) return;

  // 1. Handle Email Notifications
  const canEmail = await notificationPreferenceHelper.canSendNotification(
    receiverId,
    "email",
    data.event,
  );

  if (canEmail) {
    const user = await User.findById(receiverId).select("email name");
    if (user && user.email) {
      await emailQueue.add("notification-email", {
        to: user.email,
        subject: data.subject || data.title || "Notification",
        userId: receiverId,
        event: data.event,
        html:
          data.html ||
          `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #22143b; border-bottom: 2px solid #22143b; padding-bottom: 10px;">${data.title}</h2>
            <p>Hello <strong>${user.name}</strong>,</p>
            <p>${data.text}</p>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 0.9em; color: #777;">
              <p>Thank you for using our platform!</p>
              <p>Best regards,<br>The Team</p>
            </div>
          </div>
        `,
      });
    }
  }

  // 2. Handle Push Notifications for User and Agent
  if (
    data.type === NOTIFICATION_TYPE.USER ||
    data.type === NOTIFICATION_TYPE.AGENT
  ) {
    // Check Push Preference
    const canPush = await notificationPreferenceHelper.canSendNotification(
      receiverId,
      "push",
      data.event,
    );

    if (canPush) {
      const payload = {
        title: data.title || "Notification",
        body: data.text || "",
        type: data.type!,
        data: {
          type: data.type!,
          referenceId: data.referenceId?.toString() || "",
          referenceModel: data.referenceModel || "",
        },
      };

      // notificationHelper.sendToUser handles both FCM and saving to DB
      return await notificationHelper.sendToUser(receiverId, payload);
    }
    // If push is disabled, we don't save to DB (as per user request)
    return null;
  } else {
    // 3. Handle Socket Notifications for Admin/Super Admin
    const canSocket = await notificationPreferenceHelper.canSendNotification(
      receiverId,
      "socket",
      data.event,
    );

    if (canSocket) {
      // Create notification record in DB only if socket preference is true
      // Destructure to avoid passing extra fields like 'html', 'subject', 'event' to Mongoose
      const { title, text, receiver, sender, referenceId, referenceModel, type } = data;
      const result = await (
        await Notification.create({ title, text, receiver, sender, referenceId, referenceModel, type })
      ).populate("receiver sender referenceId");

      //@ts-ignore
      const socketIo = global.io;

      if (socketIo) {
        socketIo.emit(`send-notification::${data?.receiver}`, result);
      }
      return result;
    }

    return null;
  }
};
