import axios from "./axios";

export const getMyOrders = async () => {
  const { data } = await axios.get("/orders/my-orders");
  return data;
};
