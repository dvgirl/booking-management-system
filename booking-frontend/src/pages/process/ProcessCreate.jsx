import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createProcess } from "../../api/process.api";
import { toast } from "react-toastify";

export default function ProcessCreate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    type: "CALL",
    mode: "OFFLINE",
    isOffline: true, // Matches your backend req.body.isOffline
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
      return toast.warn("Please fill in the required fields");
    }

    try {
      setLoading(true);
      await createProcess(form);
      toast.success("Task created successfully");
      navigate("/process/dashboard");
    } catch (err) {
      toast.error("Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 md:p-12 font-sans text-slate-900">
      <div className="max-w-2xl mx-auto">
        
        {/* Header */}
        <div className="mb-10">
          <button 
            onClick={() => navigate(-1)}
            className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 mb-2 block"
          >
            ← Cancel and Go Back
          </button>
          <h1 className="text-3xl font-black tracking-tight">Create New Task</h1>
          <p className="text-slate-500 font-medium">Assign a new process or facility request to the team.</p>
        </div>

        {/* Form Card */}
        <form onSubmit={submit} className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8 md:p-12 space-y-8">
          
          {/* Row 1: Type & Mode */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Process Type</label>
              <select 
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
              >
                <option value="CALL">📞 CALL</option>
                <option value="FACILITY">🏨 FACILITY</option>
                <option value="CANCELLATION">🚫 CANCELLATION</option>
                <option value="SUPPORT">🛠️ SUPPORT</option>
                <option value="OTHER">📁 OTHER</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Operation Mode</label>
              <select 
                name="mode"
                value={form.mode}
                onChange={handleChange}
                className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
              >
                <option value="OFFLINE">OFFLINE</option>
                <option value="ONLINE">ONLINE</option>
              </select>
            </div>
          </div>

          {/* Row 2: Title */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Task Title</label>
            <input
              name="title"
              placeholder="e.g., Room 102 AC Repair"
              className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 font-bold placeholder:text-slate-300 focus:ring-2 focus:ring-blue-500 transition-all"
              onChange={handleChange}
            />
          </div>

          {/* Row 3: Description */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Detailed Description</label>
            <textarea
              name="description"
              rows="4"
              placeholder="What needs to be done?"
              className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 font-medium placeholder:text-slate-300 focus:ring-2 focus:ring-blue-500 transition-all resize-none"
              onChange={handleChange}
            />
          </div>

          {/* Row 4: IDs and Assignment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Booking ID (Optional)</label>
              <input
                name="bookingId"
                placeholder="#882910"
                className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 font-mono font-bold placeholder:text-slate-300 focus:ring-2 focus:ring-blue-500 transition-all"
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Assign To (Staff ID)</label>
              <input
                name="assignedTo"
                placeholder="User ID or Name"
                className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 font-bold placeholder:text-slate-300 focus:ring-2 focus:ring-blue-500 transition-all"
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Row 5: Priority */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Priority Level</label>
            <div className="flex gap-4">
              {['LOW', 'MEDIUM', 'HIGH'].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setForm({ ...form, priority: p })}
                  className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all ${
                    form.priority === p 
                    ? (p === 'HIGH' ? 'bg-red-600 text-white' : p === 'MEDIUM' ? 'bg-orange-500 text-white' : 'bg-slate-900 text-white')
                    : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Action Button */}
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-blue-100 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? "Creating..." : "Save Process"}
          </button>
        </form>
      </div>
    </div>
  );
}