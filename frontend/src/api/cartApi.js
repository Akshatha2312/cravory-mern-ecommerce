import API from "./axios";

export const getCart = async () => {
  const { data } = await API.get("/cart");
  return data;
};

export const addToCart = async (productId, quantity = 1) => {
  const { data } = await API.post("/cart/add", { productId, quantity });
  return data;
};

export const updateCartQuantity = async (productId, quantity) => {
  const { data } = await API.put("/cart/update", { productId, quantity });
  return data;
};

export const removeFromCart = async (productId) => {
  const { data } = await API.delete(`/cart/remove/${productId}`);
  return data;
};

export const clearCart = async () => {
  const { data } = await API.delete("/cart/clear");
  return data;
};
