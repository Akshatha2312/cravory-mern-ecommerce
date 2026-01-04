import { createRazorpayOrder, verifyPayment } from "../api/paymentApi";

function Cart() {
  const cartItems = JSON.parse(localStorage.getItem("cart")) || [];

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  const handlePayment = async () => {
    try {
      const { razorpayOrder } = await createRazorpayOrder(totalPrice);

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: "INR",
        name: "Cravory",
        description: "Order Payment",
        order_id: razorpayOrder.id,

        handler: async (response) => {
          await verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            orderId: razorpayOrder.id,
          });

          alert("Payment Successful 🎉");
          localStorage.removeItem("cart");
          window.location.href = "/order-success";
        },
      };

      const razor = new window.Razorpay(options);
      razor.open();
    } catch (error) {
      alert("Payment failed");
      console.error(error);
    }
  };

  return (
    <div>
      <h2>Cart</h2>
      <h3>Total: ₹{totalPrice}</h3>
      <button onClick={handlePayment}>Pay Now</button>
    </div>
  );
}

export default Cart;
