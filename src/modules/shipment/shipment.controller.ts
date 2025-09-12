import { Request, Response } from "express";
import orderService from "./shipment.service";
import { sendResponse } from "../../utils/response";
import { HttpStatus } from "../../enums/httpStatus.enum";
import APIError from "../../utils/APIError";

export async function updateShipmentStatus(req: Request, res: Response) {
  const userId = (req as any).account.user?.id as string;
  const { shipmentId, next, addressId, opts } = req.body;
  const shipment = await orderService.updateShipmentStatus(
    shipmentId,
    next,
    addressId,
    opts
  );
  sendResponse(res, {
    statusCode: HttpStatus.OK,
    data: shipment,
  });
}
