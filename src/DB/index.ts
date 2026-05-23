import colors from "colors";
import { User } from "../app/modules/user/user.model";
import config from "../config";
import { USER_ROLES } from "../enums/user";
import { logger } from "../shared/logger";
import { NotificationPreferenceModel } from "../app/modules/notificationPreference/notificationPreference.model";
import { ADMIN_NOTIFICATION_DEFAULTS } from "../app/modules/notificationPreference/notificationPreference.service";

const superUser = {
  name: "Super Admin", // put client first name
  role: USER_ROLES.SUPER_ADMIN,
  email: config.admin.email,
  password: config.admin.password,
  verified: true,
};

const seedSuperAdmin = async () => {
  const isExistSuperAdmin = await User.findOne({
    role: USER_ROLES.SUPER_ADMIN,
  });

  if (!isExistSuperAdmin) {
    const createSuperAdmin = await User.create(superUser);

    // create notification preference for super admin
    await NotificationPreferenceModel.create({
      userId: createSuperAdmin._id,
      ...ADMIN_NOTIFICATION_DEFAULTS,
    });

    logger.info(colors.green("✔ Super admin created successfully!"));
  }
};

export default seedSuperAdmin;
