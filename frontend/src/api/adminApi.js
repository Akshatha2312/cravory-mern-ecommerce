import API from "./axios";

export const getAdminDashboard = async () => {
  const { data } = await API.get("/admin/dashboard");
  return data;
};

export const getAdminVendors = async () => {
  const { data } = await API.get("/admin/vendors");
  return data;
};

export const updateAdminVendorStatus = async (id, isApproved, isActive) => {
  const { data } = await API.patch(`/admin/vendors/${id}/status`, { isApproved, isActive });
  return data;
};

export const getAdminUsers = async () => {
  const { data } = await API.get("/admin/users");
  return data;
};

export const toggleAdminUserStatus = async (id, isActive) => {
  const { data } = await API.patch(`/admin/users/${id}/status`, { isActive });
  return data;
};

export const getAdminProducts = async (params = {}) => {
  const { data } = await API.get("/admin/products", { params });
  return data;
};

export const toggleAdminProductAvailability = async (id, isAvailable) => {
  const { data } = await API.patch(`/admin/products/${id}/availability`, { isAvailable });
  return data;
};

export const getAdminOrders = async () => {
  const { data } = await API.get("/admin/orders");
  return data;
};

export const getAdminAnalytics = async () => {
  const { data } = await API.get("/admin/analytics");
  return data;
};
