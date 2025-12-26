    import { useNavigate } from "react-router-dom";

    export default function KycRejected() {
        const navigate = useNavigate();

        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="bg-white p-8 rounded-xl shadow-lg text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-2">KYC Rejected</h2>
                    <p className="text-gray-500 mb-4">
                        Your KYC was rejected. Please submit correct documents.
                    </p>
                    <button
                        onClick={() => navigate("/kyc")}
                        className="btn-primary"
                    >
                        Re-submit KYC
                    </button>
                </div>
            </div>
        );
    }
