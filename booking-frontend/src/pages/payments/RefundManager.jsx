import { refundPayment } from "../../api/payment.api";

export default function RefundManager({ transaction }) {
    const refund = async (mode) => {
        await refundPayment({
            transactionId: transaction._id,
            mode
        });
        alert("Refund Initiated");
    };

    return (
        <div>
            <button onClick={() => refund("ONLINE")} className="btn-primary">
                Refund Online
            </button>

            <button onClick={() => refund("OFFLINE")} className="btn-secondary ml-2">
                Refund Offline
            </button>
        </div>
    );
}
