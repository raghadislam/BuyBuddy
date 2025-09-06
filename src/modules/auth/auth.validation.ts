import { z } from "zod";

import { Role } from "../../generated/prisma";

export const signupZodSchema = z.object({
  body: z
    .object({
      name: z
        .string()
        .min(4, "Name should be 3 characters at minimum")
        .max(20, "Name cannot be more than 20 charcters"),

      email: z.string().email({ message: "Invalid email address" }),

      password: z.string().min(6, "password should be more than 6 characters"),

      role: z.enum([Role.BRAND, Role.USER]),

      userName: z
        .string()
        .min(3, "Username should be at least 3 characters")
        .max(15, "Username cannot be more than 15 characters")
        .optional(),
    })
    .strict(),
});

export const verifyEmailZodSchema = z.object({
  body: z
    .object({
      email: z.string().email({ message: "Invalid email address" }),

      code: z
        .string()
        .length(6, "Verification code must be exactly 6 characters"),
    })
    .strict(),
});

export const loginZodSchema = z.object({
  body: z
    .object({
      email: z
        .string()
        .min(1, "Email is required")
        .email("Invalid email format"),
      password: z.string().min(6, "Password must be at least 6 characters"),
    })
    .strict(),
});

export const forgetPasswordZodSchema = z.object({
  body: z
    .object({
      email: z
        .string()
        .min(1, "Email is required")
        .email("Invalid email format"),
    })
    .strict(),
});

export const verifyResetCodeZodSchema = z.object({
  body: z
    .object({
      email: z.string().min(1, "Email is required").email("Email is not valid"),

      code: z
        .string()
        .min(1, "Code is required")
        .regex(/^\d{6}$/, "Code must be a 6-digit number"),
    })
    .strict(),
});

export const resetPasswordZodSchema = z.object({
  body: z
    .object({
      resetToken: z.string().min(1, "Reset token is required"),

      newPassword: z
        .string()
        .min(6, "New password should be more than 6 characters"),

      confirmNewPassword: z
        .string()
        .min(6, "Confirm new password should be more than 6 characters"),
    })
    .refine((data) => data.newPassword === data.confirmNewPassword, {
      message: "Passwords don't match",
      path: ["Password confirmations"],
    })
    .strict(),
});
