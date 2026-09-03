import mongoose from "mongoose";

const orderSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderItems: [
      {
        name: String,
        qty: Number,
        price: Number,
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
<<<<<<< HEAD
        vendor: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Vendor",
          default: null,
        },
        status: {
          type: String,
          enum: [
            "pending",
            "confirmed",
            "preparing",
            "ready",
            "out_for_delivery",
            "delivered",
            "cancelled",
          ],
          default: "pending",
        },
      },
    ],
    subtotal: {
      type: Number,
      default: 0,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    coupon: {
      code: String,
      discountAmount: Number,
    },
=======
      },
    ],
>>>>>>> f34295960f993f444ddcf4ba140c8f4aa114671d
    totalPrice: {
      type: Number,
      required: true,
    },
<<<<<<< HEAD
    shippingAddress: {
      fullName: String,
      phone: String,
      addressLine1: String,
      addressLine2: String,
      city: String,
      state: String,
      pincode: String,
      landmark: String,
      label: String,
    },
    paymentMethod: String,
    razorpayOrderId: String,
    paymentResult: {
      razorpay_order_id: String,
      razorpay_payment_id: String,
      razorpay_signature: String,
    },
=======
    paymentMethod: String,
>>>>>>> f34295960f993f444ddcf4ba140c8f4aa114671d
    isPaid: {
      type: Boolean,
      default: false,
    },
    paidAt: Date,
    isDelivered: {
      type: Boolean,
      default: false,
    },
    deliveredAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
