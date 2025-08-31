import { z } from "zod";
import { config } from "dotenv";

config({ path: "./.env", quiet: true });

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

    EMAIL_FROM: z.string().min(3),
    TEMPLATES_PATH: z.string().default("src/services/email/templates"),

    SMTP_URL: z.string().optional(),
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.coerce.number().optional(),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),

    // Gmail simple (App Password)
    GMAIL_USER: z.string().optional(),
    GMAIL_PASSWORD: z.string().optional(),

    // Gmail OAuth2
    GMAIL_CLIENT_ID: z.string().optional(),
    GMAIL_CLIENT_SECRET: z.string().optional(),
    GMAIL_REFRESH_TOKEN: z.string().optional(),
    GMAIL_ACCESS_TOKEN: z.string().optional(),

    EMAIL_VERIFICATION_TTL_MINUTES: z.coerce.number().default(10),
    PASSWORD_RESET_TTL_MINUTES: z.coerce.number().default(10),

    // Auth / JWT settings
    ACCESS_TOKEN_SECRET: z.string().min(1, "ACCESS_TOKEN_SECRET is required"),

    ACCESS_TOKEN_EXPIRES_IN: z
      .string()
      .min(1, "ACCESS_TOKEN_EXPIRES_IN is required"),

    REFRESH_TOKEN_SECRET: z.string().min(1, "REFRESH_TOKEN_SECRET is required"),

    REFRESH_TOKEN_EXPIRES_IN: z
      .string()
      .min(1, "REFRESH_TOKEN_EXPIRES_IN is required"),

    REFRESH_TOKEN_TTL_DAYS: z.coerce.number(),

    JWT_COOKIE_EXPIRES_IN: z.coerce.number(),

    APP_NAME: z.string().min(1, `PP_NAME is required`),
  })
  .parse(process.env);
