import { z } from "zod";

export const getOrCreatePrivateConversationZodSchema = z.object({
  params: z
    .object({
      recipientId: z
        .string()
        .uuid({ message: "recipientId must be a valid UUID" }),
    })
    .strict(),
});
