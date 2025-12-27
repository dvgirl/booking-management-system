import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import { toast } from "react-toastify";
import { 
  FiShield, FiCheckCircle, FiXCircle, 
  FiClock, FiPhone, FiCreditCard, FiMaximize2 
} from "react-icons/fi";

const STATUSES = ["PENDING", "VERIFIED", "REJECTED", "ALL"];

export default function AdminKyc() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const defaultStatus = searchParams.get("status") || "PENDING";

  const [status, setStatus] = useState(defaultStatus);
  const [kycs, setKycs] = useState([]);
  const [loading, setLoading] = useState(false);
  
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
      toast.success(`Identity ${newStatus.toLowerCase()}`);
      setRejectingKyc(null);
      setRejectionNote("");
      fetchKyc();
    } catch (err) {
      toast.error("Update failed. Please check connection.");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER & FILTER BAR */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <FiShield className="text-indigo-600" />
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Compliance Terminal</p>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Verification Queue</h1>
        </div>
        
        <div className="flex bg-slate-200/50 p-1.5 rounded-2xl border border-slate-200 shadow-inner">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => {
                setStatus(s);
                navigate(`?status=${s}`);
              }}
              className={`px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                status === s
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* QUEUE LISTING */}
      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="py-40 flex flex-col items-center justify-center gap-4 text-slate-300">
            <div className="w-12 h-12 border-[3px] border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[10px] font-black uppercase tracking-widest">Loading Records...</p>
          </div>
        ) : kycs.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-[3rem] py-32 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
               <FiCheckCircle className="text-slate-200" size={32} />
            </div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Clear Workspace</p>
            <p className="text-slate-400 text-sm mt-1">No {status.toLowerCase()} applications found.</p>
          </div>
        ) : (
          kycs.map((kyc) => (
            <div key={kyc._id} className="group bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all flex flex-col lg:flex-row">
              
              {/* DOCUMENT BOX */}
              <div className="lg:w-80 bg-slate-50 relative overflow-hidden group/img border-r border-slate-100">
                <img
                  src={`${import.meta.env.VITE_API_BASE_URL}/${kyc.documentUrl?.replace(/\\/g, '/')}`}
                  alt="Identity Document"
                  className="w-full h-full object-cover aspect-video lg:aspect-auto"
                />
                <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 backdrop-blur-[2px]">
                   <a 
                    href={`${import.meta.env.VITE_API_BASE_URL}/${kyc.documentUrl?.replace(/\\/g, '/')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-4 bg-white rounded-full text-slate-900 hover:scale-110 transition-transform shadow-xl"
                  >
                    <FiMaximize2 size={20} />
                  </a>
                  <p className="text-white text-[10px] font-black uppercase tracking-widest">Open High-Res</p>
                </div>
              </div>

              {/* DATA PANEL */}
              <div className="p-8 lg:p-10 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <span className="inline-block text-[9px] font-black text-indigo-600 uppercase tracking-[0.2em] bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100 mb-3">
                      {kyc.type} OFFICIAL ID
                    </span>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">{kyc.fullName}</h3>
                  </div>
                  <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                    kyc.kycStatus === 'VERIFIED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                    kyc.kycStatus === 'REJECTED' ? 'bg-rose-50 text-rose-600 border-rose-100' : 
                    'bg-amber-50 text-amber-600 border-amber-100'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                      kyc.kycStatus === 'VERIFIED' ? 'bg-emerald-500' : kyc.kycStatus === 'REJECTED' ? 'bg-rose-500' : 'bg-amber-500'
                    }`}></span>
                    {kyc.kycStatus}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 py-6 border-y border-slate-50">
                  <div className="flex gap-3">
                    <div className="mt-1 text-slate-300"><FiPhone /></div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact</p>
                      <p className="text-sm font-bold text-slate-700 mt-0.5">{kyc.userId?.phone || "N/A"}</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="mt-1 text-slate-300"><FiCreditCard /></div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aadhaar (Last 4)</p>
                      <p className="text-sm font-bold text-slate-700 mt-0.5">•••• {kyc.aadhaarLast4 || "0000"}</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="mt-1 text-slate-300"><FiClock /></div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Submitted On</p>
                      <p className="text-sm font-bold text-slate-700 mt-0.5">
                        {new Date(kyc.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
                  {kyc.kycStatus === "PENDING" ? (
                    <div className="flex gap-3 w-full sm:w-auto">
                      <button
                        onClick={() => handleUpdateStatus(kyc._id, "VERIFIED")}
                        className="flex-1 sm:flex-none bg-indigo-600 hover:bg-slate-900 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-100 active:scale-95"
                      >
                        Approve Identity
                      </button>
                      <button
                        onClick={() => setRejectingKyc(kyc)}
                        className="flex-1 sm:flex-none bg-white border border-slate-200 text-rose-500 hover:bg-rose-50 hover:border-rose-200 px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                      >
                        Decline
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl w-full">
                       {kyc.kycStatus === "REJECTED" ? (
                         <>
                           <FiXCircle className="text-rose-500" />
                           <p className="text-xs text-slate-500 font-medium">
                             Reason: <span className="text-rose-600 font-black">{kyc.offlineNote || "Incomplete documentation"}</span>
                           </p>
                         </>
                       ) : (
                         <>
                           <FiCheckCircle className="text-emerald-500" />
                           <p className="text-xs text-slate-500 font-medium">
                             Verification finalized by admin on {new Date(kyc.updatedAt).toLocaleDateString()}
                           </p>
                         </>
                       )}
                    </div>
                  )}
                  <p className="text-[10px] font-mono text-slate-300 uppercase tracking-tighter">REF: {kyc._id}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* REJECTION MODAL */}
      {rejectingKyc && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-6">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full p-10 animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Rejection Grounds</h3>
            <p className="text-slate-500 text-sm mb-8">This note will be visible to <span className="text-slate-900 font-bold">{rejectingKyc.fullName}</span> to help them resubmit correctly.</p>
            
            <textarea
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all resize-none"
              rows="4"
              placeholder="e.g., Image is too blurry to read the Aadhaar number."
              value={rejectionNote}
              onChange={(e) => setRejectionNote(e.target.value)}
            />

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setRejectingKyc(null)}
                className="flex-1 px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all"
              >
                Cancel
              </button>
              <button
                disabled={!rejectionNote.trim()}
                onClick={() => handleUpdateStatus(rejectingKyc._id, "REJECTED", rejectionNote)}
                className="flex-[2] px-4 py-4 text-[10px] font-black uppercase tracking-widest bg-rose-500 text-white hover:bg-rose-600 rounded-2xl disabled:opacity-20 shadow-lg shadow-rose-500/20 transition-all active:scale-95"
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