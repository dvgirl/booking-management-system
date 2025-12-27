import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createProcess } from "../../api/process.api";
import { toast } from "react-toastify";
import { 
  FiChevronLeft, FiPlus, FiBriefcase, FiTag, 
  FiFileText, FiUser, FiFlag, FiDatabase 
} from "react-icons/fi";

export default function ProcessCreate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    type: "CALL",
    mode: "OFFLINE",
    isOffline: true,
    title: "",
    description: "",
    bookingId: "",
    assignedTo: "",
    priority: "MEDIUM"
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "mode") {
      setForm({ 
        ...form, 
        mode: value, 
        isOffline: value === "OFFLINE" 
      });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.assignedTo) {
      return toast.warn("Title and Assignment are required");
    }

    try {
      setLoading(true);
      await createProcess(form);
      toast.success("Operational task dispatched.");
      navigate("/process/list"); // Updated to point to your list view
    } catch (err) {
      toast.error("Process creation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-12 animate-in fade-in duration-500">
      <div className="max-w-3xl mx-auto">
        
        {/* TOP NAV & HEADER */}
        <header className="mb-12">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-indigo-600 transition-colors mb-4"
          >
            <FiChevronLeft /> Return to Dashboard
          </button>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
              <FiPlus size={24} />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tight text-slate-900">Initialize Process</h1>
              <p className="text-slate-500 font-medium text-sm mt-1">Deploy a new operational task to the field team.</p>
            </div>
          </div>
        </header>

        <form onSubmit={submit} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* TYPE SELECTION */}
            <div className="md:col-span-2 space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                <FiBriefcase /> Process Category
              </label>
              <select 
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full bg-white border border-slate-200 rounded-[1.5rem] px-6 py-4 font-bold text-slate-700 focus:ring-4 focus:ring-indigo-50/50 focus:border-indigo-500 outline-none transition-all cursor-pointer appearance-none shadow-sm"
              >
                <option value="CALL">📞 Voice Communication</option>
                <option value="FACILITY">🏨 Facility / Room Service</option>
                <option value="CANCELLATION">🚫 Reservation Void</option>
                <option value="SUPPORT">🛠️ Technical Support</option>
                <option value="OTHER">📁 Miscellaneous</option>
              </select>
            </div>

            {/* MODE SELECTION */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                <FiDatabase /> Environment
              </label>
              <select 
                name="mode"
                value={form.mode}
                onChange={handleChange}
                className="w-full bg-white border border-slate-200 rounded-[1.5rem] px-6 py-4 font-bold text-slate-700 focus:ring-4 focus:ring-indigo-50/50 focus:border-indigo-500 outline-none transition-all shadow-sm"
              >
                <option value="OFFLINE">OFFLINE</option>
                <option value="ONLINE">ONLINE</option>
              </select>
            </div>
          </div>

          {/* TITLE */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
              <FiTag /> Task Identifier
            </label>
            <input
              name="title"
              placeholder="Primary objective (e.g. Guest Check-in Assistance)"
              className="w-full bg-white border border-slate-200 rounded-[1.5rem] px-6 py-4 font-bold placeholder:text-slate-300 focus:ring-4 focus:ring-indigo-50/50 focus:border-indigo-500 outline-none transition-all shadow-sm"
              onChange={handleChange}
            />
          </div>

          {/* DESCRIPTION */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
              <FiFileText /> Detailed Briefing
            </label>
            <textarea
              name="description"
              rows="4"
              placeholder="Describe the operational requirements and expected outcomes..."
              className="w-full bg-white border border-slate-200 rounded-[2rem] px-6 py-5 font-medium placeholder:text-slate-300 focus:ring-4 focus:ring-indigo-50/50 focus:border-indigo-500 outline-none transition-all resize-none shadow-sm"
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* BOOKING REFERENCE */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                <FiDatabase /> Booking Link (Optional)
              </label>
              <input
                name="bookingId"
                placeholder="ID: 507f1f..."
                className="w-full bg-white border border-slate-200 rounded-[1.5rem] px-6 py-4 font-mono text-sm font-bold placeholder:text-slate-200 focus:ring-4 focus:ring-indigo-50/50 focus:border-indigo-500 outline-none transition-all shadow-sm"
                onChange={handleChange}
              />
            </div>

            {/* ASSIGNMENT */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                <FiUser /> Assigned Officer
              </label>
              <input
                name="assignedTo"
                placeholder="Staff Phone or System ID"
                className="w-full bg-white border border-slate-200 rounded-[1.5rem] px-6 py-4 font-bold placeholder:text-slate-300 focus:ring-4 focus:ring-indigo-50/50 focus:border-indigo-500 outline-none transition-all shadow-sm"
                onChange={handleChange}
              />
            </div>
          </div>

          {/* PRIORITY SELECTOR */}
          <div className="space-y-4 pt-4">
            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
              <FiFlag /> Priority Classification
            </label>
            <div className="flex flex-wrap md:flex-nowrap gap-3">
              {['LOW', 'MEDIUM', 'HIGH'].map((p) => {
                const isSelected = form.priority === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setForm({ ...form, priority: p })}
                    className={`flex-1 py-4 rounded-2xl text-[11px] font-black tracking-[0.2em] transition-all border-2 ${
                      isSelected 
                      ? (p === 'HIGH' ? 'bg-rose-600 border-rose-600 text-white shadow-lg shadow-rose-100' : p === 'MEDIUM' ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-200')
                      : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="pt-8">
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-indigo-600 text-white py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] transition-all shadow-2xl active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>Deploy Task & Registry Log</>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}