import { useLocation } from "react-router-dom";
import { createTransaction, uploadOfflineProof } from "../../api/payment.api";
import { useState } from "react";

export default function OfflinePayment() {
  const { state } = useLocation();
  const [method, setMethod] = useState("CASH");
  const [proof, setProof] = useState(null);

  const submit = async () => {
    const tx = await createTransaction({
      bookingId: state._id,
      amount: state.amount,
      mode: method,
      status: "PENDING"
    });

    if (proof) {
      const formData = new FormData();
      formData.append("proof", proof);
      await uploadOfflineProof(tx.data._id, formData);
    }

    alert("Payment submitted for verification");
  };

  return (
    <div className="p-6 max-w-md">
      <h2 className="text-xl font-bold">Offline Payment</h2>

      <select onChange={e => setMethod(e.target.value)} className="input mt-2">
        <option>CASH</option>
        <option>UPI</option>
        <option>BANK_TRANSFER</option>
      </select>

      <input
        type="file"
        onChange={e => setProof(e.target.files[0])}
        className="mt-4"
      />

      <button onClick={submit} className="btn-primary mt-4 w-full">
        Submit Payment
      </button>
    </div>
  );
}
