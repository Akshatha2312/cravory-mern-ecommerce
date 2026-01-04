import Order from "../models/Order.js";

/**
 * @desc   Create new order
 * @route  POST /api/orders
 * @access Private
 */
export const createOrder = async (req, res) => {
  try {
    const { orderItems, totalPrice } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: "No order items" });
    }

    const order = await Order.create({
      user: req.user._id,
      orderItems,
      totalPrice,
      isPaid: false,
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: "Order creation failed" });
  }
};

/**
 * @desc   Get logged-in user orders
 * @route  GET /api/orders/my-orders
 * @access Private
 */
export const getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({
    createdAt: -1,
  });
  res.json(orders);
};

/**
 * @desc   Admin – get all orders
 * @route  GET /api/orders
 * @access Admin
 */
export const getAllOrders = async (req, res) => {
  const orders = await Order.find()
    .populate("user", "name email")
    .sort({ createdAt: -1 });

  res.json(orders);
};

/**
 * @desc   Admin – update order status
 * @route  PUT /api/orders/:id/deliver
 * @access Admin
 */
export const markOrderDelivered = async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  order.isDelivered = true;
  order.deliveredAt = Date.now();
  await order.save();

  res.json({ message: "Order delivered" });
};
