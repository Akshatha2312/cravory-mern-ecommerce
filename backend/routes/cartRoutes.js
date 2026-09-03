import express from "express";
import {
  addToCart,
  getCart,
<<<<<<< HEAD
  updateCartQuantity,
  removeFromCart,
  clearCart,
=======
  removeFromCart,
>>>>>>> f34295960f993f444ddcf4ba140c8f4aa114671d
} from "../controllers/cartController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

<<<<<<< HEAD
router.get("/", protect, getCart);
router.post("/", protect, addToCart);
router.post("/add", protect, addToCart);
router.put("/", protect, updateCartQuantity);
router.put("/update", protect, updateCartQuantity);
router.delete("/remove/:productId", protect, removeFromCart);
router.delete("/clear", protect, clearCart);
=======
router.post("/add", protect, addToCart);
router.get("/", protect, getCart);
router.delete("/remove/:productId", protect, removeFromCart);
>>>>>>> f34295960f993f444ddcf4ba140c8f4aa114671d

export default router;
