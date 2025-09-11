import type { ShipmentStatus } from "@prisma/client";

export function moneySum(...nums: (number | string)[]): number {
  return nums.reduce<number>((acc, val) => acc + Number(val), 0);
}

// infer order-level fulfillment based on all sub-orders' shipments
export function deriveFulfillmentStatus(subShipmentStatuses: ShipmentStatus[]) {
  const s = new Set(subShipmentStatuses);
  if (s.size === 1 && s.has("DELIVERED")) return "FULFILLED" as const;
  if (s.has("DELIVERED")) return "PARTIALLY_FULFILLED" as const;

  return "FULFILLING" as const; // default while in progress
}
