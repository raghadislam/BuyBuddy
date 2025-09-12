import { Request, Response } from "express";
import orderService from "./order.service";
import { sendResponse } from "../../utils/response";
import { HttpStatus } from "../../enums/httpStatus.enum";
import APIError from "../../utils/APIError";

export async function checkout(req: Request, res: Response) {
  const userId = (req as any)?.account?.user?.id as string | undefined;
  if (!userId) throw new APIError("User not Found", HttpStatus.NotFound);
  const { currency, addressId, promoCode } = req.body;
  const order = await orderService.checkout(
    userId,
    currency,
    addressId,
    promoCode
  );
  sendResponse(res, {
    statusCode: HttpStatus.Created,
    data: order,
  });
}

export async function confirmPayment(req: Request, res: Response) {
  const { orderId, provider, intentId, status } = req.body;
  if (status !== "SUCCEEDED")
    return sendResponse(res, {
      statusCode: HttpStatus.PaymentRequiredclient,
      message: "Payment not successful",
    });
  const updated = await orderService.confirmPayment(
    orderId,
    provider,
    intentId
  );
  sendResponse(res, {
    statusCode: HttpStatus.OK,
    data: updated,
  });
}

export async function cancelOrder(req: Request, res: Response) {
  const userId = (req as any).user.id as string;
  const { orderId } = req.params;
  const canceled = await orderService.cancelOrder(
    userId,
    orderId,
    req.body?.reason
  );
  sendResponse(res, {
    statusCode: HttpStatus.OK,
    data: canceled,
  });
}

export async function getOrder(req: Request, res: Response) {
  const userId = (req as any).account.user?.id as string;
  const { orderId } = req.params;
  const order = await orderService.getOrder(userId, orderId);
  sendResponse(res, {
    statusCode: HttpStatus.OK,
    data: order,
  });
}

export async function getAllOrders(req: Request, res: Response) {
  const userId = (req as any).account.user?.id as string;
  const orders = await orderService.getAllOrders(userId);
  sendResponse(res, {
    statusCode: HttpStatus.OK,
    data: orders,
  });
}

export async function confirmRefund(req: Request, res: Response) {
  const userId = (req as any).account.user?.id as string;

  const { orderId, provider, reason } = req.body;
  const updated = await orderService.confirmRefund(
    userId,
    orderId,
    provider,
    reason
  );
  sendResponse(res, {
    statusCode: HttpStatus.OK,
    data: updated,
  });
}
