import { z } from "zod";
import { Currency, PaymentMethod, PaymentStatus } from "@prisma/client";
export const CheckoutInput = z.object({
  body: z.object({
    currency: z.enum(Currency).default(Currency.EGP),
    addressId: z.string().uuid().optional(),
    promoCode: z.string().max(64).optional(),
  }),
});
export type CheckoutInputT = z.infer<typeof CheckoutInput>;

export const PaymentConfirmInput = z.object({
  body: z.object({
    orderId: z.string().uuid(),
    provider: z.enum(PaymentMethod).default(PaymentMethod.CASH_ON_DELIVERY),
    intentId: z.string().optional(),
    status: z.enum(PaymentStatus),
  }),
});
export type PaymentConfirmInputT = z.infer<typeof PaymentConfirmInput>;

export const RefundConfirmInput = z.object({
  body: z.object({
    orderId: z.string().uuid(),
    provider: z.enum(PaymentMethod).default(PaymentMethod.CASH_ON_DELIVERY),
    reason: z.string(),
  }),
});
