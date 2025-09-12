import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.middleware";
import { validate } from "../../middlewares/validation.middleware";

import {
  assertBrandOwnership,
  assertProductOwnership,
} from "../../middlewares/assertOwnership.middleware";

import {
  createProductZodSchema,
  updateProductZodSchema,
  listProductsQueryZodSchema,
  productIdParamZodSchema,
  productSlugParamZodSchema,
} from "./product.validation";

import {
  tagsBrowseQueryZodSchema,
  attachTagBodyZodSchema,
  attachTagsBulkBodyZodSchema,
} from "../tag/tag.validation";

import {
  getAllProducts,
  getProductById,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  publishProduct,
  unpublishProduct,
  archiveProduct,
} from "./product.controller";

import {
  getTagsForProduct,
  attachTagToProduct,
  attachTagsToProductBulk,
  detachTagFromProduct,
  changeTagPinStatus,
  getAllTags,
  getProductsByTagSlug,
} from "../tag/tag.controller";

import reviewRouter from "../review/review.routes";

const router = Router();

router.use("/:productId/reviews", reviewRouter);

router.get("/tags", validate(tagsBrowseQueryZodSchema), getAllTags);
router.get("/tags/:tagSlug/products", getProductsByTagSlug);

router.get("/", validate(listProductsQueryZodSchema), getAllProducts);
router.get(
  "/slug/:slug",
  validate(productSlugParamZodSchema),
  getProductBySlug
);
router.get("/:productId", validate(productIdParamZodSchema), getProductById);

router.post(
  "/",
  authenticate,
  validate(createProductZodSchema),
  assertBrandOwnership,
  createProduct
);
router.patch(
  "/:productId",
  authenticate,
  assertProductOwnership,
  validate(productIdParamZodSchema),
  validate(updateProductZodSchema),
  updateProduct
);
router.delete(
  "/:productId",
  authenticate,
  assertProductOwnership,
  validate(productIdParamZodSchema),
  deleteProduct
);

router.post(
  "/:productId/publish",
  authenticate,
  assertProductOwnership,
  validate(productIdParamZodSchema),
  publishProduct
);
router.post(
  "/:productId/unpublish",
  authenticate,
  assertProductOwnership,
  validate(productIdParamZodSchema),
  unpublishProduct
);
router.post(
  "/:productId/archive",
  authenticate,
  assertProductOwnership,
  validate(productIdParamZodSchema),
  archiveProduct
);

router.get("/:productId/tags", getTagsForProduct);
router.post(
  "/:productId/tags",
  authenticate,
  assertProductOwnership,
  validate(attachTagBodyZodSchema),
  attachTagToProduct
);
router.post(
  "/:productId/tags/bulk",
  authenticate,
  assertProductOwnership,
  validate(attachTagsBulkBodyZodSchema),
  attachTagsToProductBulk
);
router.delete(
  "/:productId/tags/:tagSlug",
  authenticate,
  assertProductOwnership,
  detachTagFromProduct
);
router.post(
  "/:productId/tags/:tagSlug/pinned",
  authenticate,
  assertProductOwnership,
  changeTagPinStatus
);

export default router;
