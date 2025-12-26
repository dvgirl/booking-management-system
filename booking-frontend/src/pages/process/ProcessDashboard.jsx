// pages/process/ProcessDashboard.jsx
import { useEffect, useState } from "react";
import { getProcessStats } from "../../api/process.api";
import { useNavigate } from "react-router-dom";

export default function ProcessDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const res = await getProcessStats();
      setStats(res.data);
    } catch (error) {
      setStats({ open: 0, inProgress: 0, completed: 0, cancelled: 0 });
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: "Open", value: stats?.open || 0, status: "OPEN", color: "bg-gray-500", icon: "📋" },
    { label: "In Progress", value: stats?.inProgress || 0, status: "IN_PROGRESS", color: "bg-yellow-500", icon: "🔄" },
    { label: "Completed", value: stats?.completed || 0, status: "COMPLETED", color: "bg-green-500", icon: "✅" },
    { label: "Cancelled", value: stats?.cancelled || 0, status: "CANCELLED", color: "bg-red-500", icon: "❌" }
  ];

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading statistics...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Task Dashboard</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <div
            key={i}
            onClick={() => navigate(`/process/list?status=${card.status}`)} // 👈 IMPORTANT
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg cursor-pointer"
          >
            <div className="flex justify-between mb-2">
              <span className="text-3xl">{card.icon}</span>
              <div className={`w-3 h-3 rounded-full ${card.color}`}></div>
            </div>
            <h4 className="text-sm text-gray-600">{card.label}</h4>
            <p className="text-3xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
