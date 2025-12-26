import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { useState } from "react";
import axios from "../../api/axios";
import { toast } from "react-toastify";

export default function CheckInUpload() {
    const { state: booking } = useLocation();
    const navigate = useNavigate();

    if (!booking) {
        return <Navigate to="/checkin/search" />;
    }

    const [loading, setLoading] = useState(false);

    const [self, setSelf] = useState({ name: "" });
    const [spouse, setSpouse] = useState({ name: "" });
    const [children, setChildren] = useState([]);

    const [selfFile, setSelfFile] = useState(null);
    const [spouseFile, setSpouseFile] = useState(null);
    const [childrenFiles, setChildrenFiles] = useState([]);

    const addChild = () => {
        setChildren([...children, { name: "" }]);
    };

    const submitKyc = async () => {
        if (!self.name || !selfFile) {
            toast.error("Self name and Aadhaar are required");
            return;
        }

        try {
            setLoading(true);

            const formData = new FormData();
            formData.append("self", JSON.stringify(self));
            formData.append("selfAadhaar", selfFile);

            if (spouse.name && spouseFile) {
                formData.append("spouse", JSON.stringify(spouse));
                formData.append("spouseAadhaar", spouseFile);
            }

            if (children.length > 0) {
                formData.append("children", JSON.stringify(children));
                childrenFiles.forEach(file =>
                    formData.append("childrenAadhaar", file)
                );
            }

            await axios.post("/kyc/submit", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            toast.success("KYC submitted successfully! Please wait for admin verification.");
            navigate("/checkin/details", { state: booking });

        } catch (error) {
            console.error(error);
            toast.error("KYC submission failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-3xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold">Guest KYC Verification</h2>

            {/* Booking Info */}
            <div className="border rounded p-4 bg-gray-50">
                <p><b>Guest Phone:</b> {booking.userId?.phone}</p>
                <p><b>Room:</b> {booking.roomId?.roomNumber}</p>
                <p><b>Check-In:</b> {new Date(booking.checkIn).toDateString()}</p>
            </div>

            {/* SELF */}
            <div className="border p-4 rounded">
                <h3 className="font-semibold mb-2">Self KYC</h3>

                <input
                    placeholder="Full Name"
                    className="input mb-2"
                    onChange={e => setSelf({ name: e.target.value })}
                />

                <input
                    type="file"
                    className="input"
                    onChange={e => setSelfFile(e.target.files[0])}
                />
            </div>

            {/* SPOUSE */}
            <div className="border p-4 rounded">
                <h3 className="font-semibold mb-2">Spouse KYC (Optional)</h3>

                <input
                    placeholder="Spouse Name"
                    className="input mb-2"
                    onChange={e => setSpouse({ name: e.target.value })}
                />

                <input
                    type="file"
                    className="input"
                    onChange={e => setSpouseFile(e.target.files[0])}
                />
            </div>

            {/* CHILDREN */}
            <div className="border p-4 rounded">
                <h3 className="font-semibold mb-2">Children KYC (Optional)</h3>

                {children.map((child, index) => (
                    <div key={index} className="mb-2">
                        <input
                            placeholder="Child Name"
                            className="input mb-1"
                            onChange={e => {
                                const updated = [...children];
                                updated[index].name = e.target.value;
                                setChildren(updated);
                            }}
                        />
                        <input
                            type="file"
                            className="input"
                            onChange={e => {
                                const files = [...childrenFiles];
                                files[index] = e.target.files[0];
                                setChildrenFiles(files);
                            }}
                        />
                    </div>
                ))}

                <button
                    onClick={addChild}
                    className="btn-secondary mt-2"
                >
                    + Add Child
                </button>
            </div>

            {/* SUBMIT */}
            <button
                onClick={submitKyc}
                disabled={loading}
                className="btn-primary w-full"
            >
                {loading ? "Submitting..." : "Submit KYC"}
            </button>
        </div>
    );
}
