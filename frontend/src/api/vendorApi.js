import API from "./axios";

export const getPublicVendors = async () => {
  const { data } = await API.get("/vendors");
  return data;
};

export const getPublicVendorById = async (vendorId) => {
  const { data } = await API.get(`/vendors/${vendorId}`);
  return data;
};

export const registerVendor = async (vendorData) => {
  const { data } = await API.post("/vendors/register", vendorData);
  return data;
};

export const getVendorStatus = async () => {
  const { data } = await API.get("/vendors/me/status");
  return data;
};

export const getVendorProfile = async () => {
  const { data } = await API.get("/vendors/me");
  return data;
};

export const getPendingVendors = async () => {
  const { data } = await API.get("/vendors/admin/pending");
  return data;
};

export const approveVendor = async (vendorId) => {
  const { data } = await API.patch(`/vendors/${vendorId}/approve`);
  return data;
};

export const updateVendorStatus = async (vendorId, isActive) => {
  const { data } = await API.patch(`/vendors/${vendorId}/status`, { isActive });
  return data;
};
