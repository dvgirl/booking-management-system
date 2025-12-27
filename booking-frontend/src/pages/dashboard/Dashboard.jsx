import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { getDashboardStats, getRecentActivity } from "../../api/report.api";
import {
    FiCheckCircle, FiLogOut, FiUserCheck, FiLayers,
    FiCalendar, FiTrendingUp, FiPlus, FiCreditCard,
    FiClipboard, FiArrowRight, FiActivity, FiRefreshCw, FiZap
} from "react-icons/fi";

export default function Dashboard() {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [statsRes, activityRes] = await Promise.all([
                getDashboardStats(),
                getRecentActivity(10)
            ]);
            setStats(statsRes.data);
            setActivities(activityRes.data || []);
        } catch (error) {
            console.error("Dashboard error:", error);
            setStats({ todaysCheckIns: 0, todaysCheckOuts: 0, pendingKyc: 0, openTasks: 0, activeBookings: 0, todaysRevenue: 0 });
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency', currency: 'INR', maximumFractionDigits: 0
        }).format(amount);
    };

    const statsData = stats ? [
        { title: "Check-ins", value: stats.todaysCheckIns, icon: <FiCheckCircle />, color: "text-emerald-600", bg: "bg-emerald-50", path: "/checkin/search" },
        { title: "Check-outs", value: stats.todaysCheckOuts, icon: <FiLogOut />, color: "text-blue-600", bg: "bg-blue-50", path: "/checkin/history" },
        { title: "Pending KYC", value: stats.pendingKyc, icon: <FiUserCheck />, color: "text-amber-600", bg: "bg-amber-50", path: "/admin/kyc?status=PENDING" },
        { title: "Open Tasks", value: stats.openTasks, icon: <FiLayers />, color: "text-purple-600", bg: "bg-purple-50", path: "/process/list" },
        { title: "Bookings", value: stats.activeBookings, icon: <FiCalendar />, color: "text-indigo-600", bg: "bg-indigo-50", path: "/bookings/calendar" },
        { title: "Revenue", value: formatCurrency(stats.todaysRevenue), icon: <FiTrendingUp />, color: "text-slate-900", bg: "bg-slate-100", path: "/finance/list" },
    ] : [];

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-3">
                <FiRefreshCw className="animate-spin text-indigo-500 w-8 h-8" />
                <span className="text-xs font-medium text-slate-400 animate-pulse uppercase tracking-widest">Synchronizing Workspace</span>
            </div>
        </div>
    );

    return (
        <div className="max-w-[1400px] mx-auto space-y-8 p-4 md:p-8 text-slate-900 antialiased font-sans">

            {/* MINIMALIST HEADER */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Operational Insight</span>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-800">
                        Overview <span className="text-slate-300 font-light mx-2">/</span>
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">{user?.name || "Partner"}</span>
                    </h1>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={loadData}
                        className="p-2.5 text-slate-400 hover:text-indigo-600 transition-all border border-slate-200 rounded-xl bg-white hover:shadow-sm"
                        title="Refresh Dashboard"
                    >
                        <FiRefreshCw size={18} className={loading ? "animate-spin" : ""} />
                    </button>
                    <button
                        onClick={() => navigate("/bookings/calendar")}
                        className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-indigo-600 transition-all shadow-md active:scale-95"
                    >
                        <FiPlus /> New Entry
                    </button>
                </div>
            </header>

            {/* HIGH-DENSITY STATS GRID */}
            <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                {statsData.map((stat, i) => (
                    <div
                        key={i}
                        onClick={() => navigate(stat.path)}
                        className="bg-white p-5 rounded-2xl border border-slate-200/60 hover:border-indigo-400/50 hover:shadow-xl hover:shadow-indigo-500/5 transition-all cursor-pointer group relative overflow-hidden"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                                {stat.icon}
                            </div>
                            <FiArrowRight className="text-slate-200 group-hover:text-indigo-400 transition-all translate-x-0 group-hover:translate-x-1" size={14} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.title}</p>
                            <p className="text-xl font-extrabold text-slate-800 mt-0.5 tracking-tight leading-none">{stat.value}</p>
                        </div>
                        {/* Decorative background element */}
                        <div className={`absolute -right-2 -bottom-2 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity ${stat.color}`}>
                            <div className="scale-[2.5]">{stat.icon}</div>
                        </div>
                    </div>
                ))}
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* ACTION CONSOLE */}
                <aside className="lg:col-span-4 space-y-5">
                    <div className="px-1">
                        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em]">Control Console</h3>
                    </div>
                    <div className="bg-white border border-slate-200/70 rounded-[2rem] overflow-hidden shadow-sm">
                        {[
                            { label: "Check-in Guest", icon: <FiZap />, path: "/checkin/search", color: "text-emerald-500", desc: "Start guest verification" },
                            { label: "Record Payment", icon: <FiCreditCard />, path: "/finance/pay", color: "text-blue-500", desc: "Process new transaction" },
                            { label: "Review Tasks", icon: <FiLayers />, path: "/process/list", color: "text-purple-500", desc: "Manage pending duties" },
                            { label: "System Logs", icon: <FiActivity />, path: "/reports/audit", color: "text-slate-400", desc: "Full history audit" },
                        ].map((action, i) => (
                            <button
                                key={i}
                                onClick={() => navigate(action.path)}
                                className="w-full p-5 flex items-center justify-between group hover:bg-slate-50 transition-all border-b border-slate-100 last:border-0"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center ${action.color} border border-slate-100 group-hover:bg-white group-hover:shadow-sm transition-all`}>
                                        {action.icon}
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[13px] font-bold text-slate-700">{action.label}</p>
                                        <p className="text-[10px] text-slate-400 font-medium">{action.desc}</p>
                                    </div>
                                </div>
                                <FiArrowRight size={14} className="text-slate-200 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                            </button>
                        ))}
                    </div>
                </aside>

                {/* FEED SECTION */}
                <main className="lg:col-span-8 space-y-5">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] flex items-center gap-2">
                            Recent Events
                            <span className="px-2 py-0.5 bg-rose-50 text-rose-500 text-[9px] rounded-md border border-rose-100 animate-pulse">Live</span>
                        </h3>
                        <button onClick={loadData} className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-wider transition-colors">Refresh Stream</button>
                    </div>

                    <div className="bg-white rounded-[2rem] border border-slate-200/70 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
                        {activities.length > 0 ? (
                            <div className="divide-y divide-slate-100">
                                {activities.slice(0, 6).map((activity, i) => (
                                    <div key={i} className="flex items-center gap-5 p-5 hover:bg-slate-50/50 transition-all group">
                                        <div className="relative">
                                            <div className="w-11 h-11 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:border-indigo-100 group-hover:bg-white transition-all">
                                                {activity.icon || <FiActivity size={16} />}
                                            </div>
                                            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-white rounded-full flex items-center justify-center border border-slate-100">
                                                <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2 mb-0.5">
                                                <p className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">{activity.title}</p>
                                                <span className="text-[10px] font-semibold text-slate-300 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">
                                                    {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <p className="text-[12px] text-slate-400 truncate leading-relaxed">{activity.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                                <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mb-4 border border-slate-100">
                                    <FiActivity className="text-slate-200 w-8 h-8" />
                                </div>
                                <p className="text-sm font-bold text-slate-800">Workspace is quiet</p>
                                <p className="text-xs text-slate-400 mt-1">New activity will be streamed here automatically.</p>
                            </div>
                        )}
                        <div className="mt-auto border-t border-slate-100">
                            <button
                                onClick={() => navigate("/finance/list")}
                                className="w-full py-4 bg-slate-50/50 text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] hover:text-indigo-600 hover:bg-slate-50 transition-all cursor-pointer"
                            >
                                View Detailed Audit Trail
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}