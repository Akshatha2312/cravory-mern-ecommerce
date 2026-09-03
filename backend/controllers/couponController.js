import Coupon from "../models/Coupon.js";

/**
 * Server-authoritative helper to validate coupon and compute discount
 */
export const validateCouponHelper = async (code, userId, subtotal) => {
  if (!code || typeof code !== "string" || code.trim().length === 0) {
    throw new Error("Coupon code is required");
  }

  const cleanCode = code.trim().toUpperCase();
  const coupon = await Coupon.findOne({ code: cleanCode });

  if (!coupon || !coupon.isActive) {
    throw new Error("Invalid or inactive coupon code");
  }

  const now = new Date();
  if (coupon.startDate && now < coupon.startDate) {
    throw new Error("Coupon is not yet active");
  }

  if (coupon.expiryDate && now > coupon.expiryDate) {
    throw new Error("Coupon has expired");
  }

  if (coupon.minOrderValue && subtotal < coupon.minOrderValue) {
    throw new Error(
      `Minimum order value of ₹${coupon.minOrderValue} required for coupon '${cleanCode}'`
    );
  }

  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    throw new Error("Coupon usage limit has been reached");
  }

  if (userId && coupon.perUserLimit !== null) {
    const userEntry = coupon.userUsage?.find(
      (u) => u.user.toString() === userId.toString()
    );
    if (userEntry && userEntry.count >= coupon.perUserLimit) {
      throw new Error("You have already used this coupon");
    }
  }

  let discountAmount = 0;
  if (coupon.discountType === "percentage") {
    discountAmount = (subtotal * coupon.discountValue) / 100;
    if (coupon.maxDiscount !== null && coupon.maxDiscount > 0) {
      discountAmount = Math.min(discountAmount, coupon.maxDiscount);
    }
  } else if (coupon.discountType === "fixed") {
    discountAmount = coupon.discountValue;
  }

  // Ensure discount does not exceed subtotal and total does not become negative
  discountAmount = Math.min(discountAmount, subtotal);
  discountAmount = Math.max(0, Number(discountAmount.toFixed(2)));
  const finalTotal = Math.max(0, Number((subtotal - discountAmount).toFixed(2)));

  return {
    coupon,
    code: coupon.code,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    discountAmount,
    finalTotal,
  };
};

/**
 * @desc   Apply coupon to cart/checkout subtotal (Server Revalidated)
 * @route  POST /api/coupons/apply
 * @access Private
 */
export const applyCoupon = async (req, res) => {
  try {
    const { code, subtotal } = req.body;
    const numSubtotal = Number(subtotal);

    if (isNaN(numSubtotal) || numSubtotal < 0) {
      return res.status(400).json({ message: "Invalid order subtotal" });
    }

    const result = await validateCouponHelper(code, req.user._id, numSubtotal);

    res.status(200).json({
      message: `Coupon '${result.code}' applied successfully!`,
      ...result,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * @desc   Get active public coupons
 * @route  GET /api/coupons
 * @access Private/Public
 */
export const getPublicCoupons = async (req, res) => {
  try {
    const now = new Date();
    const coupons = await Coupon.find({
      isActive: true,
      expiryDate: { $gte: now },
    }).select("code discountType discountValue minOrderValue maxDiscount expiryDate description");

    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch coupons", error: error.message });
  }
};

/**
 * @desc   Admin – Create Coupon
 * @route  POST /api/coupons/admin
 * @access Admin
 */
export const createCoupon = async (req, res) => {
  try {
    const {
      code,
      discountType,
      discountValue,
      minOrderValue,
      maxDiscount,
      expiryDate,
      usageLimit,
      perUserLimit,
    } = req.body;

    if (!code || !discountType || !discountValue || !expiryDate) {
      return res.status(400).json({ message: "Code, discountType, discountValue, and expiryDate are required" });
    }

    const existing = await Coupon.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(400).json({ message: "Coupon code already exists" });
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      discountType,
      discountValue: Number(discountValue),
      minOrderValue: Number(minOrderValue || 0),
      maxDiscount: maxDiscount ? Number(maxDiscount) : null,
      expiryDate: new Date(expiryDate),
      usageLimit: usageLimit ? Number(usageLimit) : null,
      perUserLimit: perUserLimit ? Number(perUserLimit) : 1,
      isActive: true,
    });

    res.status(201).json({ message: "Coupon created successfully", coupon });
  } catch (error) {
    res.status(500).json({ message: "Failed to create coupon", error: error.message });
  }
};

/**
 * @desc   Admin – Deactivate Coupon
 * @route  DELETE /api/coupons/admin/:id
 * @access Admin
 */
export const deactivateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    coupon.isActive = false;
    await coupon.save();

    res.json({ message: "Coupon deactivated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to deactivate coupon", error: error.message });
  }
};
