import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import { toast } from "react-toastify";

const STATUSES = ["PENDING", "VERIFIED", "REJECTED", "ALL"];

export default function AdminKyc() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const defaultStatus = searchParams.get("status") || "PENDING";

  const [status, setStatus] = useState(defaultStatus);
  const [kycs, setKycs] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // States for Rejection Modal
  const [rejectingKyc, setRejectingKyc] = useState(null);
  const [rejectionNote, setRejectionNote] = useState("");

  useEffect(() => {
    fetchKyc();
  }, [status]);

  const fetchKyc = async () => {
    try {
      setLoading(true);
      const url = status === "ALL" ? "/kyc/all" : `/kyc/all?status=${status}`;
      const res = await axios.get(url);
      // Ensure we are setting an array
      setKycs(Array.isArray(res.data?.data) ? res.data.data : res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load KYC records");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (kycId, newStatus, note = "") => {
    try {
      await axios.patch(`/kyc/status/${kycId}`, { 
        status: newStatus,
        offlineNote: note 
      });
      toast.success(`KYC marked as ${newStatus}`);
      setRejectingKyc(null);
      setRejectionNote("");
      fetchKyc();
    } catch (err) {
      console.error(err);
      toast.error("Update failed");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-10">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Verification Queue</h2>
            <p className="text-slate-500 font-medium">Review identity documents and update user verification status.</p>
          </div>
          
          <div className="flex bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => {
                  setStatus(s);
                  navigate(`?status=${s}`);
                }}
                className={`px-5 py-2 text-sm font-bold rounded-lg transition-all ${
                  status === s
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* DATA TABLE / LIST */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center py-32">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
          ) : kycs.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl py-20 text-center">
              <p className="text-slate-400 text-lg font-medium">No {status.toLowerCase()} applications found</p>
            </div>
          ) : (
            kycs.map((kyc) => (
              <div key={kyc._id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:border-indigo-200 transition-all flex flex-col md:flex-row">
                
                {/* DOCUMENT PREVIEW */}
                <div className="md:w-64 bg-slate-100 relative group">
                  <img
                    src={`${import.meta.env.VITE_API_BASE_URL}/${kyc.documentUrl?.replace(/\\/g, '/')}`}
                    alt="Document"
                    className="w-full h-full object-cover aspect-[4/3] md:aspect-auto"
                  />
                  <a 
                    href={`${import.meta.env.VITE_API_BASE_URL}/${kyc.documentUrl?.replace(/\\/g, '/')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white font-bold text-sm"
                  >
                    View Original
                  </a>
                </div>

                {/* INFO PANEL */}
                <div className="p-6 flex-1 flex flex-col justify-between bg-white">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded">
                          {kyc.type}
                        </span>
                        <h3 className="text-xl font-bold text-slate-900 mt-1">{kyc.fullName}</h3>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        kyc.kycStatus === 'VERIFIED' ? 'bg-green-50 text-green-700 border-green-200' : 
                        kyc.kycStatus === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-200' : 
                        'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {kyc.kycStatus}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 py-4 border-y border-slate-50">
                      <div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">Phone Number</p>
                        <p className="text-sm font-semibold text-slate-700">{kyc.userId?.phone || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">Aadhaar Last 4</p>
                        <p className="text-sm font-semibold text-slate-700">XXXX-XXXX-{kyc.aadhaarLast4 || "0000"}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">Submission Time</p>
                        <p className="text-sm font-semibold text-slate-700">
                           {new Date(kyc.createdAt).toLocaleDateString()} at {new Date(kyc.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ADMIN CONTROLS */}
                  <div className="mt-6 flex flex-wrap gap-3">
                    {kyc.kycStatus === "PENDING" ? (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(kyc._id, "VERIFIED")}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 transition-all"
                        >
                          Approve Identity
                        </button>
                        <button
                          onClick={() => setRejectingKyc(kyc)}
                          className="bg-white border border-red-200 text-red-600 hover:bg-red-50 px-6 py-2 rounded-xl text-sm font-bold transition-all"
                        >
                          Reject with Reason
                        </button>
                      </>
                    ) : kyc.kycStatus === "REJECTED" ? (
                      <div className="text-sm text-slate-500 italic">
                        Rejected Reason: <span className="text-red-600 font-medium">{kyc.offlineNote || "No note provided"}</span>
                      </div>
                    ) : (
                      <div className="text-sm text-slate-500">
                        Verified by system on {new Date(kyc.updatedAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* REJECTION MODAL */}
      {rejectingKyc && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Rejection Reason</h3>
            <p className="text-slate-500 text-sm mb-4">Please explain why <span className="font-bold">{rejectingKyc.fullName}'s</span> document is being rejected.</p>
            
            <textarea
              className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              rows="4"
              placeholder="Example: The image is blurry or Aadhaar number doesn't match..."
              value={rejectionNote}
              onChange={(e) => setRejectionNote(e.target.value)}
            />

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setRejectingKyc(null)}
                className="flex-1 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                disabled={!rejectionNote.trim()}
                onClick={() => handleUpdateStatus(rejectingKyc._id, "REJECTED", rejectionNote)}
                className="flex-1 px-4 py-2 text-sm font-bold bg-red-600 text-white hover:bg-red-700 rounded-lg disabled:opacity-50 shadow-lg shadow-red-100 transition-all"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}