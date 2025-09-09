import prisma from "../../config/prisma.config";

import {
  Prisma,
  Review,
  ReviewImage,
  ReviewReply,
  ReportReason,
  VoteType,
  ReviewVisibility,
} from "@prisma/client";
import { ReviewServices, ListReviewsQuery } from "./review.interface";
import { HttpStatus } from "../../enums/httpStatus.enum";
import APIError from "../../utils/APIError";
import { normalizePage } from "../../utils/pagination";

async function calcProductRating(productId: string) {
  const agg = await prisma.review.aggregate({
    where: { productId, visibility: "PUBLISHED" },
    _avg: { rating: true },
    _count: { rating: true },
  });
}

class ReviewService implements ReviewServices {
  async createReview(
    productId: string,
    userId: string,
    payload: {
      rating: number;
      title: string;
      content: string;
      images?: { url: string; altText?: string; sortOrder?: number }[];
      isVerified?: boolean; // pass from controller if you check order history
    }
  ) {
    return prisma.$transaction(async (tx) => {
      const exists = await tx.review.findUnique({
        where: { productId_userId: { productId, userId } },
      });
      if (exists)
        throw new APIError(
          "You have already reviewed this product.",
          HttpStatus.BadRequest
        );

      const review = await tx.review.create({
        data: {
          productId,
          userId,
          rating: payload.rating,
          title: payload.title,
          content: payload.content,
          isVerified: !!payload.isVerified,
          images: payload.images?.length
            ? {
                create: payload.images.map((i, idx) => ({
                  url: i.url,
                  altText: i.altText,
                  sortOrder: i.sortOrder ?? idx,
                })),
              }
            : undefined,
        },
        include: { images: true },
      });

      const agg = await tx.review.aggregate({
        where: { productId, visibility: "PUBLISHED" },
        _avg: { rating: true },
        _count: { rating: true },
      });

      await tx.product.update({
        where: { id: productId },
        data: {
          avgRating: new Prisma.Decimal(agg._avg.rating ?? 0),
          ratingsCount: agg._count.rating,
        },
      });

      return review;
    });
  }

  async updateReview(reviewId: string, payload: any) {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });
    if (!review) throw new APIError("Review not found.", HttpStatus.NotFound);

    const updated = await prisma.$transaction(async (tx) => {
      if (payload.images) {
        tx.reviewImage.deleteMany({ where: { reviewId } }),
          tx.reviewImage.createMany({
            data: payload.images.map((i: any, idx: number) => ({
              reviewId,
              url: i.url,
              altText: i.altText ?? null,
              sortOrder: i.sortOrder ?? idx,
            })),
          });
      }

      const r = await tx.review.update({
        where: { id: reviewId },
        data: {
          rating: payload.rating ?? review.rating,
          title: payload.title ?? review.title,
          content: payload.content ?? review.content,
        },
        include: { images: true },
      });

      await calcProductRating(review.productId);
      return r;
    });

    return updated;
  }

  async deleteReview(reviewId: string): Promise<void> {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });
    if (!review) throw new APIError("Review not found.", HttpStatus.NotFound);
    await prisma.$transaction(async (tx) => {
      await tx.review.delete({ where: { id: reviewId } });
      await calcProductRating(review.productId);
    });
  }

  async getProductReviews(productId: string, params: ListReviewsQuery) {
    const { page, limit, skip, take } = normalizePage(params);
    const { rating, sort = "new" } = params;

    const where: Prisma.ReviewWhereInput = {
      productId,
      visibility: "PUBLISHED",
      ...(rating ? { rating } : {}),
    };

    const orderBy: any =
      sort === "top"
        ? [{ helpfulCount: "desc" }, { createdAt: "desc" }]
        : sort === "old"
        ? [{ createdAt: "asc" }]
        : [{ createdAt: "desc" }];

    const [items, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: { images: true, replies: true },
        orderBy,
        skip,
        take,
      }),
      prisma.review.count({ where }),
    ]);
    return { items, page, limit, total };
  }

  async voteReview(reviewId: string, userId: string, type: VoteType) {
    return prisma.$transaction(async (tx) => {
      await tx.reviewVote.upsert({
        where: { reviewId_userId: { reviewId, userId } },
        create: { reviewId, userId, type },
        update: { type },
      });
      const agg = await tx.reviewVote.groupBy({
        by: ["type"],
        where: { reviewId },
        _count: { _all: true },
      });
      const helpful = agg.find((a) => a.type === VoteType.UP)?._count._all ?? 0;
      return tx.review.update({
        where: { id: reviewId },
        data: { helpfulCount: helpful },
      });
    });
  }

  async reportReview(
    reviewId: string,
    userId: string,
    reason: ReportReason,
    details?: string
  ) {
    await prisma.$transaction(async (tx) => {
      await tx.reviewReport.create({
        data: { reviewId, userId, reason, details },
      });
      await tx.review.update({
        where: { id: reviewId },
        data: { reported: true },
      });
    });
  }

  async replyToReview(reviewId: string, authorId: string, content: string) {
    return prisma.reviewReply.create({
      data: { reviewId, authorId, content },
    });
  }

  async setReviewVisibility(reviewId: string, visibility: ReviewVisibility) {
    const review = await prisma.review.update({
      where: { id: reviewId },
      data: { visibility },
    });
    await calcProductRating(review.productId);
    return review;
  }
}

export default new ReviewService();
