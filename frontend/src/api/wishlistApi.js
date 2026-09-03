import API from "./axios";

export const getWishlist = async () => {
  const { data } = await API.get("/wishlist");
  return data;
};

export const addToWishlist = async (productId) => {
  const { data } = await API.post(`/wishlist/${productId}`);
  return data;
};

export const removeFromWishlist = async (productId) => {
  const { data } = await API.delete(`/wishlist/${productId}`);
  return data;
};

export const toggleWishlist = async (productId) => {
  const { data } = await API.post(`/wishlist/${productId}/toggle`);
  return data;
};
