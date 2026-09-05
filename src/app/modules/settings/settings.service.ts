import ApiError from "../../../errors/ApiErrors";
import { TSettings } from "./settings.interface";
import { Settings } from "./settings.model";

const createOrUpdateSettingsToDB = async (payload: TSettings) => {
  const {
    paymentNumbers,
    currency,
    priceReducedDurationDays,
    newListingDurationDays,
  } = payload;

  // basic validation
  if (!paymentNumbers || paymentNumbers.length === 0) {
    throw new ApiError(400, "At least one payment number is required");
  }

  if (!currency) {
    throw new ApiError(400, "Currency is required");
  }

  const existingSettings = await Settings.findOne();

  const updateFields: any = {
    paymentNumbers,
    currency,
  };

  if (priceReducedDurationDays !== undefined) {
    updateFields.priceReducedDurationDays = priceReducedDurationDays;
  }

  if (newListingDurationDays !== undefined) {
    updateFields.newListingDurationDays = newListingDurationDays;
  }

  let result;

  if (existingSettings) {
    // SAFE MONGOOSE UPDATE (fix for DocumentArray issue)
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
  const settings = await Settings.findOne();

  if (!settings) {
    throw new ApiError(404, "Settings not found");
  }

  return settings;
};

export const SettingsServices = {
  createOrUpdateSettingsToDB,
  getSettingsFromDB,
};
