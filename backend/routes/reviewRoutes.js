import express from "express";
import {
  createReview,
  getProductReviews,
  getEligibleReviewProducts,
  deleteReview,
} from "../controllers/reviewController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createReview);
router.get("/product/:productId", getProductReviews);
router.get("/eligible-products", protect, getEligibleReviewProducts);
router.delete("/:id", protect, deleteReview);

export default router;
