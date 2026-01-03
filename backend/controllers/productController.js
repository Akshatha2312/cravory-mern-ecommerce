import Product from "../models/Product.js";

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
      price,
      category,
      stock: stock || 0,
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
 * @desc   Get all products
 * @route  GET /api/products
 * @access Public
 */
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    res.status(200).json({
      count: products.length,
      products,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch products",
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
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
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
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    product.name = req.body.name ?? product.name;
    product.description = req.body.description ?? product.description;
    product.price = req.body.price ?? product.price;
    product.category = req.body.category ?? product.category;
    product.stock = req.body.stock ?? product.stock;

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
