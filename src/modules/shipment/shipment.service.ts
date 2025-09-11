import prisma from "../../config/prisma.config";
import { HttpStatus } from "../../enums/httpStatus.enum";
import APIError from "../../utils/APIError";
import { shippingSelect, UpdateOpts } from "./shipment.select";
import { ShipmentStatus } from "@prisma/client";
import {
  collapseSubOrderStatus,
  deriveOrderStatus,
  AllowedNext,
} from "../../utils/shipment.utils";

class OrderService {
  async updateShipmentStatus(
    shipmentId: string,
    next: ShipmentStatus,
    addressId: string,
    opts: UpdateOpts = {}
  ) {
    return prisma.$transaction(async (tx) => {
      // 1) Load current shipment + order context
      const current = await tx.shipment.findUnique({
        where: { id: shipmentId },
        select: shippingSelect,
      });
      if (!current)
        throw new APIError("Shipment not found", HttpStatus.NotFound);

      // 2) Validate transition
      if (!opts.allowBackward && !AllowedNext[current.status].includes(next)) {
        throw new APIError(
          `Invalid transition ${current.status} -> ${next}`,
          HttpStatus.BadRequest
        );
      }

      // 3) Update shipment + append ShipmentEvent
      const updatedShipment = await tx.shipment.update({
        where: { id: shipmentId },
        data: { status: next },
      });

      await tx.shipmentEvent.create({
        data: {
          shipmentId,
          occurredAt: new Date(),
          status: next,
          addressId,
          note: opts.note,
        },
      });

      // 4) Recompute order status from all sub-orders’ shipments
      const order = current.subOrder.order;

      // replace the status for this one shipment in-memory to avoid a re-read
      const subStatuses: ShipmentStatus[] = order.subOrders.map((so) => {
        if (so.id === current.subOrder.id) {
          // this sub-order includes our updated shipment; emulate new status:
          const statuses = so.shipments.map((s) => s.status);
          statuses.push(next); // ensure next is represented
          return collapseSubOrderStatus(statuses.map((status) => ({ status })));
        }
        return collapseSubOrderStatus(so.shipments);
      });

      const newOrderStatus = deriveOrderStatus(subStatuses);

      if (newOrderStatus !== order.status) {
        await tx.order.update({
          where: { id: order.id },
          data: { status: newOrderStatus },
        });
      }

      return {
        shipment: updatedShipment,
        orderId: order.id,
        orderStatus: newOrderStatus,
      };
    });
  }
}

export default new OrderService();
