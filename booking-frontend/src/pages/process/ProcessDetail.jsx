import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getProcessById } from "../../api/process.api";

export default function ProcessDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null); // Holds { process, logs }
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
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-900"></div>
    </div>
  );

  if (!data?.process) return (
    <div className="p-10 text-center">
      <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">Process not found</p>
      <button onClick={() => navigate("/process/list")} className="mt-4 text-blue-600 font-black underline uppercase text-[10px]">Back to List</button>
    </div>
  );

  const { process, logs } = data;

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 md:p-12 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto">
        
        {/* Top Navigation */}
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <button 
              onClick={() => navigate("/process/list")}
              className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 mb-2 block transition-colors"
            >
              ← Back to All Tasks
            </button>
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
              {process.title}
              <span className={`text-[10px] px-3 py-1 rounded-full uppercase tracking-widest ${
                process.priority === 'HIGH' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'
              }`}>
                {process.priority}
              </span>
            </h1>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={() => navigate(`/process/${id}/update`)}
              className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg shadow-slate-200"
            >
              Update Status
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT: Main Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-100 shadow-sm">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-8">Task Specifications</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mb-10">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Status</label>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse"></span>
                    <span className="font-bold text-slate-700">{process.status}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Type</label>
                  <p className="font-bold text-slate-700">{process.processType}</p>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Mode</label>
                  <p className="font-bold text-slate-700">{process.isOffline ? 'OFFLINE' : 'ONLINE'}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Description</label>
                  <p className="text-slate-600 leading-relaxed font-medium bg-slate-50 p-6 rounded-2xl">
                    {process.description || "No description provided."}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-50">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Assigned Staff</label>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-black text-xs">
                        {process.assignedTo?.phone?.slice(-2)}
                      </div>
                      <div>
                        <p className="text-sm font-bold">{process.assignedTo?.phone}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase uppercase tracking-tighter">Verified Team Member</p>
                      </div>
                    </div>
                  </div>
                  {process.bookingId && (
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Reference Booking</label>
                      <p className="text-sm font-mono font-bold text-blue-600 bg-blue-50 px-3 py-2 rounded-lg inline-block">
                        #{process.bookingId}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Activity Log / Timeline */}
          <div className="lg:col-span-1">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4 mb-6 italic">History & Logs</h3>
            
            <div className="relative">
              {/* Vertical Line */}
              <div className="absolute left-6 top-0 bottom-0 w-px bg-slate-200"></div>

              <div className="space-y-8 relative">
                {logs?.map((log, index) => (
                  <div key={log._id} className="flex gap-6 items-start">
                    <div className={`z-10 h-12 w-12 rounded-2xl flex items-center justify-center shadow-sm border-4 border-[#f8fafc] ${
                      index === 0 ? 'bg-slate-900 text-white' : 'bg-white text-slate-400'
                    }`}>
                      <span className="text-[10px] font-black uppercase">{log.action[0]}</span>
                    </div>
                    
                    <div className="flex-1 pt-1">
                      <p className="text-[11px] font-black text-slate-900 uppercase tracking-wide">
                        {log.action.replace('_', ' ')}
                      </p>
                      <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                         By {log.performedBy?.phone || 'System'}
                      </p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter mt-2">
                        {new Date(log.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                      </p>
                      
                      {log.newStatus && (
                        <div className="mt-2 inline-block px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px] font-black uppercase tracking-widest">
                          → {log.newStatus}
                        </div>
                      )}
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