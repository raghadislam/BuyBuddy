import { ZodTypeAny, infer as zInfer } from "zod";

export const validate = <T extends ZodTypeAny>(
  schema: T,
  data: unknown
): zInfer<T> => {
  return schema.parse(data);
};
