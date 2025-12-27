import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { updateProcess } from "../../api/process.api";
import { toast } from "react-toastify";
import { 
  FiCircle, FiUserPlus, FiZap, FiCheckCircle, 
  FiLock, FiMessageSquare, FiChevronLeft, FiSend 
} from "react-icons/fi";

export default function ProcessUpdate() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [status, setStatus] = useState("IN_PROGRESS");
  const [note, setNote] = useState(""); 
  const [loading, setLoading] = useState(false);

  const statusOptions = [
    { value: "OPEN", label: "Open", desc: "Awaiting initial action", icon: <FiCircle />, color: "text-slate-400" },
    { value: "ASSIGNED", label: "Assigned", desc: "Task handed to staff", icon: <FiUserPlus />, color: "text-indigo-500" },
    { value: "IN_PROGRESS", label: "In Progress", desc: "Work is currently underway", icon: <FiZap />, color: "text-amber-500" },
    { value: "RESOLVED", label: "Resolved", desc: "Issue fixed, pending review", icon: <FiCheckCircle />, color: "text-emerald-500" },
    { value: "CLOSED", label: "Closed", desc: "Task finalized and locked", icon: <FiLock />, color: "text-slate-900" },
  ];

  const handleUpdate = async () => {
    try {
      setLoading(true);
      await updateProcess(id, { status, note }); 
      toast.success(`Status updated to ${status}`);
      navigate(`/process/${id}`);
    } catch (err) {
      toast.error("Failed to update status. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-12 animate-in fade-in duration-500">
      <div className="max-w-xl mx-auto">
        
        {/* Header Section */}
        <header className="mb-10 space-y-2">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-indigo-600 transition-colors"
          >
            <FiChevronLeft /> Cancel Update
          </button>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">Stage Transition</h1>
          <p className="text-slate-500 font-medium text-sm">Select the new operational phase for this process.</p>
        </header>

        {/* Selection Cards */}
        <div className="grid grid-cols-1 gap-3 mb-10">
          {statusOptions.map((opt) => {
            const isActive = status === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setStatus(opt.value)}
                className={`group flex items-center p-5 rounded-[2rem] border-2 transition-all duration-300 ${
                  isActive 
                  ? "border-slate-900 bg-white shadow-xl shadow-slate-200 translate-x-2" 
                  : "border-transparent bg-slate-100/50 text-slate-400 hover:bg-white hover:border-slate-200"
                }`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl mr-5 transition-colors ${
                  isActive ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600"
                }`}>
                  {opt.icon}
                </div>
                
                <div className="flex-1 text-left">
                  <p className={`font-black uppercase text-[11px] tracking-[0.15em] mb-0.5 ${
                    isActive ? 'text-slate-900' : 'text-slate-500'
                  }`}>
                    {opt.label}
                  </p>
                  <p className="text-[10px] font-bold opacity-60 uppercase tracking-tight italic">{opt.desc}</p>
                </div>

                {isActive && (
                  <div className="h-6 w-6 rounded-full bg-slate-900 flex items-center justify-center animate-in zoom-in duration-300">
                    <div className="h-1.5 w-1.5 rounded-full bg-white"></div>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Note / Log Field */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm mb-10">
            <div className="flex items-center gap-2 mb-4">
              <FiMessageSquare className="text-slate-400" />
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block">
                Activity Log Entry
              </label>
            </div>
            <textarea 
                placeholder="Briefly describe what changed or why the status is moving..."
                className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl p-5 text-sm font-medium focus:border-indigo-500 focus:bg-white focus:outline-none transition-all resize-none"
                rows="4"
                value={note}
                onChange={(e) => setNote(e.target.value)}
            />
        </div>

        {/* Final Execution Button */}
        <button 
            onClick={handleUpdate}
            disabled={loading}
            className="group w-full bg-slate-900 hover:bg-indigo-600 text-white py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] transition-all shadow-2xl shadow-indigo-200 disabled:opacity-50 active:scale-95 flex items-center justify-center gap-3"
        >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <FiSend className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                Commit Transition
              </>
            )}
        </button>
      </div>
    </div>
  );
}