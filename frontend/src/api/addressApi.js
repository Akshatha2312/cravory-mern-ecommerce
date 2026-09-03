import API from "./axios";

export const getAddresses = async () => {
  const { data } = await API.get("/addresses");
  return data;
};

export const createAddress = async (addressData) => {
  const { data } = await API.post("/addresses", addressData);
  return data;
};

export const updateAddress = async (id, addressData) => {
  const { data } = await API.put(`/addresses/${id}`, addressData);
  return data;
};

export const deleteAddress = async (id) => {
  const { data } = await API.delete(`/addresses/${id}`);
  return data;
};

export const setDefaultAddress = async (id) => {
  const { data } = await API.patch(`/addresses/${id}/default`);
  return data;
};
