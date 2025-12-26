import { useEffect, useState } from "react";
import { getReconciliation } from "../../api/transaction.api";

export default function Reconciliation() {
    const [data, setData] = useState(null);

    useEffect(() => {
        load();
    }, []);

    const load = async () => {
        const res = await getReconciliation();
        setData(res.data);
    };

    if (!data) return null;

    return (
        <div className="p-6">
            <h2 className="text-xl font-bold">Reconciliation Report</h2>

            <p>Total Paid: ₹{data.totalPaid}</p>
            <p>Total Refunded: ₹{data.totalRefunded}</p>
            <p>Net Amount: ₹{data.netAmount}</p>

            <hr className="my-3" />

            <p>Offline Cash: ₹{data.cash}</p>
            <p>Online Payments: ₹{data.online}</p>
        </div>
    );
}
