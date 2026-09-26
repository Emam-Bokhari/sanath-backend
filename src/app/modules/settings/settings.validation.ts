import { z } from "zod";

const settingsValidationSchema = z.object({
  body: z.object({
    priceReducedDurationDays: z.number().min(1).optional(),
    newListingDurationDays: z.number().min(1).optional(),
  }),
});

export const SettingsValidationSchema = {
  settingsValidationSchema,
};
