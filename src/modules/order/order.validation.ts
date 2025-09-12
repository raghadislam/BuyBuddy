import { z } from "zod";
import { Currency, PaymentMethod, PaymentStatus } from "@prisma/client";
export const CheckoutZodSchema = z.object({
  body: z.object({
    currency: z.enum(Currency).default(Currency.EGP),
    addressId: z.string().uuid().optional(),
    promoCode: z.string().max(64).optional(),
  }),
});

export const PaymentConfirmZodSchema = z.object({
  body: z.object({
    orderId: z.string().uuid(),
    provider: z.enum(PaymentMethod).default(PaymentMethod.CASH_ON_DELIVERY),
    intentId: z.string().optional(),
    status: z.enum(PaymentStatus),
  }),
});

export const RefundConfirmZodSchema = z.object({
  body: z.object({
    orderId: z.string().uuid(),
    provider: z.enum(PaymentMethod).default(PaymentMethod.CASH_ON_DELIVERY),
    reason: z.string(),
  }),
});
