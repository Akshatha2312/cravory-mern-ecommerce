import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
<<<<<<< HEAD
      enum: ["user", "vendor", "admin"],
      default: "user",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
=======
      enum: ["user", "admin"],
      default: "user",
    },
>>>>>>> f34295960f993f444ddcf4ba140c8f4aa114671d
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
