import Address from "../models/Address.js";
import mongoose from "mongoose";

/**
 * @desc   Get authenticated user's delivery addresses
 * @route  GET /api/addresses
 * @access Private
 */
export const getAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.user._id }).sort({
      isDefault: -1,
      createdAt: -1,
    });

    res.status(200).json(addresses);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch delivery addresses",
      error: error.message,
    });
  }
};

/**
 * @desc   Create new delivery address
 * @route  POST /api/addresses
 * @access Private
 */
export const createAddress = async (req, res) => {
  try {
    const {
      fullName,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      pincode,
      landmark,
      label,
      isDefault,
    } = req.body;

    if (!fullName || !fullName.trim()) return res.status(400).json({ message: "Full name is required" });
    if (!phone || !phone.trim()) return res.status(400).json({ message: "Phone number is required" });
    if (!addressLine1 || !addressLine1.trim()) return res.status(400).json({ message: "Address line 1 is required" });
    if (!city || !city.trim()) return res.status(400).json({ message: "City is required" });
    if (!state || !state.trim()) return res.status(400).json({ message: "State is required" });
    if (!pincode || !pincode.trim()) return res.status(400).json({ message: "Pincode is required" });

    const existingCount = await Address.countDocuments({ user: req.user._id });
    const shouldBeDefault = Boolean(isDefault) || existingCount === 0;

    if (shouldBeDefault) {
      await Address.updateMany({ user: req.user._id }, { isDefault: false });
    }

    const address = await Address.create({
      user: req.user._id,
      fullName: fullName.trim(),
      phone: phone.trim(),
      addressLine1: addressLine1.trim(),
      addressLine2: addressLine2 ? addressLine2.trim() : "",
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      landmark: landmark ? landmark.trim() : "",
      label: label && ["Home", "Work", "Other"].includes(label) ? label : "Home",
      isDefault: shouldBeDefault,
    });

    res.status(201).json({
      message: "Delivery address created successfully",
      address,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create address",
      error: error.message,
    });
  }
};

/**
 * @desc   Update an existing delivery address
 * @route  PUT /api/addresses/:id
 * @access Private
 */
export const updateAddress = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid address ID" });
    }

    const address = await Address.findById(req.params.id);

    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    // Ownership check
    if (address.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Forbidden: You do not own this address" });
    }

    const {
      fullName,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      pincode,
      landmark,
      label,
      isDefault,
    } = req.body;

    if (fullName !== undefined) address.fullName = fullName.trim();
    if (phone !== undefined) address.phone = phone.trim();
    if (addressLine1 !== undefined) address.addressLine1 = addressLine1.trim();
    if (addressLine2 !== undefined) address.addressLine2 = addressLine2.trim();
    if (city !== undefined) address.city = city.trim();
    if (state !== undefined) address.state = state.trim();
    if (pincode !== undefined) address.pincode = pincode.trim();
    if (landmark !== undefined) address.landmark = landmark.trim();
    if (label !== undefined && ["Home", "Work", "Other"].includes(label)) address.label = label;

    if (isDefault === true && !address.isDefault) {
      await Address.updateMany({ user: req.user._id }, { isDefault: false });
      address.isDefault = true;
    }

    await address.save();

    res.status(200).json({
      message: "Address updated successfully",
      address,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update address",
      error: error.message,
    });
  }
};

/**
 * @desc   Delete a delivery address
 * @route  DELETE /api/addresses/:id
 * @access Private
 */
export const deleteAddress = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid address ID" });
    }

    const address = await Address.findById(req.params.id);

    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    // Ownership check
    if (address.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Forbidden: You do not own this address" });
    }

    const wasDefault = address.isDefault;
    await address.deleteOne();

    // If deleted address was default, set another address as default
    if (wasDefault) {
      const nextAddress = await Address.findOne({ user: req.user._id }).sort({ createdAt: -1 });
      if (nextAddress) {
        nextAddress.isDefault = true;
        await nextAddress.save();
      }
    }

    res.status(200).json({
      message: "Address deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete address",
      error: error.message,
    });
  }
};

/**
 * @desc   Set an address as default
 * @route  PATCH /api/addresses/:id/default
 * @access Private
 */
export const setDefaultAddress = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid address ID" });
    }

    const address = await Address.findById(req.params.id);

    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    // Ownership check
    if (address.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Forbidden: You do not own this address" });
    }

    await Address.updateMany({ user: req.user._id }, { isDefault: false });
    address.isDefault = true;
    await address.save();

    res.status(200).json({
      message: "Default address updated",
      address,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to set default address",
      error: error.message,
    });
  }
};
