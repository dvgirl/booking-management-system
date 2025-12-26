import { useEffect, useState } from "react";
import { getProcesses } from "../../api/process.api";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function ProcessList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const status = searchParams.get("status");

  useEffect(() => {
    load();
  }, [status]);

  const load = async () => {
    try {
      setLoading(true);
      const res = await getProcesses(status);
      setItems(res.data || []);
    } catch (error) {
      console.error("Error loading processes:", error);
    } finally {
      setLoading(false);
    }
  };

  // Helper to color code statuses
  const getStatusStyle = (status) => {
    const s = status?.toLowerCase();
    if (s === "completed" || s === "done") return "bg-green-100 text-green-700 border-green-200";
    if (s === "in_progress") return "bg-blue-100 text-blue-700 border-blue-200";
    if (s === "pending") return "bg-yellow-100 text-yellow-700 border-yellow-200";
    return "bg-gray-100 text-gray-700 border-gray-200";
  };

  return (
    <div className="p-8 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Task Management
          </h1>
          <p className="text-gray-500 mt-1">
            {status ? `Showing tasks filtered by ${status.replace("_", " ")}` : "View and manage all active processes."}
          </p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border text-sm font-medium text-gray-600">
          Total: {items.length}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-500 font-medium">Fetching your tasks...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl py-20 text-center">
          <div className="text-gray-400 text-5xl mb-4">📋</div>
          <p className="text-gray-500 text-lg">No tasks found for this category.</p>
        </div>
      ) : (
        <div className="bg-white shadow-xl shadow-gray-200/50 rounded-2xl overflow-hidden border border-gray-100">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-400 text-xs uppercase tracking-widest font-bold">
                <th className="px-6 py-4">Process Details</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Priority</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items.map((p) => (
                <tr key={p._id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                      {p.title}
                    </div>
                    <div className="text-xs text-gray-400 mt-1 uppercase font-mono">ID: {p._id.slice(-6)}</div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyle(p.status)}`}>
                      {p.status?.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className={`text-sm font-medium ${p.priority === 'HIGH' ? 'text-red-500' : 'text-gray-600'}`}>
                      {p.priority}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button
                      onClick={() => navigate(`/process/${p._id}`)}
                      className="inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-600 transition-all active:scale-95"
                    >
                      View Details
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}