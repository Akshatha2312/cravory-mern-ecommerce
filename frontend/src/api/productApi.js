import API from "./axios";

// get all products
export const getAllProducts = () => API.get("/products");

// add product (admin)
export const addProduct = (data) =>
  API.post("/products/add-product", data);

// update product
export const updateProduct = (id, data) =>
  API.put(`/products/${id}`, data);

// delete product
export const deleteProduct = (id) =>
  API.delete(`/products/${id}`);
