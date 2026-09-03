import Product from "../models/Product.js";
import mongoose from "mongoose";

/**
 * @desc   Add new product (Admin only)
 * @route  POST /api/products/add-product
 * @access Admin
 */
export const addProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock } = req.body;

    if (!name || !description || !price || !category) {
      return res.status(400).json({
        message: "All required fields must be filled",
      });
    }

    const product = await Product.create({
      name,
      description,
      price: Number(price),
      category,
      stock: stock ? Number(stock) : 0,
      createdBy: req.user._id,
    });

    res.status(201).json({
      message: "Product added successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to add product",
      error: error.message,
    });
  }
};

/**
 * @desc   Get all products (Public Marketplace)
 * @route  GET /api/products
 * @access Public
 */
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("vendor", "_id bakeryName logo coverImage city state isApproved isActive")
      .sort({ createdAt: -1 });

    // Filter public marketplace products according to visibility rules:
    // 1. If product is vendor-owned: vendor must exist, be approved, and active.
    // 2. If product is legacy admin product (vendor === null): allow it.
    // 3. Product must be available (isAvailable !== false) and in stock (stock > 0) for general marketplace listing.
    const publicProducts = products.filter((p) => {
      if (p.isAvailable === false || p.stock <= 0) {
        return false;
      }
      if (p.vendor) {
        return p.vendor.isApproved === true && p.vendor.isActive === true;
      }
      return true; // Legacy product with vendor = null
    });

    res.status(200).json({
      count: publicProducts.length,
      products: publicProducts,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};

/**
 * @desc   Get public products for a specific approved vendor
 * @route  GET /api/products/public/vendor/:vendorId
 * @access Public
 */
export const getVendorPublicProducts = async (req, res) => {
  try {
    const { vendorId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(vendorId)) {
      return res.status(400).json({ message: "Invalid vendor ID" });
    }

    const Vendor = mongoose.model("Vendor");
    const vendor = await Vendor.findById(vendorId);

    if (!vendor || !vendor.isApproved || !vendor.isActive) {
      return res.status(404).json({ message: "Bakery not found or unavailable" });
    }

    const products = await Product.find({
      vendor: vendorId,
      isAvailable: { $ne: false },
      stock: { $gt: 0 },
    })
      .populate("vendor", "_id bakeryName logo coverImage city state isApproved isActive")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: products.length,
      products,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch bakery products",
      error: error.message,
    });
  }
};

/**
 * @desc   Get single product
 * @route  GET /api/products/:id
 * @access Public
 */
export const getProductById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await Product.findById(req.params.id).populate(
      "vendor",
      "_id bakeryName logo coverImage city state isApproved isActive"
    );

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    // If product belongs to a vendor, enforce approved & active vendor checks
    if (product.vendor && typeof product.vendor === "object") {
      if (product.vendor.isApproved === false || product.vendor.isActive === false) {
        return res.status(404).json({
          message: "Product not found or bakery is currently unavailable",
        });
      }
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch product",
      error: error.message,
    });
  }
};

/**
 * @desc   Update product (Admin)
 * @route  PUT /api/products/:id
 * @access Admin
 */
export const updateProduct = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    product.name = req.body.name ?? product.name;
    product.description = req.body.description ?? product.description;
    product.price = req.body.price !== undefined ? Number(req.body.price) : product.price;
    product.category = req.body.category ?? product.category;
    product.stock = req.body.stock !== undefined ? Number(req.body.stock) : product.stock;

    const updatedProduct = await product.save();

    res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update product",
      error: error.message,
    });
  }
};

// Upload product image (Admin)
export const uploadProductImage = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    product.images.push({
      url: req.file.path,
      public_id: req.file.filename,
    });

    await product.save();

    res.status(200).json({
      message: "Image uploaded successfully",
      images: product.images,
    });
  } catch (error) {
    res.status(500).json({
      message: "Image upload failed",
      error: error.message,
    });
  }
};

/**
 * @desc   Delete product (Admin)
 * @route  DELETE /api/products/:id
 * @access Admin
 */
export const deleteProduct = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    await product.deleteOne();

    res.status(200).json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete product",
      error: error.message,
    });
  }
};

/**
 * @desc   Get vendor's own products
 * @route  GET /api/products/vendor/my-products
 * @access Private (Approved Vendor)
 */
export const getVendorProducts = async (req, res) => {
  try {
    const products = await Product.find({ vendor: req.vendor._id }).sort({ createdAt: -1 });

    res.status(200).json({
      count: products.length,
      products,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch vendor products",
      error: error.message,
    });
  }
};

/**
 * @desc   Create product for authenticated vendor
 * @route  POST /api/products/vendor
 * @access Private (Approved Vendor)
 */
export const createVendorProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock, images } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Product name is required" });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ message: "Description is required" });
    }
    if (price === undefined || Number(price) <= 0) {
      return res.status(400).json({ message: "Price must be greater than 0" });
    }
    if (!category || !category.trim()) {
      return res.status(400).json({ message: "Category is required" });
    }
    if (stock === undefined || Number(stock) < 0) {
      return res.status(400).json({ message: "Stock cannot be negative" });
    }

    const product = await Product.create({
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      category: category.trim(),
      stock: Number(stock),
      images: Array.isArray(images) ? images : [],
      createdBy: req.user._id,
      vendor: req.vendor._id, // Server assigns vendor ID
      isAvailable: true,
    });

    res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create product",
      error: error.message,
    });
  }
};

/**
 * @desc   Update vendor's own product
 * @route  PUT /api/products/vendor/:id
 * @access Private (Approved Vendor)
 */
export const updateVendorProduct = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Ownership check
    if (!product.vendor || product.vendor.toString() !== req.vendor._id.toString()) {
      return res.status(403).json({ message: "Forbidden: You do not own this product" });
    }

    const { name, description, price, category, stock, isAvailable } = req.body;

    if (name !== undefined) product.name = name.trim();
    if (description !== undefined) product.description = description.trim();
    if (price !== undefined) {
      if (Number(price) <= 0) return res.status(400).json({ message: "Price must be greater than 0" });
      product.price = Number(price);
    }
    if (category !== undefined) product.category = category.trim();
    if (stock !== undefined) {
      if (Number(stock) < 0) return res.status(400).json({ message: "Stock cannot be negative" });
      product.stock = Number(stock);
    }
    if (isAvailable !== undefined) {
      product.isAvailable = Boolean(isAvailable);
    }

    // Prohibit changing vendor ownership or creator
    const updatedProduct = await product.save();

    res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update product",
      error: error.message,
    });
  }
};

/**
 * @desc   Delete vendor's own product
 * @route  DELETE /api/products/vendor/:id
 * @access Private (Approved Vendor)
 */
export const deleteVendorProduct = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Ownership check
    if (!product.vendor || product.vendor.toString() !== req.vendor._id.toString()) {
      return res.status(403).json({ message: "Forbidden: You do not own this product" });
    }

    await product.deleteOne();

    res.status(200).json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete product",
      error: error.message,
    });
  }
};

/**
 * @desc   Toggle vendor product availability
 * @route  PATCH /api/products/vendor/:id/status
 * @access Private (Approved Vendor)
 */
export const toggleVendorProductStatus = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Ownership check
    if (!product.vendor || product.vendor.toString() !== req.vendor._id.toString()) {
      return res.status(403).json({ message: "Forbidden: You do not own this product" });
    }

    if (req.body.isAvailable !== undefined) {
      product.isAvailable = Boolean(req.body.isAvailable);
    } else {
      product.isAvailable = !product.isAvailable;
    }

    await product.save();

    res.status(200).json({
      message: `Product is now ${product.isAvailable ? "Available" : "Unavailable"}`,
      product,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to toggle product availability",
      error: error.message,
    });
  }
};

/**
 * @desc   Upload image for vendor's own product
 * @route  POST /api/products/vendor/:id/upload
 * @access Private (Approved Vendor)
 */
export const uploadVendorProductImage = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Ownership check
    if (!product.vendor || product.vendor.toString() !== req.vendor._id.toString()) {
      return res.status(403).json({ message: "Forbidden: You do not own this product" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    product.images.push({
      url: req.file.path,
      public_id: req.file.filename,
    });

    await product.save();

    res.status(200).json({
      message: "Product image uploaded successfully",
      images: product.images,
      product,
    });
  } catch (error) {
    res.status(500).json({
      message: "Product image upload failed",
      error: error.message,
    });
  }
};

/**
 * @desc   Update stock for vendor's own product
 * @route  PATCH /api/products/vendor/:id/stock
 * @access Private (Approved Vendor)
 */
export const updateVendorProductStock = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const { stock } = req.body;

    if (stock === undefined || stock === null || isNaN(Number(stock))) {
      return res.status(400).json({ message: "Valid stock value is required" });
    }

    const numStock = Number(stock);

    if (numStock < 0) {
      return res.status(400).json({ message: "Stock cannot be negative" });
    }

    if (!Number.isInteger(numStock)) {
      return res.status(400).json({ message: "Stock must be a whole integer" });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Ownership check
    if (!product.vendor || product.vendor.toString() !== req.vendor._id.toString()) {
      return res.status(403).json({ message: "Forbidden: You do not own this product" });
    }

    product.stock = numStock;
    await product.save();

    res.status(200).json({
      message: "Stock updated successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      message: "Stock update failed",
      error: error.message,
    });
  }
};
