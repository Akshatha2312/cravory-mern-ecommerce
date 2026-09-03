import getRazorpayInstance from "../config/razorpay.js";
import crypto from "crypto";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Cart from "../models/Cart.js";
import mongoose from "mongoose";

export const createRazorpayOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: "Valid Cravory Order ID is required" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to pay for this order" });
    }

    if (order.isPaid) {
      return res.status(400).json({ message: "Order is already paid" });
    }

    const isProduction = process.env.NODE_ENV === "production";
    const razorpay = getRazorpayInstance();
    
    if (!razorpay) {
      if (isProduction) {
        return res.status(500).json({
          message: "Payment Gateway Error: Razorpay credentials are not configured in production environment.",
        });
      }

      // Non-production / Local Dev Fallback
      const dummyRazorpayOrderId = `order_simulated_${Date.now()}`;
      order.razorpayOrderId = dummyRazorpayOrderId;
      await order.save();

      return res.status(200).json({
        razorpayOrder: {
          id: dummyRazorpayOrderId,
          amount: Math.round(order.totalPrice * 100),
          currency: "INR",
          simulated: true,
        },
        orderId: order._id,
        key: "rzp_test_samplekey123",
      });
    }

    const amountInPaise = Math.round((Number(order.totalPrice) || 0) * 100);
    if (!amountInPaise || amountInPaise <= 0) {
      return res.status(400).json({ message: "Invalid order total amount for payment" });
    }

    const options = {
      amount: amountInPaise, // Amount in paise
      currency: "INR",
      receipt: `receipt_${order._id}`.substring(0, 40),
    };

    try {
      const razorpayOrder = await razorpay.orders.create(options);
      order.razorpayOrderId = razorpayOrder.id;
      await order.save();

      return res.status(200).json({
        razorpayOrder,
        orderId: order._id,
        key: process.env.RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        id: razorpayOrder.id,
      });
    } catch (rzpErr) {
      console.error("Razorpay SDK Order Creation Failed:", rzpErr);
      const rawError = rzpErr.error?.description || rzpErr.description || rzpErr.message || "Razorpay API error";
      const isAuthError = rawError.toLowerCase().includes("auth");

      const userMessage = isAuthError
        ? "Razorpay Gateway Authentication Failed. Please verify RAZORPAY_KEY_SECRET in backend configuration."
        : "Failed to create Razorpay gateway order";

      return res.status(500).json({
        message: userMessage,
        error: rawError,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Razorpay order creation failed",
      error: error.message,
    });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
      mongo_order_id,
    } = req.body;

    const targetOrderId = orderId || mongo_order_id;

    if (!targetOrderId || !mongoose.Types.ObjectId.isValid(targetOrderId)) {
      return res.status(400).json({ message: "Valid Cravory Order ID is required" });
    }

    const order = await Order.findById(targetOrderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Security Check 1: User ownership validation
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Forbidden: You are not authorized to verify payment for this order" });
    }

    // Security Check 2: Razorpay Order ID match validation
    if (order.razorpayOrderId && razorpay_order_id && order.razorpayOrderId !== razorpay_order_id) {
      return res.status(400).json({ message: "Razorpay order ID does not match this order" });
    }

    // Idempotency Check: Safe handling of duplicate payment verifications
    if (order.isPaid) {
      return res.status(200).json({
        message: "Order is already paid",
        alreadyPaid: true,
        order,
      });
    }

    const razorpay = getRazorpayInstance();

    if (razorpay && process.env.RAZORPAY_KEY_SECRET) {
      const body = razorpay_order_id + "|" + razorpay_payment_id;

      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest("hex");

      if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({ message: "Payment signature verification failed" });
      }
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentMethod = "Razorpay";
    order.paymentResult = {
      razorpay_order_id: razorpay_order_id || order.razorpayOrderId || `order_sim_${Date.now()}`,
      razorpay_payment_id: razorpay_payment_id || `pay_sim_${Date.now()}`,
      razorpay_signature: razorpay_signature || "simulated_sig",
    };

    await order.save();

    // Deduct stock for products (executed exactly once upon payment success)
    for (const item of order.orderItems) {
      if (item.product) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.qty },
        });
      }
    }

    // Clear backend cart for logged-in user
    await Cart.findOneAndDelete({ user: req.user._id });

    res.status(200).json({
      message: "Payment successful",
      alreadyPaid: false,
      order,
    });
  } catch (error) {
    res.status(500).json({
      message: "Payment verification error",
      error: error.message,
    });
  }
};

/**
 * @desc   Handle payment cancellation/failure gracefully
 * @route  POST /api/payment/failed
 * @access Private
 */
export const handlePaymentFailure = async (req, res) => {
  try {
    const { orderId, reason } = req.body;

    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: "Valid Order ID is required" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized for this order" });
    }

    res.status(200).json({
      message: "Payment cancelled or failed. Order remains available for payment retry.",
      orderId: order._id,
      isPaid: order.isPaid,
      reason: reason || "User cancelled payment",
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to handle payment failure", error: error.message });
  }
};

/**
 * @desc   Razorpay Webhook Handler
 * @route  POST /api/payment/webhook
 * @access Public (Webhook Signature Protected)
 */
export const handleRazorpayWebhook = async (req, res) => {
  try {
    const isProduction = process.env.NODE_ENV === "production";
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (isProduction) {
      if (!webhookSecret) {
        return res.status(500).json({
          message: "Webhook Error: RAZORPAY_WEBHOOK_SECRET is required in production environment.",
        });
      }
    }

    const secretToUse = webhookSecret || process.env.RAZORPAY_KEY_SECRET;
    const signature = req.headers["x-razorpay-signature"];

    if (isProduction && !signature) {
      return res.status(401).json({ message: "Unauthorized: Missing webhook signature header." });
    }

    if (secretToUse && signature) {
      const rawPayload = req.rawBody ? req.rawBody.toString() : JSON.stringify(req.body);
      const expectedSignature = crypto
        .createHmac("sha256", secretToUse)
        .update(rawPayload)
        .digest("hex");

      if (expectedSignature !== signature) {
        return res.status(401).json({ message: "Invalid webhook signature" });
      }
    }

    const event = req.body?.event;
    const payload = req.body?.payload;

    if (event === "payment.captured" || event === "order.paid") {
      const entity = payload?.payment?.entity || payload?.order?.entity;
      const razorpayOrderId = entity?.order_id || entity?.id;

      if (razorpayOrderId) {
        const order = await Order.findOne({ razorpayOrderId });
        if (order && !order.isPaid) {
          order.isPaid = true;
          order.paidAt = Date.now();
          order.paymentMethod = "Razorpay (Webhook)";
          order.paymentResult = {
            razorpay_order_id: razorpayOrderId,
            razorpay_payment_id: entity?.id || "webhook_pay_id",
            razorpay_signature: signature || "webhook_sig",
          };
          await order.save();

          for (const item of order.orderItems) {
            if (item.product) {
              await Product.findByIdAndUpdate(item.product, {
                $inc: { stock: -item.qty },
              });
            }
          }

          await Cart.findOneAndDelete({ user: order.user });
        }
      }
    }

    res.status(200).json({ status: "ok" });
  } catch (error) {
    res.status(500).json({ message: "Webhook processing error", error: error.message });
  }
};
