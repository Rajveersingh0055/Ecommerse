import express from "express";
import {
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  toggleProductPublish,
} from "../controllers/productController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router
  .route("/")
  .post(protect, upload.array("images", 5), createProduct)
  .get(getProducts);

router
  .route("/:id")
  .put(protect, upload.array("images", 5), updateProduct)
  .delete(protect, deleteProduct);

router.route("/:id/toggle").patch(protect, toggleProductPublish);

export default router;
