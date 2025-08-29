import { z } from "zod";
import { config } from "dotenv";

config({ quiet: true });

export default z
  .object({
    PORT: z.coerce.number().default(3000),

    NODE_ENV: z.enum(["production", "development"]).default("development"),

    LOG_LEVEL: z
      .enum(["error", "warn", "info", "http", "verbose", "debug", "silly"])
      .default("info"),

    DATABASE_URL: z
      .string()
      .min(1, "DATABASE_URL is required")
      .refine((val) => /^postgres(ql)?:\/\//i.test(val), {
        message: "DATABASE_URL must be a PostgreSQL connection string",
      }),
  })
  .parse(process.env);
