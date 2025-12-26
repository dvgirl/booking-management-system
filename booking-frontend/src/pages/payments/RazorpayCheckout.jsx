import { useLocation } from "react-router-dom";
import { createRazorpayOrder, verifyRazorpay } from "../../api/payment.api";

export default function RazorpayCheckout() {
    const { state } = useLocation();

    const pay = async () => {
        const order = await createRazorpayOrder({
            bookingId: state._id,
            amount: state.amount
        });

        const options = {
            key: "RAZORPAY_KEY_ID",
            amount: order.data.amount,
            currency: "INR",
            order_id: order.data.id,
            handler: async (response) => {
                await verifyRazorpay({
                    ...response,
                    bookingId: state._id
                });
                alert("Payment Successful");
            }
        };

        new window.Razorpay(options).open();
    };

    return (
        <div className="p-6">
            <h2 className="text-xl font-bold">Online Payment</h2>
            <button onClick={pay} className="btn-primary mt-4">
                Pay ₹{state.amount}
            </button>
        </div>
    );
}
