import { saveDraft } from "../../offline/offline.service";
import { v4 as uuid } from "uuid";

export default function OfflinePayment() {
    const save = async () => {
        await saveDraft("offlinePayments", {
            id: uuid(),
            amount: 2000,
            method: "CASH",
            status: "UNVERIFIED"
        });

        alert("Offline payment saved");
    };

    return (
        <div className="p-6">
            <h2 className="text-xl font-bold">Offline Payment</h2>
            <button onClick={save} className="btn-primary mt-4">
                Save Payment
            </button>
        </div>
    );
}
