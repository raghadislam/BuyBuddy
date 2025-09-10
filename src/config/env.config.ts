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

    BASE_URL: z.string().url("BASE_URL must be a valid URL"),

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
    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_CLIENT_SECRET: z.string(),
    GOOGLE_CALLBACK_URL: z.string(),

    EMAIL_VERIFICATION_TTL_MINUTES: z.coerce.number().default(10),
    PASSWORD_RESET_TTL_MINUTES: z.coerce.number().default(10),
    ACTIVE_ACCOUNT_TTL_MINUTES: z.coerce.number().default(10),

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

    RESET_TOKEN_SECRET: z.string().min(1, "RESET_TOKEN_SECRET is required"),

    RESET_TOKEN_EXPIRES_IN: z
      .string()
      .min(1, "RESET_TOKEN_EXPIRES_IN is required"),

    RESET_TOKEN_TTL_MINS: z.coerce.number(),

    JWT_COOKIE_EXPIRES_IN: z.coerce.number(),

    CLOUDINARY_CLOUD_NAME: z
      .string()
      .min(1, "CLOUDINARY_CLOUD_NAME is required"),
    CLOUDINARY_API_KEY: z.string().min(1, "CLOUDINARY_API_KEY is required"),
    CLOUDINARY_API_SECRET: z
      .string()
      .min(1, "CLOUDINARY_API_SECRET is required"),

    APP_NAME: z.string().min(1, `PP_NAME is required`),

    // Firebase
    FB_PROJECT_ID: z.string().min(1, "FB_PROJECT_ID is required"),
    FB_PRIVATE_KEY: z
      .string()
      .min(1, "FB_PRIVATE_KEY is required")
      .transform((val) => val.replace(/\\n/g, "\n")),
    FB_CLIENT_EMAIL: z.string().min(1, "FB_CLIENT_EMAIL is required"),
  })
  .parse(process.env);
