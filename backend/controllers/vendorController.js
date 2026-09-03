import Vendor from "../models/Vendor.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import mongoose from "mongoose";

/**
 * @desc   Get vendor application/approval status for logged-in user
 * @route  GET /api/vendors/me/status
 * @access Private
 */
export const getVendorStatus = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user._id });

    if (!vendor) {
      return res.status(200).json({
        status: "NOT_APPLIED",
        hasVendorProfile: false,
        vendor: null,
      });
    }

    let status = "PENDING";
    if (vendor.isApproved && vendor.isActive) {
      status = "APPROVED";
    } else if (vendor.isApproved && !vendor.isActive) {
      status = "SUSPENDED";
    } else if (!vendor.isApproved) {
      status = "PENDING";
    }

    res.status(200).json({
      status,
      hasVendorProfile: true,
      vendor: {
        _id: vendor._id,
        bakeryName: vendor.bakeryName,
        description: vendor.description,
        phone: vendor.phone,
        email: vendor.email,
        address: vendor.address,
        city: vendor.city,
        state: vendor.state,
        pincode: vendor.pincode,
        isApproved: vendor.isApproved,
        isActive: vendor.isActive,
        createdAt: vendor.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch vendor status", error: error.message });
  }
};

/**
 * @desc   Register a new vendor profile (requires approval)
 * @route  POST /api/vendors/register
 * @access Private (Authenticated User)
 */
export const registerVendor = async (req, res) => {
  try {
    const {
      bakeryName,
      description,
      phone,
      email,
      logo,
      coverImage,
      address,
      city,
      state,
      pincode,
      location,
    } = req.body;

    // Field validations
    if (!bakeryName || !bakeryName.trim()) {
      return res.status(400).json({ message: "Bakery name is required" });
    }
    if (!phone || !phone.trim()) {
      return res.status(400).json({ message: "Phone number is required" });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ message: "Email is required" });
    }
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ message: "Please provide a valid email address" });
    }
    if (!address || !address.trim()) {
      return res.status(400).json({ message: "Address is required" });
    }
    if (!city || !city.trim()) {
      return res.status(400).json({ message: "City is required" });
    }
    if (!state || !state.trim()) {
      return res.status(400).json({ message: "State is required" });
    }
    if (!pincode || !pincode.trim()) {
      return res.status(400).json({ message: "Pincode is required" });
    }

    const existingVendor = await Vendor.findOne({ user: req.user._id });
    if (existingVendor) {
      return res.status(400).json({ message: "Vendor profile already exists for this user" });
    }

    const vendor = await Vendor.create({
      user: req.user._id,
      bakeryName: bakeryName.trim(),
      description: description ? description.trim() : "",
      phone: phone.trim(),
      email: email.trim(),
      logo: logo || "",
      coverImage: coverImage || "",
      address: address.trim(),
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      location: location || { lat: 0, lng: 0 },
      isApproved: false,
      isActive: true,
    });

    // Update user role to vendor
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { role: "vendor" },
      { new: true }
    ).select("-password");

    res.status(201).json({
      message: "Vendor application submitted successfully! Pending admin approval.",
      vendor,
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Vendor registration failed", error: error.message });
  }
};

/**
 * @desc   Get logged-in vendor profile
 * @route  GET /api/vendors/me
 * @access Private (Vendor)
 */
export const getVendorProfile = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user._id });

    if (!vendor) {
      return res.status(404).json({ message: "Vendor profile not found" });
    }

    res.status(200).json(vendor);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch vendor profile", error: error.message });
  }
};

/**
 * @desc   Update logged-in vendor profile
 * @route  PUT /api/vendors/me
 * @access Private (Approved & Active Vendor)
 */
export const updateVendorProfile = async (req, res) => {
  try {
    const vendor = req.vendor; // Attached by requireVendor middleware

    const {
      bakeryName,
      description,
      phone,
      email,
      logo,
      coverImage,
      address,
      city,
      state,
      pincode,
      location,
    } = req.body;

    if (bakeryName !== undefined) vendor.bakeryName = bakeryName.trim();
    if (description !== undefined) vendor.description = description;
    if (phone !== undefined) vendor.phone = phone;
    if (email !== undefined) vendor.email = email;
    if (logo !== undefined) vendor.logo = logo;
    if (coverImage !== undefined) vendor.coverImage = coverImage;
    if (address !== undefined) vendor.address = address;
    if (city !== undefined) vendor.city = city;
    if (state !== undefined) vendor.state = state;
    if (pincode !== undefined) vendor.pincode = pincode;
    if (location !== undefined) vendor.location = location;

    const updatedVendor = await vendor.save();

    res.status(200).json({
      message: "Vendor profile updated successfully",
      vendor: updatedVendor,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update vendor profile", error: error.message });
  }
};

/**
 * @desc   Get all pending vendor applications (Admin only)
 * @route  GET /api/vendors/admin/pending
 * @access Admin
 */
export const getPendingVendorsAdmin = async (req, res) => {
  try {
    const pendingVendors = await Vendor.find({ isApproved: false })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    const cleanList = pendingVendors.map((v) => ({
      _id: v._id,
      user: v.user ? { _id: v.user._id, name: v.user.name, email: v.user.email } : null,
      bakeryName: v.bakeryName,
      description: v.description,
      vendorEmail: v.email,
      phone: v.phone,
      address: v.address,
      city: v.city,
      state: v.state,
      pincode: v.pincode,
      createdAt: v.createdAt,
    }));

    res.status(200).json(cleanList);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch pending vendors", error: error.message });
  }
};

/**
 * @desc   Get all approved & active vendors (Public Marketplace)
 * @route  GET /api/vendors
 * @access Public
 */
export const getPublicVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find({ isApproved: true, isActive: true })
      .select("-__v")
      .sort({ createdAt: -1 });

    const sanitizedVendors = await Promise.all(
      vendors.map(async (v) => {
        const productCount = await Product.countDocuments({ vendor: v._id });
        return {
          _id: v._id,
          bakeryName: v.bakeryName,
          description: v.description,
          logo: v.logo,
          coverImage: v.coverImage,
          city: v.city,
          state: v.state,
          isApproved: v.isApproved,
          isActive: v.isActive,
          productCount,
          createdAt: v.createdAt,
        };
      })
    );

    res.status(200).json({
      count: sanitizedVendors.length,
      vendors: sanitizedVendors,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch vendors", error: error.message });
  }
};

export const getAllVendors = getPublicVendors;

/**
 * @desc   Get public vendor information by ID
 * @route  GET /api/vendors/:id
 * @access Public
 */
export const getPublicVendorById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid vendor ID" });
    }

    const vendor = await Vendor.findById(req.params.id);

    if (!vendor || !vendor.isApproved || !vendor.isActive) {
      return res.status(404).json({ message: "Vendor not found or unavailable" });
    }

    const productCount = await Product.countDocuments({ vendor: vendor._id });

    const publicData = {
      _id: vendor._id,
      bakeryName: vendor.bakeryName,
      description: vendor.description,
      logo: vendor.logo,
      coverImage: vendor.coverImage,
      address: vendor.address,
      city: vendor.city,
      state: vendor.state,
      pincode: vendor.pincode,
      isApproved: vendor.isApproved,
      isActive: vendor.isActive,
      productCount,
      createdAt: vendor.createdAt,
    };

    res.status(200).json(publicData);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch vendor", error: error.message });
  }
};

/**
 * @desc   Approve vendor (Admin only)
 * @route  PATCH /api/vendors/:id/approve
 * @access Admin
 */
export const approveVendor = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid vendor ID" });
    }

    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    vendor.isApproved = true;
    await vendor.save();

    await User.findByIdAndUpdate(vendor.user, { role: "vendor" });

    res.status(200).json({
      message: "Vendor approved successfully",
      vendor,
    });
  } catch (error) {
    res.status(500).json({ message: "Vendor approval failed", error: error.message });
  }
};

/**
 * @desc   Update vendor active status (Activate / Deactivate - Admin only)
 * @route  PATCH /api/vendors/:id/status
 * @access Admin
 */
export const updateVendorStatus = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid vendor ID" });
    }

    const { isActive } = req.body;

    if (isActive === undefined) {
      return res.status(400).json({ message: "isActive field is required" });
    }

    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    vendor.isActive = Boolean(isActive);
    await vendor.save();

    res.status(200).json({
      message: `Vendor ${vendor.isActive ? "activated" : "deactivated"} successfully`,
      vendor,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update vendor status", error: error.message });
  }
};
