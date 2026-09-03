import User from "../models/User.js";
import Vendor from "../models/Vendor.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import Coupon from "../models/Coupon.js";
import mongoose from "mongoose";

/**
 * @desc   Get Admin Dashboard real database metrics
 * @route  GET /api/admin/dashboard
 * @access Private (Admin)
 */
export const getAdminDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: "user" });
    const totalVendors = await Vendor.countDocuments();
    const pendingVendors = await Vendor.countDocuments({ isApproved: false });
    const approvedVendors = await Vendor.countDocuments({ isApproved: true, isActive: true });
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const paidOrders = await Order.countDocuments({ isPaid: true });
    const unpaidOrders = await Order.countDocuments({ isPaid: false });

    // Total Revenue calculation from paid orders
    const revenueAgg = await Order.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, totalRevenue: { $sum: "$totalPrice" } } },
    ]);
    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].totalRevenue : 0;

    const now = new Date();
    const activeCoupons = await Coupon.countDocuments({
      isActive: true,
      expiryDate: { $gte: now },
    });

    res.json({
      totalUsers,
      totalVendors,
      pendingVendors,
      approvedVendors,
      totalProducts,
      totalOrders,
      paidOrders,
      unpaidOrders,
      totalRevenue: Number(totalRevenue.toFixed(2)),
      activeCoupons,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to load dashboard metrics", error: error.message });
  }
};

/**
 * @desc   Get all vendor applications / profiles
 * @route  GET /api/admin/vendors
 * @access Private (Admin)
 */
export const getAdminVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find()
      .populate("user", "name email role createdAt")
      .sort({ createdAt: -1 });

    res.json(vendors);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch vendors", error: error.message });
  }
};

/**
 * @desc   Approve / Activate / Deactivate Vendor
 * @route  PATCH /api/admin/vendors/:id/status
 * @access Private (Admin)
 */
export const updateVendorStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isApproved, isActive } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid vendor ID" });
    }

    const vendor = await Vendor.findById(id);
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    if (typeof isApproved === "boolean") {
      vendor.isApproved = isApproved;
      // When approving, ensure user role is updated to vendor
      if (isApproved) {
        await User.findByIdAndUpdate(vendor.user, { role: "vendor" });
      }
    }

    if (typeof isActive === "boolean") {
      vendor.isActive = isActive;
    }

    await vendor.save();

    res.json({
      message: `Vendor '${vendor.bakeryName}' status updated successfully`,
      vendor,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update vendor status", error: error.message });
  }
};

/**
 * @desc   Get all users (Passwords Excluded)
 * @route  GET /api/admin/users
 * @access Private (Admin)
 */
export const getAdminUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users", error: error.message });
  }
};

/**
 * @desc   Toggle user account activation
 * @route  PATCH /api/admin/users/:id/status
 * @access Private (Admin)
 */
export const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Safety Guard: Prevent deactivating the last active admin
    if (user.role === "admin" && isActive === false) {
      const activeAdminCount = await User.countDocuments({ role: "admin", isActive: true });
      if (activeAdminCount <= 1) {
        return res.status(400).json({ message: "Cannot deactivate the last remaining active admin account" });
      }
    }

    user.isActive = isActive;
    await user.save();

    res.json({
      message: `User '${user.name}' account ${isActive ? "activated" : "deactivated"}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to toggle user status", error: error.message });
  }
};

/**
 * @desc   Get all products with search & filter
 * @route  GET /api/admin/products
 * @access Private (Admin)
 */
export const getAdminProducts = async (req, res) => {
  try {
    const { q, category, vendor, isAvailable } = req.query;

    const filter = {};

    if (q) {
      filter.name = { $regex: q, $options: "i" };
    }

    if (category) {
      filter.category = category;
    }

    if (vendor === "legacy") {
      filter.vendor = null;
    } else if (vendor && mongoose.Types.ObjectId.isValid(vendor)) {
      filter.vendor = vendor;
    }

    if (isAvailable !== undefined) {
      filter.isAvailable = isAvailable === "true";
    }

    const products = await Product.find(filter)
      .populate("vendor", "_id bakeryName logo")
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch products", error: error.message });
  }
};

/**
 * @desc   Toggle product availability (Admin)
 * @route  PATCH /api/admin/products/:id/availability
 * @access Private (Admin)
 */
export const toggleProductAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { isAvailable } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.isAvailable = isAvailable;
    await product.save();

    res.json({ message: `Product '${product.name}' availability updated`, product });
  } catch (error) {
    res.status(500).json({ message: "Failed to update product availability", error: error.message });
  }
};

/**
 * @desc   Get all unified customer orders
 * @route  GET /api/admin/orders
 * @access Private (Admin)
 */
export const getAdminOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("orderItems.vendor", "bakeryName logo")
      .populate("orderItems.product", "name price")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch orders", error: error.message });
  }
};

/**
 * @desc   Get Real Database Analytics
 * @route  GET /api/admin/analytics
 * @access Private (Admin)
 */
export const getAdminAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: "user" });
    const totalVendors = await Vendor.countDocuments({ isApproved: true });
    const totalOrders = await Order.countDocuments();
    const paidOrders = await Order.countDocuments({ isPaid: true });

    // Aggregate Revenue
    const revAgg = await Order.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]);
    const totalRevenue = revAgg.length > 0 ? revAgg[0].total : 0;

    // Orders by fulfillment status breakdown
    const ordersByStatus = await Order.aggregate([
      { $unwind: "$orderItems" },
      { $group: { _id: "$orderItems.status", count: { $sum: 1 } } },
    ]);

    // Top 5 Products sold
    const topProducts = await Order.aggregate([
      { $unwind: "$orderItems" },
      { $group: { _id: "$orderItems.name", totalSold: { $sum: "$orderItems.qty" }, revenue: { $sum: { $multiply: ["$orderItems.price", "$orderItems.qty"] } } } },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
    ]);

    res.json({
      totalUsers,
      totalVendors,
      totalOrders,
      paidOrders,
      totalRevenue: Number(totalRevenue.toFixed(2)),
      ordersByStatus,
      topProducts,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to calculate analytics", error: error.message });
  }
};
