import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.middleware";
import { validate } from "../../middlewares/validation.middleware";

import {
  assertBrandOwnership,
  assertProductOwnership,
} from "../../middlewares/assertOwnership.middleware";

import {
  createProductSchema,
  updateProductSchema,
  listProductsQuerySchema,
  productIdParamSchema,
  productSlugParamSchema,
  tagsBrowseQuerySchema,
  attachTagBodySchema,
  attachTagsBulkBodySchema,
} from "./product.validation";

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

const router = Router();

router.get("/tags", validate(tagsBrowseQuerySchema), getAllTags);
router.get("/tags/:tagSlug/products", getProductsByTagSlug);

router.get("/", validate(listProductsQuerySchema), getAllProducts);
router.get("/slug/:slug", validate(productSlugParamSchema), getProductBySlug);
router.get("/:productId", validate(productIdParamSchema), getProductById);

router.post(
  "/",
  authenticate,
  validate(createProductSchema),
  assertBrandOwnership,
  createProduct
);
router.patch(
  "/:productId",
  authenticate,
  assertProductOwnership,
  validate(productIdParamSchema),
  validate(updateProductSchema),
  updateProduct
);
router.delete(
  "/:productId",
  authenticate,
  assertProductOwnership,
  validate(productIdParamSchema),
  deleteProduct
);

router.post(
  "/:productId/publish",
  authenticate,
  assertProductOwnership,
  validate(productIdParamSchema),
  publishProduct
);
router.post(
  "/:productId/unpublish",
  authenticate,
  assertProductOwnership,
  validate(productIdParamSchema),
  unpublishProduct
);
router.post(
  "/:productId/archive",
  authenticate,
  assertProductOwnership,
  validate(productIdParamSchema),
  archiveProduct
);

router.get("/:productId/tags", getTagsForProduct);
router.post(
  "/:productId/tags",
  authenticate,
  assertProductOwnership,
  validate(attachTagBodySchema),
  attachTagToProduct
);
router.post(
  "/:productId/tags/bulk",
  authenticate,
  assertProductOwnership,
  validate(attachTagsBulkBodySchema),
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
