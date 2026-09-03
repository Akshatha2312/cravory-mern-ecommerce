/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react-hooks/set-state-in-effect */
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { AuthContext } from "./AuthContext";
import {
  getWishlist,
  removeFromWishlist as removeApi,
  toggleWishlist as toggleApi,
} from "../api/wishlistApi";

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [wishlistProductIds, setWishlistProductIds] = useState(new Set());

  const fetchWishlist = useCallback(async () => {
    if (!user) {
      setWishlistItems([]);
      setWishlistProductIds(new Set());
      return;
    }

    try {
      const data = await getWishlist();
      const prods = data.products || [];
      setWishlistItems(prods);

      const ids = new Set(prods.map((p) => (typeof p === "object" ? p._id : p)));
      setWishlistProductIds(ids);
    } catch (err) {
      console.error("Failed to load wishlist:", err);
    }
  }, [user]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const isWishlisted = (productId) => {
    if (!productId) return false;
    return wishlistProductIds.has(productId.toString());
  };

  const toggleWishlistHandler = async (productId) => {
    if (!user) {
      return { requireAuth: true };
    }

    try {
      const res = await toggleApi(productId);
      const newIds = new Set(res.productIds.map((id) => id.toString()));
      setWishlistProductIds(newIds);
      await fetchWishlist();
      return { success: true, isWishlisted: res.isWishlisted, message: res.message };
    } catch (err) {
      console.error(err);
      return { success: false, message: err.response?.data?.message || "Wishlist action failed" };
    }
  };

  const removeFromWishlistHandler = async (productId) => {
    if (!user) return;

    try {
      const data = await removeApi(productId);
      const prods = data.wishlist?.products || [];
      setWishlistItems(prods);
      const ids = new Set(prods.map((p) => (typeof p === "object" ? p._id : p)));
      setWishlistProductIds(ids);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        wishlistCount: wishlistItems.length,
        isWishlisted,
        toggleWishlistHandler,
        removeFromWishlistHandler,
        refreshWishlist: fetchWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};
