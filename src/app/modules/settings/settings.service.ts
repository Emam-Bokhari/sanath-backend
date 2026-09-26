import { TSettings } from "./settings.interface";
import { Settings } from "./settings.model";

const createOrUpdateSettingsToDB = async (payload: TSettings) => {
  const { priceReducedDurationDays, newListingDurationDays } = payload;

  const existingSettings = await Settings.findOne();

  const updateFields: Partial<TSettings> = {};

  if (priceReducedDurationDays !== undefined) {
    updateFields.priceReducedDurationDays = priceReducedDurationDays;
  }

  if (newListingDurationDays !== undefined) {
    updateFields.newListingDurationDays = newListingDurationDays;
  }

  let result;

  if (existingSettings) {
    result = await Settings.findByIdAndUpdate(
      existingSettings._id,
      {
        $set: updateFields,
      },
      {
        new: true,
        runValidators: true,
      },
    );
  } else {
    result = await Settings.create(updateFields);
  }

  return result;
};

const getSettingsFromDB = async () => {
  let settings = await Settings.findOne();

  if (!settings) {
    settings = await Settings.create({});
  }

  return settings;
};

export const SettingsServices = {
  createOrUpdateSettingsToDB,
  getSettingsFromDB,
};
