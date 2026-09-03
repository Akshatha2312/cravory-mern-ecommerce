import Review from "../models/Review.js";
import Product from "../models/Product.js";
import Vendor from "../models/Vendor.js";
import Order from "../models/Order.js";
import mongoose from "mongoose";

// Helper to recalculate Product & Vendor rating aggregates
const updateRatingsAggregate = async (productId, vendorId) => {
  if (productId) {
    const prodReviews = await Review.find({ product: productId });
    const numReviews = prodReviews.length;
    const rating =
      numReviews > 0
        ? prodReviews.reduce((sum, r) => sum + r.rating, 0) / numReviews
        : 0;

    await Product.findByIdAndUpdate(productId, {
      rating: Number(rating.toFixed(1)),
      numReviews,
    });
  }

  if (vendorId) {
    const vendorReviews = await Review.find({ vendor: vendorId });
    const numReviews = vendorReviews.length;
    const rating =
      numReviews > 0
        ? vendorReviews.reduce((sum, r) => sum + r.rating, 0) / numReviews
        : 0;

    await Vendor.findByIdAndUpdate(vendorId, {
      rating: Number(rating.toFixed(1)),
      numReviews,
    });
  }
};

/**
 * @desc   Create product review (Verified purchase enforcement)
 * @route  POST /api/reviews
 * @access Private
 */
export const createReview = async (req, res) => {
  try {
    const { productId, orderId, rating, comment } = req.body;

    const numericRating = Number(rating);
    if (!numericRating || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    if (!comment || typeof comment !== "string" || comment.trim().length === 0) {
      return res.status(400).json({ message: "Review comment is required" });
    }

    if (
      !productId ||
      !orderId ||
      !mongoose.Types.ObjectId.isValid(productId) ||
      !mongoose.Types.ObjectId.isValid(orderId)
    ) {
      return res.status(400).json({ message: "Valid Product ID and Order ID are required" });
    }

    // Security Check 1: User must own the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Forbidden: You can only review products from your own orders",
      });
    }

    // Security Check: Verified purchase requires payment completion
    if (!order.isPaid) {
      return res.status(400).json({
        message: "You can only review products from paid and completed orders",
      });
    }

    // Security Check 2: Product must exist in order items
    const hasProduct = order.orderItems.some(
      (item) => item.product && item.product.toString() === productId.toString()
    );

    if (!hasProduct) {
      return res.status(400).json({
        message: "Product was not purchased in this order",
      });
    }

    // Security Check 3: Check duplicate review for same user + product + order
    const existingReview = await Review.findOne({
      user: req.user._id,
      product: productId,
      order: orderId,
    });

    if (existingReview) {
      return res.status(400).json({
        message: "You have already reviewed this product for this order",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const vendorId =
      product.vendor && typeof product.vendor === "object"
        ? product.vendor._id
        : product.vendor || null;

    const review = await Review.create({
      user: req.user._id,
      product: productId,
      vendor: vendorId,
      order: orderId,
      rating: numericRating,
      comment: comment.trim(),
    });

    // Update Product and Vendor rating statistics
    await updateRatingsAggregate(productId, vendorId);

    res.status(201).json({
      message: "Review submitted successfully",
      review,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to submit review", error: error.message });
  }
};

/**
 * @desc   Get product reviews
 * @route  GET /api/reviews/product/:productId
 * @access Public
 */
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const reviews = await Review.find({ product: productId })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    const total = reviews.length;
    const avgRating =
      total > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / total).toFixed(1) : 0;

    res.json({
      count: total,
      averageRating: Number(avgRating),
      reviews,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch reviews", error: error.message });
  }
};

/**
 * @desc   Get user eligible products for review
 * @route  GET /api/reviews/eligible-products
 * @access Private
 */
export const getEligibleReviewProducts = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id });
    const userReviews = await Review.find({ user: req.user._id });

    const reviewedMap = new Set(
      userReviews.map((r) => `${r.order.toString()}_${r.product.toString()}`)
    );

    const eligibleItems = [];

    for (const order of orders) {
      for (const item of order.orderItems) {
        if (item.product) {
          const key = `${order._id.toString()}_${item.product.toString()}`;
          eligibleItems.push({
            orderId: order._id,
            productId: item.product,
            productName: item.name,
            purchasedAt: order.createdAt,
            hasReviewed: reviewedMap.has(key),
          });
        }
      }
    }

    res.json(eligibleItems);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch eligible products", error: error.message });
  }
};

/**
 * @desc   Delete review (User Ownership Enforced)
 * @route  DELETE /api/reviews/:id
 * @access Private
 */
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid review ID" });
    }

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (review.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden: You cannot delete another user's review" });
    }

    const { product, vendor } = review;
    await review.deleteOne();

    await updateRatingsAggregate(product, vendor);

    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete review", error: error.message });
  }
};
