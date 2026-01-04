import API from "./axios";

export const getProducts = async () => {
  const { data } = await API.get("/api/products");
  return data;
};
