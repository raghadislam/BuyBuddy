import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.middleware";
import { validate } from "../../middlewares/validation.middleware";

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

const router = Router();

/** Public browse */
router.get("/", validate(listProductsQuerySchema), getAllProducts);
router.get("/slug/:slug", validate(productSlugParamSchema), getProductBySlug);
router.get("/:productId", validate(productIdParamSchema), getProductById);

/** Product tag browsing (public) */
// router.get("/tags", validate(tagsBrowseQuerySchema), listAllTagsCtrl);
// router.get("/tags/:tagSlug/products", listProductsByTagSlugCtrl);

/** Auth required for writes (brand ownership enforced in service) */
router.post("/", authenticate, validate(createProductSchema), createProduct);
router.patch(
  "/:productId",
  authenticate,
  validate(productIdParamSchema),
  validate(updateProductSchema),
  updateProduct
);
router.delete(
  "/:productId",
  authenticate,
  validate(productIdParamSchema),
  deleteProduct
);

router.post(
  "/:productId/publish",
  authenticate,
  validate(productIdParamSchema),
  publishProduct
);
router.post(
  "/:productId/unpublish",
  authenticate,
  validate(productIdParamSchema),
  unpublishProduct
);
router.post(
  "/:productId/archive",
  authenticate,
  validate(productIdParamSchema),
  archiveProduct
);

export default router;
