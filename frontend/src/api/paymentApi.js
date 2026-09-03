<<<<<<< HEAD
import API from "./axios";

export const createRazorpayOrder = async (orderId) => {
  const { data } = await API.post("/payment/create-order", { orderId });
=======
import axios from "./axios";

export const createRazorpayOrder = async (amount) => {
  const { data } = await axios.post("/payment/create-order", { amount });
>>>>>>> f34295960f993f444ddcf4ba140c8f4aa114671d
  return data;
};

export const verifyPayment = async (payload) => {
<<<<<<< HEAD
  const { data } = await API.post("/payment/verify", payload);
  return data;
};

export const reportPaymentFailure = async (orderId, reason) => {
  const { data } = await API.post("/payment/failed", { orderId, reason });
=======
  const { data } = await axios.post("/payment/verify", payload);
>>>>>>> f34295960f993f444ddcf4ba140c8f4aa114671d
  return data;
};
