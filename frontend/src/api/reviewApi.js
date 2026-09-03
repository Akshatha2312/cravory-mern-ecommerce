import API from "./axios";

export const createReview = async (reviewData) => {
  const { data } = await API.post("/reviews", reviewData);
  return data;
};

export const getProductReviews = async (productId) => {
  const { data } = await API.get(`/reviews/product/${productId}`);
  return data;
};

export const getEligibleReviewProducts = async () => {
  const { data } = await API.get("/reviews/eligible-products");
  return data;
};

export const deleteReview = async (id) => {
  const { data } = await API.delete(`/reviews/${id}`);
  return data;
};
