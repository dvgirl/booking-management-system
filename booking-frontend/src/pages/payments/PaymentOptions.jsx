import { useNavigate } from "react-router-dom";

export default function PaymentOptions({ booking }) {
    const navigate = useNavigate();

    return (
        <div className="p-6 max-w-md">
            <h2 className="text-xl font-bold">Select Payment Method</h2>

            <button
                onClick={() => navigate("/payment/online", { state: booking })}
                className="btn-primary mt-4 w-full"
            >
                Pay Online (UPI / Card)
            </button>

            <button
                onClick={() => navigate("/payment/offline", { state: booking })}
                className="btn-secondary mt-2 w-full"
            >
                Offline Payment (Cash / Bank / UPI)
            </button>
        </div>
    );
}
