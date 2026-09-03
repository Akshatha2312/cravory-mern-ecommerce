import API from "./axios";

export const createRazorpayOrder = async (orderId) => {
  const { data } = await API.post("/payment/create-order", { orderId });
  return data;
};

export const verifyPayment = async (payload) => {
  const { data } = await API.post("/payment/verify", payload);
  return data;
};

export const reportPaymentFailure = async (orderId, reason) => {
  const { data } = await API.post("/payment/failed", { orderId, reason });
  return data;
};
