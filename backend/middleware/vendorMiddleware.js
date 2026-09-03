import Vendor from "../models/Vendor.js";

export const requireVendor = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized, login required" });
    }

    if (req.user.role !== "vendor") {
      return res.status(403).json({ message: "Access denied. Vendor account required." });
    }

    const vendor = await Vendor.findOne({ user: req.user._id });

    if (!vendor) {
      return res.status(404).json({ message: "Vendor profile not found" });
    }

    if (!vendor.isApproved) {
      return res.status(403).json({ message: "Vendor account pending admin approval" });
    }

    if (!vendor.isActive) {
      return res.status(403).json({ message: "Vendor account is currently deactivated" });
    }

    req.vendor = vendor;
    next();
  } catch (error) {
    res.status(500).json({ message: "Vendor authorization check failed", error: error.message });
  }
};
