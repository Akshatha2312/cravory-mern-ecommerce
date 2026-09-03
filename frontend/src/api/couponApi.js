import API from "./axios";

export const applyCoupon = async (code, subtotal) => {
  const { data } = await API.post("/coupons/apply", { code, subtotal });
  return data;
};

export const getPublicCoupons = async () => {
  const { data } = await API.get("/coupons");
  return data;
};
