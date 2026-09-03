import API from "./axios";

export const getMyProducts = async () => {
  const { data } = await API.get("/products/vendor/my-products");
  return data;
};

export const createVendorProduct = async (productData) => {
  const { data } = await API.post("/products/vendor", productData);
  return data;
};

export const updateVendorProduct = async (id, productData) => {
  const { data } = await API.put(`/products/vendor/${id}`, productData);
  return data;
};

export const deleteVendorProduct = async (id) => {
  const { data } = await API.delete(`/products/vendor/${id}`);
  return data;
};

export const toggleVendorProductStatus = async (id, isAvailable) => {
  const { data } = await API.patch(`/products/vendor/${id}/status`, { isAvailable });
  return data;
};

export const updateVendorProductStock = async (id, stock) => {
  const { data } = await API.patch(`/products/vendor/${id}/stock`, { stock });
  return data;
};

export const uploadVendorProductImage = async (id, formData) => {
  const { data } = await API.post(`/products/vendor/${id}/upload`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};
