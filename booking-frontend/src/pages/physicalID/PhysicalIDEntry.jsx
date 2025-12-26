import { useState } from "react";
import { addPhysicalID } from "../../api/physicalID.api";

export default function PhysicalIDEntry({ bookingId }) {
    const [form, setForm] = useState({
        idType: "AADHAAR",
        idNumber: "",
        verifiedBy: "",
        photoUrl: ""
    });

    const submit = async () => {
        await addPhysicalID({ ...form, bookingId });
        alert("Physical ID recorded successfully");
    };

    return (
        <div className="p-6 max-w-md">
            <h2 className="text-xl font-bold">Record Physical ID</h2>

            <select
                value={form.idType}
                onChange={e => setForm({ ...form, idType: e.target.value })}
                className="input mt-2 w-full"
            >
                <option>AADHAAR</option>
                <option>PASSPORT</option>
                <option>DL</option>
                <option>OTHER</option>
            </select>

            <input
                type="text"
                placeholder="ID Number"
                className="input mt-2 w-full"
                onChange={e => setForm({ ...form, idNumber: e.target.value })}
            />

            <input
                type="text"
                placeholder="Verified By"
                className="input mt-2 w-full"
                onChange={e => setForm({ ...form, verifiedBy: e.target.value })}
            />

            <input
                type="text"
                placeholder="Photo URL (optional)"
                className="input mt-2 w-full"
                onChange={e => setForm({ ...form, photoUrl: e.target.value })}
            />

            <button onClick={submit} className="btn-primary mt-4 w-full">
                Save
            </button>
        </div>
    );
}
