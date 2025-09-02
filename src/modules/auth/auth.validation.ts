import { z } from "zod";

import { Role } from "../../enums/role.enum";

export const signupZodSchema = z.object({
  body: z
    .object({
      name: z
        .string()
        .min(4, "Name should be 3 characters at minimum")
        .max(20, "Name cannot be more than 20 charcters"),

      email: z.string().email({ message: "Invalid email address" }),

      password: z.string().min(6, "password should be more than 6 characters"),

      confirmPassword: z
        .string()
        .min(6, "password should be more than 6 characters"),

      role: z.enum([Role.SELLER, Role.USER]),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords don't match",
      path: ["Password confirmations"],
    }),
});

export const verifyEmailZodSchema = z.object({
  body: z.object({
    email: z.string().email({ message: "Invalid email address" }),

    code: z
      .string()
      .length(6, "Verification code must be exactly 6 characters"),
  }),
});

export const loginZodSchema = z.object({
  body: z.object({
    email: z.string().min(1, "Email is required").email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  }),
});

export const forgetPasswordZodSchema = z.object({
  body: z.object({
    email: z.string().min(1, "Email is required").email("Invalid email format"),
  }),
});

export const resetPasswordZodSchema = z.object({
  body: z
    .object({
      email: z.string().email({ message: "Invalid email address" }),

      code: z
        .string()
        .length(6, "Verification code must be exactly 6 characters"),

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
    }),
});
