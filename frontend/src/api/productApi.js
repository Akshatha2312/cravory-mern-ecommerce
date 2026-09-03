import API from "./axios";

export const getProducts = async () => {
<<<<<<< HEAD
  const { data } = await API.get("/products");
  return data;
};

export const getProductById = async (id) => {
  const { data } = await API.get(`/products/${id}`);
  return data;
};

export const getProductsByVendorId = async (vendorId) => {
  const { data } = await API.get(`/products/public/vendor/${vendorId}`);
  return data;
};

export const addProduct = async (productData) => {
  const { data } = await API.post("/products/add-product", productData);
  return data;
};

export const updateProduct = async (id, productData) => {
  const { data } = await API.put(`/products/${id}`, productData);
  return data;
};

export const deleteProduct = async (id) => {
  const { data } = await API.delete(`/products/${id}`);
  return data;
};

export const uploadProductImage = async (id, formData) => {
  const { data } = await API.post(`/products/${id}/upload`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
=======
  const { data } = await API.get("/api/products");
>>>>>>> f34295960f993f444ddcf4ba140c8f4aa114671d
  return data;
};
