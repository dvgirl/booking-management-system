import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getProcessById } from "../../api/process.api";
import { 
  FiArrowLeft, FiEdit3, FiPackage, FiZap, 
  FiUser, FiHash, FiClock, FiActivity 
} from "react-icons/fi";

export default function ProcessDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, [id]);

  const load = async () => {
    try {
      setLoading(true);
      const res = await getProcessById(id);
      setData(res.data);
    } catch (error) {
      console.error("Error loading process:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] gap-4">
      <div className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Loading Specifications</p>
    </div>
  );

  if (!data?.process) return (
    <div className="min-h-screen flex items-center justify-center p-10 text-center">
      <div>
        <FiActivity className="mx-auto text-slate-200 mb-4" size={48} />
        <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">Process not found</p>
        <button onClick={() => navigate("/process/list")} className="mt-6 flex items-center gap-2 mx-auto px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-indigo-600">
          <FiArrowLeft /> Return to List
        </button>
      </div>
    </div>
  );

  const { process, logs } = data;

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-12 animate-in fade-in duration-500">
      <div className="max-w-6xl mx-auto">
        
        {/* TOP ACTION BAR */}
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <button 
              onClick={() => navigate("/process/list")}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors group"
            >
              <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" /> 
              Task Registry
            </button>
            <div className="flex items-center gap-4">
              <h1 className="text-4xl font-black tracking-tight text-slate-900">
                {process.title}
              </h1>
              <span className={`text-[9px] px-3 py-1 rounded-lg uppercase font-black tracking-widest border ${
                process.priority === 'HIGH' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-slate-100 text-slate-500 border-slate-200'
              }`}>
                {process.priority} Priority
              </span>
            </div>
          </div>
          
          <button 
            onClick={() => navigate(`/process/${id}/update`)}
            className="flex items-center justify-center gap-3 px-10 py-4 bg-slate-900 text-white rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 active:scale-95"
          >
            <FiEdit3 size={16} />
            Modify Status
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* CORE SPECIFICATIONS */}
          <div className="lg:col-span-7 space-y-8">
            <div className="bg-white rounded-[3rem] p-8 lg:p-12 border border-slate-100 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5 text-slate-900">
                <FiPackage size={120} />
              </div>

              <h3 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500 mb-10">
                <FiZap /> System Parameters
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-10 mb-12">
                <DataField label="Current Status" value={process.status} icon={<div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />} />
                <DataField label="Process Category" value={process.processType} />
                <DataField label="Execution Mode" value={process.isOffline ? 'OFFLINE' : 'ONLINE'} />
              </div>

              <div className="space-y-10">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Task Brief</label>
                  <p className="text-slate-600 leading-relaxed font-medium bg-slate-50 p-8 rounded-[2rem] border border-slate-100 text-sm">
                    {process.description || "No specific instructions provided for this process."}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10 border-t border-slate-50">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <FiUser size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Assigned Officer</p>
                      <p className="text-sm font-black text-slate-800">{process.assignedTo?.phone || "Unassigned"}</p>
                    </div>
                  </div>
                  
                  {process.bookingId && (
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                        <FiHash size={24} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Booking Link</p>
                        <p className="text-sm font-mono font-bold text-indigo-600 uppercase">#{process.bookingId.slice(-8)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* CHRONOLOGICAL LOGS */}
          <div className="lg:col-span-5">
            <h3 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-10 ml-4">
              <FiClock /> Audit Trail
            </h3>
            
            <div className="relative ml-6">
              {/* Timeline Connector */}
              <div className="absolute left-[-2px] top-4 bottom-4 w-[4px] bg-slate-100 rounded-full"></div>

              <div className="space-y-12">
                {logs?.map((log, index) => (
                  <div key={log._id} className="relative flex gap-8 group">
                    {/* Node */}
                    <div className={`z-10 h-10 w-10 shrink-0 rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${
                      index === 0 ? 'bg-slate-900 text-white shadow-slate-200' : 'bg-white text-slate-400 border border-slate-100'
                    }`}>
                      <span className="text-[11px] font-black uppercase">{log.action[0]}</span>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-[11px] font-black text-slate-900 uppercase tracking-widest">
                          {log.action.replace('_', ' ')}
                        </p>
                        <p className="text-[9px] text-slate-300 font-mono">{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                      
                      <p className="text-[10px] text-slate-500 font-medium italic">
                        By {log.performedBy?.phone || 'System Automated'}
                      </p>

                      {log.newStatus && (
                        <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-indigo-100">
                          <FiActivity size={10} /> Transition → {log.newStatus}
                        </div>
                      )}
                      
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-3 border-l-2 border-slate-100 pl-3">
                        {new Date(log.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function DataField({ label, value, icon }) {
  return (
    <div className="space-y-1">
      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-[0.1em]">{label}</label>
      <div className="flex items-center gap-2">
        {icon}
        <span className="font-black text-slate-800 text-sm tracking-tight">{value}</span>
      </div>
    </div>
  );
}