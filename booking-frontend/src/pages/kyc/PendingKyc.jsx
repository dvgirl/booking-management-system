import { useEffect, useState } from "react";
import axios from "../../api/axios";
import { toast } from "react-toastify";

export default function PendingKyc() {
  const [kycs, setKycs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await axios.get("/kyc/pending");
      setKycs(res.data);
    } catch (err) {
      toast.error("Failed to load KYC");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(`/kyc/status/${id}`, { status });
      toast.success(`KYC ${status.toLowerCase()}`);
      setKycs(prev => prev.filter(k => k._id !== id));
    } catch {
      toast.error("Action failed");
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Pending KYC</h2>

      {kycs.length === 0 && (
        <p className="text-gray-500">No pending KYC</p>
      )}

      {kycs.map(kyc => (
        <div key={kyc._id} className="border p-4 mb-4 rounded">
          <p><b>Name:</b> {kyc.fullName}</p>
          <p><b>Type:</b> {kyc.type}</p>
          <p><b>Phone:</b> {kyc.userId?.phone}</p>

          <img
            src={`${import.meta.env.VITE_API_BASE_URL}/uploads/kyc/${kyc.documentUrl}`}
            alt="Aadhaar"
            className="w-64 mt-3 border rounded"
          />

          <div className="flex gap-3 mt-4">
            <button
              className="btn-primary"
              onClick={() => updateStatus(kyc._id, "VERIFIED")}
            >
              Approve
            </button>

            <button
              className="btn-danger"
              onClick={() => updateStatus(kyc._id, "REJECTED")}
            >
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
