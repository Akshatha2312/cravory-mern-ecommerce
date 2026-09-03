import express from "express";
import {
  createRazorpayOrder,
  verifyPayment,
<<<<<<< HEAD
  handlePaymentFailure,
  handleRazorpayWebhook,
=======
>>>>>>> f34295960f993f444ddcf4ba140c8f4aa114671d
} from "../controllers/paymentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create-order", protect, createRazorpayOrder);
router.post("/verify", protect, verifyPayment);
<<<<<<< HEAD
router.post("/failed", protect, handlePaymentFailure);
router.post("/webhook", handleRazorpayWebhook);
=======
>>>>>>> f34295960f993f444ddcf4ba140c8f4aa114671d

export default router;
