// src/modules/reviews/review.routes.ts
import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.middleware";
import { validate } from "../../middlewares/validation.middleware";
import {
  createReviewSchema,
  reportSchema,
  updateReviewSchema,
  voteSchema,
  replySchema,
} from "./review.validation";

import { assertReviewOwnership } from "../../middlewares/assertOwnership.middleware";

import {
  createReview,
  getAllProductReviews,
  deleteReview,
  replyToReview,
  reportReview,
  setReviewVisibility,
  updateReview,
  voteReview,
} from "./review.controller";

const router = Router({ mergeParams: true });

router
  .route("/")
  .get(getAllProductReviews)
  .post(authenticate, validate(createReviewSchema), createReview);

router.patch(
  "/:reviewId",
  authenticate,
  validate(updateReviewSchema),
  assertReviewOwnership,
  updateReview
);
router.delete("/:reviewId", authenticate, assertReviewOwnership, deleteReview);

router.post("/:reviewId/votes", authenticate, validate(voteSchema), voteReview);
router.post(
  "/:reviewId/reports",
  authenticate,
  validate(reportSchema),
  reportReview
);

router.post(
  "/:reviewId/replies",
  authenticate,
  validate(replySchema),
  replyToReview
);
router.patch("/:reviewId/visibility", authenticate, setReviewVisibility);

export default router;
