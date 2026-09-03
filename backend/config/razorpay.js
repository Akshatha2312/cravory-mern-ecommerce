import Razorpay from "razorpay";

let razorpayInstance = null;
<<<<<<< HEAD
let cachedKeyId = null;
let cachedKeySecret = null;

export const getRazorpayInstance = () => {
  const currentKeyId = process.env.RAZORPAY_KEY_ID;
  const currentKeySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!currentKeyId || !currentKeySecret) {
=======

export const getRazorpayInstance = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
>>>>>>> f34295960f993f444ddcf4ba140c8f4aa114671d
    console.error("❌ Razorpay keys missing — payment disabled");
    return null;
  }

<<<<<<< HEAD
  if (
    !razorpayInstance ||
    cachedKeyId !== currentKeyId ||
    cachedKeySecret !== currentKeySecret
  ) {
    razorpayInstance = new Razorpay({
      key_id: currentKeyId,
      key_secret: currentKeySecret,
    });
    cachedKeyId = currentKeyId;
    cachedKeySecret = currentKeySecret;

    console.log("✅ Razorpay instance initialized/updated with current credentials");
=======
  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    console.log("✅ Razorpay initialized successfully");
>>>>>>> f34295960f993f444ddcf4ba140c8f4aa114671d
  }

  return razorpayInstance;
};
<<<<<<< HEAD

export default getRazorpayInstance;
=======
>>>>>>> f34295960f993f444ddcf4ba140c8f4aa114671d
