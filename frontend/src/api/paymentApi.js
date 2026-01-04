import axios from "./axios";

export const createRazorpayOrder = async (amount) => {
  const { data } = await axios.post("/payment/create-order", { amount });
  return data;
};

export const verifyPayment = async (payload) => {
  const { data } = await axios.post("/payment/verify", payload);
  return data;
};
