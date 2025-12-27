import { useEffect, useState } from "react";
import { getProcesses } from "../../api/process.api";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FiLayers, FiActivity, FiFilter, FiChevronRight, FiAlertCircle } from "react-icons/fi";

const FILTERS = [
  { label: "All Tasks", value: null },
  { label: "Assigned", value: "ASSIGNED" },
  { label: "In Progress", value: "IN_PROGRESS" },
  { label: "Resolved", value: "RESOLVED" },
];

export default function ProcessList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const currentStatus = searchParams.get("status");

  useEffect(() => {
    load();
  }, [currentStatus]);

  const load = async () => {
    try {
      setLoading(true);
      const res = await getProcesses(currentStatus);
      setItems(res.data || []);
    } catch (error) {
      console.error("Error loading processes:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    const s = status?.toLowerCase();
    if (s === "RESOLVED" || s === "done") return "bg-emerald-50 text-emerald-600 border-emerald-100";
    if (s === "IN_PROGRESS") return "bg-sky-50 text-sky-600 border-sky-100";
    if (s === "ASSIGNED") return "bg-amber-50 text-amber-600 border-amber-100";
    return "bg-slate-50 text-slate-600 border-slate-100";
  };

  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER & ANALYTICS */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <FiLayers className="text-indigo-600" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Operations</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Process Registry</h1>
        </div>

        <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
          {FILTERS.map((f) => (
            <button
              key={f.label}
              onClick={() => setSearchParams(f.value ? { status: f.value } : {})}
              className={`px-4 py-2 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all ${
                currentStatus === f.value || (!currentStatus && !f.value)
                  ? "bg-slate-900 text-white shadow-lg shadow-slate-200"
                  : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-40 flex flex-col items-center justify-center space-y-4">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing Registry...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-[3rem] py-32 text-center">
          <FiActivity className="mx-auto text-slate-200 mb-4" size={48} />
          <p className="text-slate-400 font-bold text-sm">No active processes found in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {/* TABLE HEADER (Hidden on Mobile) */}
          <div className="hidden lg:grid grid-cols-12 px-8 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <div className="col-span-5 text-left">Process Identification</div>
            <div className="col-span-2 text-center">Status</div>
            <div className="col-span-2 text-center">Priority</div>
            <div className="col-span-3 text-right">Operational Actions</div>
          </div>

          {/* LIST ITEMS */}
          {items.map((p) => (
            <div 
              key={p._id} 
              className="group bg-white border border-slate-200 p-6 lg:p-8 rounded-[2rem] hover:shadow-xl hover:shadow-indigo-500/5 hover:border-indigo-200 transition-all grid grid-cols-1 lg:grid-cols-12 items-center gap-6"
            >
              <div className="col-span-1 lg:col-span-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                    <FiActivity size={20} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 tracking-tight text-lg group-hover:text-indigo-600 transition-colors">
                      {p.title}
                    </h3>
                    <p className="text-[10px] font-mono text-slate-400 uppercase tracking-tighter mt-0.5">UUID: {p._id}</p>
                  </div>
                </div>
              </div>

              <div className="col-span-1 lg:col-span-2 flex justify-center">
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(p.status)}`}>
                  {p.status?.replace("_", " ")}
                </span>
              </div>

              <div className="col-span-1 lg:col-span-2 flex items-center justify-center gap-2">
                <span className={`w-2 h-2 rounded-full ${
                  p.priority === 'HIGH' ? 'bg-rose-500 animate-pulse' : 
                  p.priority === 'MEDIUM' ? 'bg-amber-400' : 'bg-slate-300'
                }`}></span>
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">{p.priority}</span>
              </div>

              <div className="col-span-1 lg:col-span-3 flex justify-end">
                <button
                  onClick={() => navigate(`/process/${p._id}`)}
                  className="w-full lg:w-auto inline-flex items-center justify-center gap-2 bg-slate-50 text-slate-900 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all active:scale-95"
                >
                  Analysis Details
                  <FiChevronRight />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}