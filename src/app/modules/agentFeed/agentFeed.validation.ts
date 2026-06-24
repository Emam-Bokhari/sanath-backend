import { z } from "zod";
import { FEED_TYPE } from "./agentFeed.constant";
import { NextFunction } from "express";
import { AgentFeed } from "./agentFeed.model";
import { Types } from "mongoose";
import validateRequest from "../../middlewares/validateRequest";

const createAgentFeedValidationSchema = z.object({
  body: z.object({
    feedType: z.nativeEnum(FEED_TYPE),
    xmlFeedUrl: z.string().url({ message: "Invalid URL" }).optional().nullable(),
    blmFeedUrl: z.string().url({ message: "Invalid URL" }).optional().nullable(),
    name: z.string().optional(),
  }).superRefine((data, ctx) => {
    if ((data.feedType === FEED_TYPE.XML || data.feedType === FEED_TYPE.BOTH) && !data.xmlFeedUrl) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "XML feed URL is required",
        path: ["xmlFeedUrl"],
      });
    }
    if ((data.feedType === FEED_TYPE.BLM || data.feedType === FEED_TYPE.BOTH) && !data.blmFeedUrl) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "BLM feed URL is required",
        path: ["blmFeedUrl"],
      });
    }
  }),
});

const updateAgentFeedValidationSchema = z.object({
  body: z.object({
    feedType: z.nativeEnum(FEED_TYPE).optional(),
    xmlFeedUrl: z.string().url({ message: "Invalid URL" }).optional().nullable(),
    blmFeedUrl: z.string().url({ message: "Invalid URL" }).optional().nullable(),
    name: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});



export const AgentFeedValidation = {
  createAgentFeedValidationSchema,
  updateAgentFeedValidationSchema,
};
