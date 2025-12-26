import { submitDailyReport } from "../../api/report.api";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function DailyReportSubmit({ report }) {
    const [remarks, setRemarks] = useState("");
    const navigate = useNavigate();

    const submit = async () => {
        await submitDailyReport({
            reportId: report._id,
            remarks
        });

        navigate("/reports");
    };

    return (
        <div className="mt-6">
            <textarea
                placeholder="Admin Remarks"
                className="input w-full"
                onChange={e => setRemarks(e.target.value)}
            />

            <button onClick={submit} className="btn-primary mt-4">
                Submit to Super Admin
            </button>
        </div>
    );
}