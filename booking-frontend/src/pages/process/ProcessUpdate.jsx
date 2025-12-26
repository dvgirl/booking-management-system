import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { updateProcess } from "../../api/process.api";
import { toast } from "react-toastify";

export default function ProcessUpdate() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Matches your exact Enum values
  const [status, setStatus] = useState("IN_PROGRESS");
  const [note, setNote] = useState(""); // Optional: For the log description
  const [loading, setLoading] = useState(false);

  const statusOptions = [
    { value: "OPEN", label: "Open", desc: "Awaiting initial action", icon: "⭕" },
    { value: "ASSIGNED", label: "Assigned", desc: "Task handed to staff", icon: "👤" },
    { value: "IN_PROGRESS", label: "In Progress", desc: "Work is currently underway", icon: "⚡" },
    { value: "RESOLVED", label: "Resolved", desc: "Issue fixed, pending review", icon: "✔️" },
    { value: "CLOSED", label: "Closed", desc: "Task finalized and locked", icon: "🔒" },
  ];

  const update = async () => {
    try {
      setLoading(true);
      // Sending exact enum string to backend
      await updateProcess(id, { status, note }); 
      toast.success(`Status updated to ${status}`);
      navigate(`/process/${id}`);
    } catch (err) {
      toast.error("Failed to update status. Check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 md:p-12 font-sans text-slate-900">
      <div className="max-w-xl mx-auto">
        
        {/* Header */}
        <header className="mb-10">
          <button 
            onClick={() => navigate(-1)}
            className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 mb-2 transition-colors"
          >
            ← Cancel Update
          </button>
          <h1 className="text-3xl font-black tracking-tight">Change Status</h1>
          <p className="text-slate-500 font-medium text-sm">Update the workflow stage for this process.</p>
        </header>

        {/* Selection Grid */}
        <div className="grid grid-cols-1 gap-3 mb-8">
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatus(opt.value)}
              className={`flex items-center p-4 rounded-2xl border-2 transition-all ${
                status === opt.value 
                ? "border-blue-600 bg-white shadow-md" 
                : "border-transparent bg-slate-100/70 text-slate-400 hover:bg-slate-100"
              }`}
            >
              <span className="text-xl mr-4">{opt.icon}</span>
              <div className="flex-1 text-left">
                <p className={`font-black uppercase text-[11px] tracking-widest ${
                  status === opt.value ? 'text-blue-600' : 'text-slate-500'
                }`}>
                  {opt.label}
                </p>
                <p className="text-[10px] font-bold opacity-60 uppercase tracking-tighter">{opt.desc}</p>
              </div>
              {status === opt.value && (
                <div className="h-5 w-5 rounded-full bg-blue-600 flex items-center justify-center">
                  <div className="h-1.5 w-1.5 rounded-full bg-white"></div>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Optional Note Field */}
        <div className="mb-8">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 block mb-2">Update Note (Optional)</label>
            <textarea 
                placeholder="Brief description of the progress..."
                className="w-full bg-white border-2 border-slate-100 rounded-2xl p-4 text-sm font-medium focus:border-blue-500 focus:outline-none transition-all"
                rows="3"
                value={note}
                onChange={(e) => setNote(e.target.value)}
            />
        </div>

        {/* Action Button */}
        <button 
            onClick={update}
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-blue-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl disabled:opacity-50"
        >
            {loading ? "Processing..." : "Submit Status Change"}
        </button>
      </div>
    </div>
  );
}