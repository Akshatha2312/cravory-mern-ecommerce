import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    stock: {
      type: Number,
      default: 0,
    },
    images: [
      {
<<<<<<< HEAD
        url: { type: String, required: true },
        public_id: { type: String },
=======
        type: String,
>>>>>>> f34295960f993f444ddcf4ba140c8f4aa114671d
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
<<<<<<< HEAD
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      default: null,
    },
    rating: {
      type: Number,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
=======
>>>>>>> f34295960f993f444ddcf4ba140c8f4aa114671d
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
