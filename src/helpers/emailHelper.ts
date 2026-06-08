import nodemailer from "nodemailer";
import config from "../config";
import { errorLogger, logger } from "../shared/logger";
import { ISendEmail } from "../types/email";
import { notificationPreferenceHelper } from "./notificationPreferenceHelper";

const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: Number(config.email.port),
  secure: false,
  auth: {
    user: config.email.user,
    pass: config.email.pass,
  },
});

const sendEmail = async (values: ISendEmail) => {
  try {
    // Check Preference if userId is provided
    if (values.userId) {
      const canEmail = await notificationPreferenceHelper.canSendNotification(
        values.userId,
        "email",
        values.event,
      );

      if (!canEmail) {
        logger.info(
          `Email skipped for user ${values.userId} due to preference`,
        );
        return;
      }
    }

    const info = await transporter.sendMail({
      from: `"My Home" ${config.email.from}`,
      to: values.to,
      subject: values.subject,
      html: values.html,
    });

    logger.info("Mail send successfully", info.accepted);
  } catch (error) {
    errorLogger.error("Email", error);
    throw error;
  }
};

export const emailHelper = {
  sendEmail,
};
