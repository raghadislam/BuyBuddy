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
  listTagsForProductCtrl,
  attachTagToProductCtrl,
} from "../tag/tag.controller";

const router = Router();

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

router.get(
  "/:productId/tags",
  authenticate,
  assertProductOwnership,
  listTagsForProductCtrl
);

router.post(
  "/:productId/tags",
  authenticate,
  assertProductOwnership,
  attachTagToProductCtrl
);

export default router;
