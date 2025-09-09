import { z } from "zod";

export const registerTokenZodSchema = z.object({
  body: z
    .object({
      token: z
        .string()
        .min(1, { message: "token is required and cannot be empty" }),
    })
    .strict(),
});

export const unregisterTokenZodSchema = z.object({
  body: z
    .object({
      token: z
        .string()
        .min(1, { message: "token is required and cannot be empty" }),
    })
    .strict(),
});

export const subscribeToTopicZodSchema = z.object({
  body: z
    .object({
      tokens: z
        .array(
          z
            .string()
            .min(1, { message: "each token must be a non-empty string" })
        )
        .min(1, { message: "tokens array must contain at least one token" }),

      topic: z
        .string()
        .min(1, { message: "topic is required and cannot be empty" }),
    })
    .strict(),
});

export const unsubscribeFromTopicZodSchema = subscribeToTopicZodSchema;
