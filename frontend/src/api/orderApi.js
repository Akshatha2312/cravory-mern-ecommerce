<<<<<<< HEAD
import API from "./axios";

export const createOrder = async (orderData) => {
  // Accepts either array of orderItems or object { orderItems, shippingAddress }
  const payload = Array.isArray(orderData)
    ? { orderItems: orderData }
    : orderData;

  const { data } = await API.post("/orders", payload);
  return data;
};

export const getMyOrders = async () => {
  const { data } = await API.get("/orders/my-orders");
  return data;
};

export const getOrderById = async (id) => {
  const { data } = await API.get(`/orders/${id}`);
  return data;
};

export const getAllOrders = async () => {
  const { data } = await API.get("/orders");
  return data;
};

export const markOrderDelivered = async (id) => {
  const { data } = await API.put(`/orders/${id}/deliver`);
  return data;
};

// Vendor Order APIs
export const getVendorOrders = async () => {
  const { data } = await API.get("/orders/vendor/my-orders");
  return data;
};

export const getVendorOrderById = async (id) => {
  const { data } = await API.get(`/orders/vendor/${id}`);
  return data;
};

export const updateVendorOrderStatus = async (id, status, itemId = null) => {
  const { data } = await API.patch(`/orders/vendor/${id}/status`, { status, itemId });
=======
import axios from "./axios";

export const getMyOrders = async () => {
  const { data } = await axios.get("/orders/my-orders");
>>>>>>> f34295960f993f444ddcf4ba140c8f4aa114671d
  return data;
};
