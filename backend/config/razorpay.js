import Razorpay from "razorpay";

let razorpayInstance = null;
let cachedKeyId = null;
let cachedKeySecret = null;

export const getRazorpayInstance = () => {
  const currentKeyId = process.env.RAZORPAY_KEY_ID;
  const currentKeySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!currentKeyId || !currentKeySecret) {
    console.error("❌ Razorpay keys missing — payment disabled");
    return null;
  }

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
  }

  return razorpayInstance;
};

export default getRazorpayInstance;
