import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getTransactionById } from "../../api/transaction.api";

export default function TransactionDetail() {
    const { id } = useParams();
    const [tx, setTx] = useState(null);

    useEffect(() => {
        load();
    }, []);

    const load = async () => {
        const res = await getTransactionById(id);
        setTx(res.data);
    };

    if (!tx) return null;

    return (
        <div className="p-6">
            <h2 className="text-xl font-bold">Transaction Details</h2>

            <p><b>Type:</b> {tx.type}</p>
            <p><b>Mode:</b> {tx.mode}</p>
            <p><b>Method:</b> {tx.method}</p>
            <p><b>Amount:</b> ₹{tx.amount}</p>
            <p><b>Status:</b> {tx.status}</p>
            <p><b>Reference:</b> {tx.referenceId}</p>
            <p><b>Created By:</b> {tx.createdBy}</p>
        </div>
    );
}
