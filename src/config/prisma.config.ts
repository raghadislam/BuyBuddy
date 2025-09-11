import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient().$extends({
  result: {
    // ---- Review ----

    // ---- Variant ----
    variant: {
      price: {
        needs: { price: true },
        compute(v) {
          return v.price.toNumber();
        },
      },
    },

    // ---- CartItem ----
    cartItem: {
      priceSnapshot: {
        needs: { priceSnapshot: true },
        compute(ci) {
          return ci.priceSnapshot.toNumber();
        },
      },
    },

    // ---- Order ----
    order: {
      itemsTotal: {
        needs: { itemsTotal: true },
        compute(o) {
          return o.itemsTotal.toNumber();
        },
      },
      shippingTotal: {
        needs: { shippingTotal: true },
        compute(o) {
          return o.shippingTotal.toNumber();
        },
      },
      discountTotal: {
        needs: { discountTotal: true },
        compute(o) {
          return o.discountTotal.toNumber();
        },
      },
    },

    // ---- SubOrder ----
    subOrder: {
      subtotal: {
        needs: { subtotal: true },
        compute(so) {
          return so.subtotal.toNumber();
        },
      },
      discount: {
        needs: { discount: true },
        compute(so) {
          return so.discount.toNumber();
        },
      },
      shippingFee: {
        needs: { shippingFee: true },
        compute(so) {
          return so.shippingFee.toNumber();
        },
      },
    },

    // ---- OrderItem ----
    orderItem: {
      priceSnapshot: {
        needs: { priceSnapshot: true },
        compute(oi) {
          return oi.priceSnapshot.toNumber();
        },
      },
    },

    // ---- Payment ----
    payment: {
      amount: {
        needs: { amount: true },
        compute(p) {
          return p.amount.toNumber();
        },
      },
    },
  },
});

export default prisma;
