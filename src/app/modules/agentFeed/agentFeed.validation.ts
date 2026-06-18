import { z } from "zod";

const createAgentFeedValidationSchema = z.object({
  body: z.object({
    feedUrl: z.string().url({ message: "Invalid URL" }),
    name: z.string().optional(),
  }),
});

const updateAgentFeedValidationSchema = z.object({
  body: z.object({
    feedUrl: z.string().url({ message: "Invalid URL" }).optional(),
    name: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const AgentFeedValidation = {
  createAgentFeedValidationSchema,
  updateAgentFeedValidationSchema,
};
