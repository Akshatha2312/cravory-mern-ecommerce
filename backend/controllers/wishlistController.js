import Wishlist from "../models/Wishlist.js";
import Product from "../models/Product.js";
import mongoose from "mongoose";

/**
 * @desc   Get authenticated user's wishlist
 * @route  GET /api/wishlist
 * @access Private
 */
export const getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate({
      path: "products",
      populate: {
        path: "vendor",
        select: "_id bakeryName logo coverImage city state isApproved isActive",
      },
    });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: req.user._id,
        products: [],
      });
    }

    // Filter out null product references (if a product was deleted from DB)
    const validProducts = (wishlist.products || []).filter((p) => p !== null);

    res.status(200).json({
      _id: wishlist._id,
      user: wishlist.user,
      products: validProducts,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch wishlist",
      error: error.message,
    });
  }
};

/**
 * @desc   Add product to user's wishlist
 * @route  POST /api/wishlist/:productId
 * @access Private
 */
export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await Product.findById(productId).populate("vendor");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // If product is vendor-owned, check vendor approval & active status
    if (product.vendor && typeof product.vendor === "object") {
      if (product.vendor.isApproved === false || product.vendor.isActive === false) {
        return res.status(400).json({
          message: "Cannot add product from an unapproved or inactive bakery to wishlist",
        });
      }
    }

    let wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: req.user._id,
        products: [productId],
      });
    } else {
      // Prevent duplicates
      const exists = wishlist.products.some(
        (pId) => pId.toString() === productId.toString()
      );

      if (!exists) {
        wishlist.products.push(productId);
        await wishlist.save();
      }
    }

    const updatedWishlist = await Wishlist.findById(wishlist._id).populate({
      path: "products",
      populate: {
        path: "vendor",
        select: "_id bakeryName logo coverImage city state isApproved isActive",
      },
    });

    res.status(200).json({
      message: "Product added to wishlist",
      wishlist: updatedWishlist,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to add product to wishlist",
      error: error.message,
    });
  }
};

/**
 * @desc   Remove product from user's wishlist
 * @route  DELETE /api/wishlist/:productId
 * @access Private
 */
export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    let wishlist = await Wishlist.findOne({ user: req.user._id });

    if (wishlist) {
      wishlist.products = wishlist.products.filter(
        (pId) => pId.toString() !== productId.toString()
      );
      await wishlist.save();
    }

    const updatedWishlist = wishlist
      ? await Wishlist.findById(wishlist._id).populate({
          path: "products",
          populate: {
            path: "vendor",
            select: "_id bakeryName logo coverImage city state isApproved isActive",
          },
        })
      : { products: [] };

    res.status(200).json({
      message: "Product removed from wishlist",
      wishlist: updatedWishlist,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to remove product from wishlist",
      error: error.message,
    });
  }
};

/**
 * @desc   Toggle product in user's wishlist
 * @route  POST /api/wishlist/:productId/toggle
 * @access Private
 */
export const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    let wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: req.user._id,
        products: [],
      });
    }

    const existsIndex = wishlist.products.findIndex(
      (pId) => pId.toString() === productId.toString()
    );

    let isWishlisted = false;

    if (existsIndex > -1) {
      // Remove
      wishlist.products.splice(existsIndex, 1);
      isWishlisted = false;
    } else {
      // Validate product existence & vendor before adding
      const product = await Product.findById(productId).populate("vendor");

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      if (product.vendor && typeof product.vendor === "object") {
        if (product.vendor.isApproved === false || product.vendor.isActive === false) {
          return res.status(400).json({
            message: "Cannot add product from an unapproved or inactive bakery to wishlist",
          });
        }
      }

      wishlist.products.push(productId);
      isWishlisted = true;
    }

    await wishlist.save();

    res.status(200).json({
      message: isWishlisted ? "Added to wishlist" : "Removed from wishlist",
      isWishlisted,
      productIds: wishlist.products,
    });
  } catch (error) {
    res.status(500).json({
      message: "Wishlist toggle failed",
      error: error.message,
    });
  }
};
