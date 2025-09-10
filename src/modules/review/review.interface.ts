import type {
  Prisma,
  Review,
  ReviewImage,
  ReviewReply,
  ReportReason,
  VoteType,
  ReviewVisibility,
} from "@prisma/client";

import { Page } from "../../utils/pagination";

export type ListReviewsQuery = Page &
  Readonly<{
    rating?: number;
    sort?: "new" | "top" | "old";
  }>;

export interface ReviewServices {
  createReview(
    productId: string,
    userId: string,
    payload: {
      rating: number;
      title: string;
      content: string;
      images?: { url: string; altText?: string; sortOrder?: number }[];
      isVerified?: boolean; // pass from controller if you check order history
    }
  ): Promise<Review & { images: ReviewImage[] }>;

  updateReview(
    reviewId: string,
    payload: any
  ): Promise<Review & { images: ReviewImage[] }>;

  deleteReview(reviewId: string): Promise<void>;

  getProductReviews(
    productId: string,
    params: ListReviewsQuery
  ): Promise<{
    items: (Review & { images: ReviewImage[]; replies: ReviewReply[] })[];
    page: number;
    limit: number;
    total: number;
  }>;

  voteReview(reviewId: string, userId: string, type: VoteType): Promise<Review>;

  reportReview(
    reviewId: string,
    userId: string,
    reason: ReportReason,
    details?: string
  ): Promise<void>;

  replyToReview(
    reviewId: string,
    authorId: string,
    content: string
  ): Promise<ReviewReply>;

  setReviewVisibility(
    reviewId: string,
    visibility: ReviewVisibility
  ): Promise<Review>;
}
