import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { uploadDocuments, confirmCheckIn } from "../../api/checkin.api";

export default function DocumentUpload() {
    const { state } = useLocation();
    const navigate = useNavigate();
    const [docs, setDocs] = useState([]);

    const upload = async () => {
        const formData = new FormData();
        docs.forEach(d => formData.append("documents", d));

        await uploadDocuments(state._id, formData);
        await confirmCheckIn(state._id);

        navigate("/dashboard");
    };

    return (
        <div className="p-6 max-w-lg">
            <h2 className="text-xl font-bold">Upload ID Documents</h2>

            <input
                type="file"
                multiple
                onChange={e => setDocs([...e.target.files])}
                className="mt-4"
            />

            <button onClick={upload} className="btn-primary mt-4 w-full">
                Confirm Check-In
            </button>
        </div>
    );
}
