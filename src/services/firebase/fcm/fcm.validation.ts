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
