import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
<<<<<<< HEAD
import mongoose from "mongoose";

/**
 * Helper to process, validate, group, and calculate authoritative cart data
 */
const formatMultiVendorCart = async (cartDoc) => {
  if (!cartDoc || !cartDoc.items || cartDoc.items.length === 0) {
    return {
      _id: cartDoc?._id || null,
      user: cartDoc?.user || null,
      items: [],
      groups: [],
      subtotal: 0,
      totalItems: 0,
      warnings: [],
    };
  }

  // Populate products and deep-populate vendor
  await cartDoc.populate({
    path: "items.product",
    populate: {
      path: "vendor",
      select: "_id bakeryName logo coverImage city state isApproved isActive",
    },
  });

  const warnings = [];
  const validItems = [];
  let cartNeedsSave = false;

  for (const item of cartDoc.items) {
    const p = item.product;

    // Handle deleted product
    if (!p) {
      cartNeedsSave = true;
      warnings.push("An item in your cart is no longer available and was removed.");
      continue;
    }

    // Check vendor active/approved status if vendor-owned
    if (p.vendor && typeof p.vendor === "object") {
      if (p.vendor.isApproved === false || p.vendor.isActive === false) {
        warnings.push(`'${p.name}' from '${p.vendor.bakeryName}' is currently unavailable (Bakery is inactive).`);
      }
    }

    // Check availability & stock mismatch
    if (p.isAvailable === false) {
      warnings.push(`'${p.name}' is currently marked unavailable.`);
    } else if (p.stock <= 0) {
      warnings.push(`'${p.name}' is currently out of stock.`);
    } else if (item.quantity > p.stock) {
      item.quantity = p.stock;
      cartNeedsSave = true;
      warnings.push(`Quantity for '${p.name}' was adjusted to ${p.stock} due to available stock limit.`);
    }

    validItems.push(item);
  }

  if (cartNeedsSave) {
    cartDoc.items = validItems;
    await cartDoc.save();
  }

  // Group items by vendor
  const groupsMap = new Map();
  let overallSubtotal = 0;
  let totalItemsCount = 0;

  for (const item of validItems) {
    const p = item.product;
    const qty = Number(item.quantity) || 1;
    const price = Number(p.price) || 0;
    const itemSubtotal = price * qty;

    overallSubtotal += itemSubtotal;
    totalItemsCount += qty;

    const vendorObj = p.vendor && typeof p.vendor === "object" ? p.vendor : null;
    const groupKey = vendorObj ? vendorObj._id.toString() : "cravory_legacy";

    if (!groupsMap.has(groupKey)) {
      if (vendorObj) {
        groupsMap.set(groupKey, {
          groupId: groupKey,
          vendor: {
            _id: vendorObj._id,
            bakeryName: vendorObj.bakeryName,
            logo: vendorObj.logo,
            coverImage: vendorObj.coverImage,
            city: vendorObj.city,
            state: vendorObj.state,
          },
          isLegacy: false,
          name: vendorObj.bakeryName,
          items: [],
          subtotal: 0,
        });
      } else {
        groupsMap.set(groupKey, {
          groupId: groupKey,
          vendor: null,
          isLegacy: true,
          name: "Cravory Products",
          items: [],
          subtotal: 0,
        });
      }
    }

    const group = groupsMap.get(groupKey);
    group.items.push({
      _id: item._id,
      product: p,
      quantity: qty,
      price: price, // Database authoritative price
      itemSubtotal: itemSubtotal,
    });
    group.subtotal += itemSubtotal;
  }

  const groups = Array.from(groupsMap.values());

  return {
    _id: cartDoc._id,
    user: cartDoc.user,
    items: validItems, // Flat items preserved for backwards compatibility
    groups,
    subtotal: overallSubtotal,
    totalItems: totalItemsCount,
    warnings,
  };
};

/**
 * @desc   Add item to cart
 * @route  POST /api/cart
 * @access Private
 */
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const qtyToAdd = Math.floor(Number(quantity)) || 1;

    if (qtyToAdd < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await Product.findById(productId).populate("vendor");

=======

// Add item to cart
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    const product = await Product.findById(productId);
>>>>>>> f34295960f993f444ddcf4ba140c8f4aa114671d
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

<<<<<<< HEAD
    // Check vendor status
    if (product.vendor && typeof product.vendor === "object") {
      if (product.vendor.isApproved === false || product.vendor.isActive === false) {
        return res.status(400).json({ message: "Cannot add product from an unapproved or inactive bakery" });
      }
    }

    if (product.isAvailable === false) {
      return res.status(400).json({ message: "This product is currently unavailable" });
    }

    if (product.stock <= 0) {
      return res.status(400).json({ message: "This product is out of stock" });
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      if (qtyToAdd > product.stock) {
        return res.status(400).json({ message: `Only ${product.stock} items available in stock` });
      }

      cart = await Cart.create({
        user: req.user._id,
        items: [{ product: productId, quantity: qtyToAdd }],
=======
    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [{ product: productId, quantity: quantity || 1 }],
>>>>>>> f34295960f993f444ddcf4ba140c8f4aa114671d
      });
    } else {
      const itemIndex = cart.items.findIndex(
        (item) => item.product.toString() === productId
      );

      if (itemIndex > -1) {
<<<<<<< HEAD
        const newQuantity = cart.items[itemIndex].quantity + qtyToAdd;
        if (newQuantity > product.stock) {
          return res.status(400).json({ message: `Only ${product.stock} items available in stock` });
        }
        cart.items[itemIndex].quantity = newQuantity;
      } else {
        if (qtyToAdd > product.stock) {
          return res.status(400).json({ message: `Only ${product.stock} items available in stock` });
        }
        cart.items.push({ product: productId, quantity: qtyToAdd });
=======
        cart.items[itemIndex].quantity += quantity || 1;
      } else {
        cart.items.push({ product: productId, quantity: quantity || 1 });
>>>>>>> f34295960f993f444ddcf4ba140c8f4aa114671d
      }

      await cart.save();
    }

<<<<<<< HEAD
    const formattedCart = await formatMultiVendorCart(cart);

    res.status(200).json({
      message: "Product added to cart",
      cart: formattedCart,
=======
    res.status(200).json({
      message: "Product added to cart",
      cart,
>>>>>>> f34295960f993f444ddcf4ba140c8f4aa114671d
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

<<<<<<< HEAD
/**
 * @desc   Get logged-in user's cart
 * @route  GET /api/cart
 * @access Private
 */
export const getCart = async (req, res) => {
  try {
    const cartDoc = await Cart.findOne({ user: req.user._id });

    if (!cartDoc) {
      return res.status(200).json({
        items: [],
        groups: [],
        subtotal: 0,
        totalItems: 0,
        warnings: [],
      });
    }

    const formattedCart = await formatMultiVendorCart(cartDoc);

    res.status(200).json(formattedCart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc   Update item quantity in cart
 * @route  PUT /api/cart
 * @access Private
 */
export const updateCartQuantity = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const newQty = Math.floor(Number(quantity));

    if (isNaN(newQty) || newQty < 1) {
      return res.status(400).json({ message: "Quantity must be a valid whole number of at least 1" });
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await Product.findById(productId).populate("vendor");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.vendor && typeof product.vendor === "object") {
      if (product.vendor.isApproved === false || product.vendor.isActive === false) {
        return res.status(400).json({ message: "Product bakery is currently inactive" });
      }
    }

    if (product.isAvailable === false) {
      return res.status(400).json({ message: "This product is currently unavailable" });
    }

    if (newQty > product.stock) {
      return res.status(400).json({ message: `Only ${product.stock} items available in stock` });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Product not in cart" });
    }

    cart.items[itemIndex].quantity = newQty;
    await cart.save();

    const formattedCart = await formatMultiVendorCart(cart);

    res.status(200).json({
      message: "Cart updated successfully",
      cart: formattedCart,
    });
=======
// Get logged-in user's cart
export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product"
    );

    if (!cart) {
      return res.status(200).json({ items: [] });
    }

    res.status(200).json(cart);
>>>>>>> f34295960f993f444ddcf4ba140c8f4aa114671d
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

<<<<<<< HEAD
/**
 * @desc   Remove item from cart
 * @route  DELETE /api/cart/:productId
 * @access Private
 */
=======
// Remove item from cart
>>>>>>> f34295960f993f444ddcf4ba140c8f4aa114671d
export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    await cart.save();

<<<<<<< HEAD
    const formattedCart = await formatMultiVendorCart(cart);

    res.status(200).json({
      message: "Item removed from cart",
      cart: formattedCart,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc   Clear entire cart
 * @route  DELETE /api/cart/clear
 * @access Private
 */
export const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }

    res.status(200).json({
      message: "Cart cleared",
      cart: {
        items: [],
        groups: [],
        subtotal: 0,
        totalItems: 0,
        warnings: [],
      },
=======
    res.status(200).json({
      message: "Item removed from cart",
      cart,
>>>>>>> f34295960f993f444ddcf4ba140c8f4aa114671d
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
