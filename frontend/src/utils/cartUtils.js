export const getCart = () => {
  return JSON.parse(localStorage.getItem("cart")) || [];
};

export const addToCart = (product) => {
  const cart = getCart();

  const existing = cart.find((item) => item._id === product._id);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
};

export const removeFromCart = (id) => {
  const cart = getCart().filter((item) => item._id !== id);
  localStorage.setItem("cart", JSON.stringify(cart));
};

export const updateQty = (id, qty) => {
  const cart = getCart().map((item) =>
    item._id === id ? { ...item, qty } : item
  );
  localStorage.setItem("cart", JSON.stringify(cart));
};

export const clearCart = () => {
  localStorage.removeItem("cart");
};
