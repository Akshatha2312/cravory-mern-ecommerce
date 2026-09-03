import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Coupon from "../models/Coupon.js";
import { validateCouponHelper } from "./couponController.js";
import mongoose from "mongoose";

/**
 * @desc   Create new order with server-calculated prices, stock validation, and coupon processing
 * @route  POST /api/orders
 * @access Private
 */
export const createOrder = async (req, res) => {
  try {
    const { orderItems, shippingAddress, couponCode } = req.body;

    if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
      return res.status(400).json({ message: "No order items provided" });
    }

    if (!shippingAddress || !shippingAddress.addressLine1 || !shippingAddress.city) {
      return res.status(400).json({ message: "A valid delivery address is required for checkout" });
    }

    let calculatedSubtotal = 0;
    const validatedItems = [];

    for (const item of orderItems) {
      const productId = item.product || item._id;
      const qty = Number(item.qty || item.quantity);

      if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({ message: "Invalid product ID in order items" });
      }

      if (!qty || qty < 1) {
        return res.status(400).json({ message: "Item quantity must be at least 1" });
      }

      const product = await Product.findById(productId).populate("vendor");
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${productId}` });
      }

      // Vendor availability checks
      if (product.vendor && typeof product.vendor === "object") {
        if (product.vendor.isApproved === false || product.vendor.isActive === false) {
          return res.status(400).json({
            message: `'${product.name}' is from '${product.vendor.bakeryName}' which is currently inactive.`,
          });
        }
      }

      if (product.isAvailable === false) {
        return res.status(400).json({ message: `'${product.name}' is currently unavailable.` });
      }

      if (product.stock < qty) {
        return res.status(400).json({
          message: `Insufficient stock for '${product.name}'. Available: ${product.stock}, requested: ${qty}`,
        });
      }

      const itemTotalPrice = product.price * qty;
      calculatedSubtotal += itemTotalPrice;

      validatedItems.push({
        name: product.name,
        qty,
        price: product.price, // MongoDB database authoritative price
        product: product._id,
        vendor: product.vendor && typeof product.vendor === "object" ? product.vendor._id : product.vendor || null,
        status: "pending",
      });
    }

    // Process Coupon if provided (Server Revalidated)
    let discountAmount = 0;
    let appliedCoupon = null;

    if (couponCode && typeof couponCode === "string" && couponCode.trim().length > 0) {
      const cRes = await validateCouponHelper(couponCode, req.user._id, calculatedSubtotal);
      discountAmount = cRes.discountAmount;
      appliedCoupon = {
        code: cRes.code,
        discountAmount: cRes.discountAmount,
      };

      // Record coupon usage
      const couponDoc = await Coupon.findOne({ code: cRes.code });
      if (couponDoc) {
        couponDoc.usedCount += 1;

        const userIdx = couponDoc.userUsage.findIndex(
          (u) => u.user.toString() === req.user._id.toString()
        );
        if (userIdx > -1) {
          couponDoc.userUsage[userIdx].count += 1;
        } else {
          couponDoc.userUsage.push({ user: req.user._id, count: 1 });
        }

        await couponDoc.save();
      }
    }

    const finalTotal = Math.max(0, Number((calculatedSubtotal - discountAmount).toFixed(2)));

    // Save immutable address snapshot
    const addressSnapshot = {
      fullName: shippingAddress.fullName || "",
      phone: shippingAddress.phone || "",
      addressLine1: shippingAddress.addressLine1 || "",
      addressLine2: shippingAddress.addressLine2 || "",
      city: shippingAddress.city || "",
      state: shippingAddress.state || "",
      pincode: shippingAddress.pincode || "",
      landmark: shippingAddress.landmark || "",
      label: shippingAddress.label || "Home",
    };

    const order = await Order.create({
      user: req.user._id,
      orderItems: validatedItems,
      subtotal: calculatedSubtotal,
      discountAmount,
      coupon: appliedCoupon,
      totalPrice: finalTotal,
      shippingAddress: addressSnapshot,
      isPaid: false,
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({
      message: "Order creation failed",
      error: error.message,
    });
  }
};

/**
 * @desc   Get logged-in user orders
 * @route  GET /api/orders/my-orders
 * @access Private
 */
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate({
        path: "orderItems.vendor",
        select: "_id bakeryName logo city state phone",
      })
      .populate("orderItems.product", "_id name images")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch orders", error: error.message });
  }
};

/**
 * @desc   Get orders containing products for authenticated vendor (Cross-Tenant Isolated)
 * @route  GET /api/orders/vendor/my-orders
 * @access Private (Approved Vendor)
 */
export const getVendorOrders = async (req, res) => {
  try {
    const vendorId = req.vendor._id;

    // Find orders that contain at least one item from this vendor
    const orders = await Order.find({ "orderItems.vendor": vendorId })
      .populate("user", "name email")
      .populate({
        path: "orderItems.product",
        select: "_id name images price",
      })
      .sort({ createdAt: -1 });

    // Filter items in each order to ONLY include this vendor's items
    const vendorOrders = orders.map((order) => {
      const orderObj = order.toObject();
      const myItems = orderObj.orderItems.filter(
        (item) => item.vendor && item.vendor.toString() === vendorId.toString()
      );

      const vendorSubtotal = myItems.reduce(
        (sum, item) => sum + item.price * item.qty,
        0
      );

      return {
        ...orderObj,
        orderItems: myItems,
        vendorSubtotal,
      };
    });

    res.status(200).json({
      count: vendorOrders.length,
      orders: vendorOrders,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch vendor orders",
      error: error.message,
    });
  }
};

/**
 * @desc   Get single vendor order by ID (Cross-Tenant Protected)
 * @route  GET /api/orders/vendor/:id
 * @access Private (Approved Vendor)
 */
export const getVendorOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const vendorId = req.vendor._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    const order = await Order.findById(id).populate("user", "name email");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if vendor owns any items in this order
    const myItems = order.orderItems.filter(
      (item) => item.vendor && item.vendor.toString() === vendorId.toString()
    );

    if (myItems.length === 0) {
      return res.status(403).json({
        message: "Forbidden: You do not have products in this order",
      });
    }

    const orderObj = order.toObject();
    const vendorSubtotal = myItems.reduce(
      (sum, item) => sum + item.price * item.qty,
      0
    );

    res.status(200).json({
      ...orderObj,
      orderItems: myItems,
      vendorSubtotal,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch vendor order",
      error: error.message,
    });
  }
};

/**
 * @desc   Get single order by ID for customer tracking (Customer Ownership Protected)
 * @route  GET /api/orders/:id
 * @access Private
 */
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    const order = await Order.findById(id)
      .populate({
        path: "orderItems.vendor",
        select: "_id bakeryName logo city state phone",
      })
      .populate("orderItems.product", "_id name images");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Security Check: Verify Customer Ownership (or Admin)
    if (
      order.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        message: "Forbidden: You are not authorized to view this order",
      });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch order", error: error.message });
  }
};

const STATUS_STAGES = {
  pending: 0,
  confirmed: 1,
  preparing: 2,
  ready: 3,
  out_for_delivery: 4,
  delivered: 5,
  cancelled: -1,
};

const isValidStatusTransition = (currentStatus, newStatus) => {
  const curr = currentStatus || "pending";
  if (curr === newStatus) return true; // Same status no-op
  if (curr === "cancelled") return false; // Cancelled items cannot continue fulfillment
  if (curr === "delivered") return false; // Cannot move backward out of delivered
  if (newStatus === "cancelled") return curr !== "delivered"; // Can cancel anytime before delivered

  const currentRank = STATUS_STAGES[curr] ?? 0;
  const newRank = STATUS_STAGES[newStatus] ?? 0;

  return newRank >= currentRank;
};

/**
 * @desc   Update status for vendor's order items
 * @route  PATCH /api/orders/vendor/:id/status
 * @access Private (Approved Vendor)
 */
export const updateVendorOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, itemId } = req.body;
    const vendorId = req.vendor._id;

    const allowedStatuses = [
      "pending",
      "confirmed",
      "preparing",
      "ready",
      "out_for_delivery",
      "delivered",
      "cancelled",
    ];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${allowedStatuses.join(", ")}`,
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    let updatedCount = 0;

    for (const item of order.orderItems) {
      if (item.vendor && item.vendor.toString() === vendorId.toString()) {
        if (!itemId || item._id.toString() === itemId) {
          const currentItemStatus = item.status || "pending";

          if (!isValidStatusTransition(currentItemStatus, status)) {
            return res.status(400).json({
              message: `Invalid status transition: Cannot change status from '${currentItemStatus}' to '${status}'`,
            });
          }

          item.status = status;
          updatedCount++;
        }
      }
    }

    if (updatedCount === 0) {
      return res.status(403).json({
        message: "Forbidden: You do not own any items in this order to update",
      });
    }

    // Parent order becomes delivered ONLY when all order items across all vendors are delivered
    const allDelivered = order.orderItems.every(
      (item) => item.status === "delivered"
    );

    if (allDelivered) {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    }

    await order.save();

    res.status(200).json({
      message: `Updated status to '${status}' for ${updatedCount} item(s)`,
      order,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update vendor order status",
      error: error.message,
    });
  }
};

/**
 * @desc   Admin – get all orders
 * @route  GET /api/orders
 * @access Admin
 */
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch orders", error: error.message });
  }
};

/**
 * @desc   Admin – update order status
 * @route  PUT /api/orders/:id/deliver
 * @access Admin
 */
export const markOrderDelivered = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.isDelivered = true;
    order.deliveredAt = Date.now();
    await order.save();

    res.json({ message: "Order delivered", order });
  } catch (error) {
    res.status(500).json({ message: "Failed to update order", error: error.message });
  }
};
