import { Request, Response } from "express";
import { HttpStatus } from "../../enums/httpStatus.enum";
import APIError from "../../utils/APIError";
import { sendResponse } from "../../utils/response";
import reviewService from "./review.service";
import { ReviewVisibility } from "@prisma/client";

const uid = (req: Request) => (req as any).account?.id as string;

export const createReview = async (req: Request, res: Response) => {
  const productId = req.params.productId;

  // TODO: complete "isVerified" logic after implementing the orders logic
  console.log(uid(req));

  const review = await reviewService.createReview(productId, uid(req), {
    ...req.body,
    isVerified: false,
  });

  sendResponse(res, {
    statusCode: HttpStatus.OK,
    data: review,
  });
};

export const getAllProductReviews = async (req: Request, res: Response) => {
  const productId = req.params.productId;
  const { page, limit, rating, sort } = req.query as any;
  const result = await reviewService.getProductReviews(productId, {
    page: page ? +page : undefined,
    limit: limit ? +limit : undefined,
    rating: rating ? +rating : undefined,
    sort: (sort as any) || "new",
  });
  sendResponse(res, {
    statusCode: HttpStatus.OK,
    data: result,
  });
};

export const updateReview = async (req: Request, res: Response) => {
  const reviewId = req.params.reviewId;
  const review = await reviewService.updateReview(reviewId, req.body);
  sendResponse(res, {
    statusCode: HttpStatus.OK,
    data: review,
  });
};

export const deleteReview = async (req: Request, res: Response) => {
  const reviewId = req.params.reviewId;
  await reviewService.deleteReview(reviewId);
  sendResponse(res, {
    statusCode: HttpStatus.NoContent,
  });
};

export const voteReview = async (req: Request, res: Response) => {
  const reviewId = req.params.reviewId;
  const updated = await reviewService.voteReview(reviewId, uid(req), req.body);
  sendResponse(res, {
    statusCode: HttpStatus.OK,
    data: updated,
  });
};

export const reportReview = async (req: Request, res: Response) => {
  const reviewId = req.params.reviewId;
  await reviewService.reportReview(
    reviewId,
    uid(req),
    req.body.reason,
    req.body.details
  );
  sendResponse(res, {
    statusCode: HttpStatus.OK,
    message: "Review has been reported successfully!",
  });
};

export const replyToReview = async (req: Request, res: Response) => {
  const reviewId = req.params.reviewId;

  const content = (req.body?.content as string) ?? "";
  if (content.length < 1)
    sendResponse(res, {
      statusCode: HttpStatus.BadRequest,
      message: "content required",
    });

  const reply = await reviewService.replyToReview(reviewId, uid(req), content);
  sendResponse(res, {
    statusCode: HttpStatus.OK,
    data: reply,
  });
};

export const setReviewVisibility = async (req: Request, res: Response) => {
  const reviewId = req.params.reviewId;
  const { visibility } = req.body as {
    visibility: ReviewVisibility;
  };

  const review = await reviewService.setReviewVisibility(reviewId, visibility);
  sendResponse(res, {
    statusCode: HttpStatus.OK,
    data: review,
  });
};
