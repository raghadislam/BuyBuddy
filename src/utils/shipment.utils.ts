import { ShipmentStatus, OrderStatus } from "@prisma/client";

export function deriveOrderStatus(
  subShipmentStatuses: ShipmentStatus[]
): OrderStatus {
  const set = new Set(subShipmentStatuses);
  if (set.size === 1 && set.has(ShipmentStatus.DELIVERED))
    return OrderStatus.FULFILLED;

  if (set.has(ShipmentStatus.DELIVERED)) return OrderStatus.PARTIALLY_FULFILLED;
  if ([...set].every((s) => s === ShipmentStatus.CANCELED))
    return OrderStatus.CANCELED;
  if ([...set].every((s) => s === ShipmentStatus.RETURNED))
    return OrderStatus.REFUNDED;

  return OrderStatus.FULFILLING;
}

export function collapseSubOrderStatus(
  shipments: { status: ShipmentStatus }[]
): ShipmentStatus {
  if (!shipments.length) return ShipmentStatus.PENDING;

  if (shipments.some((s) => s.status === ShipmentStatus.DELIVERED))
    return ShipmentStatus.DELIVERED;
  if (shipments.some((s) => s.status === ShipmentStatus.IN_TRANSIT))
    return ShipmentStatus.IN_TRANSIT;
  if (shipments.some((s) => s.status === ShipmentStatus.PACKING))
    return ShipmentStatus.PACKING;

  if (shipments.every((s) => s.status === ShipmentStatus.CANCELED))
    return ShipmentStatus.CANCELED;
  if (shipments.every((s) => s.status === ShipmentStatus.RETURNED))
    return ShipmentStatus.RETURNED;

  return ShipmentStatus.PENDING;
}

/** Allowed forward transitions */
export const AllowedNext: Record<ShipmentStatus, ShipmentStatus[]> = {
  PENDING: [ShipmentStatus.PACKING, ShipmentStatus.CANCELED],
  PACKING: [ShipmentStatus.IN_TRANSIT, ShipmentStatus.CANCELED],
  IN_TRANSIT: [
    ShipmentStatus.DELIVERED,
    ShipmentStatus.RETURNED,
    ShipmentStatus.CANCELED,
  ],
  DELIVERED: [],
  CANCELED: [],
  RETURNED: [],
};
