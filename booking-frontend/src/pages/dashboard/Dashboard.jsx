import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { getDashboardStats, getRecentActivity } from "../../api/report.api";
import { 
    FiCheckCircle, FiLogOut, FiUserCheck, FiLayers, 
    FiCalendar, FiTrendingUp, FiPlus, FiCreditCard, 
    FiClipboard, FiArrowRight, FiActivity 
} from "react-icons/fi";

export default function Dashboard() {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

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
            setStats({
                todaysCheckIns: 0, todaysCheckOuts: 0, pendingKyc: 0,
                openTasks: 0, activeBookings: 0, todaysRevenue: 0
            });
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
        { title: "Active Bookings", value: stats.activeBookings, icon: <FiCalendar />, color: "text-indigo-600", bg: "bg-indigo-50", path: "/bookings/calendar" },
        { title: "Revenue Today", value: formatCurrency(stats.todaysRevenue), icon: <FiTrendingUp />, color: "text-rose-600", bg: "bg-rose-50", path: "/finance/list" },
    ] : [];

    if (loading) return (
        <div className="animate-pulse space-y-8">
            <div className="h-32 bg-slate-200 rounded-[2rem]"></div>
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                {[...Array(6)].map((_, i) => <div key={i} className="h-24 bg-slate-100 rounded-2xl"></div>)}
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            {/* HERO WELCOME SECTION */}
            <div className="relative overflow-hidden bg-slate-900 rounded-[2.5rem] p-8 lg:p-12 text-white shadow-2xl">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <h1 className="text-3xl lg:text-4xl font-black tracking-tight">
                            Good Morning, {user?.name?.split(' ')[0] || "Partner"}
                        </h1>
                        <p className="text-slate-400 mt-2 font-medium">
                            Here is what's happening with your property today.
                        </p>
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => navigate("/bookings/calendar")} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-black uppercase tracking-widest transition-all">
                                View Calendar
                            </button>
                            <button onClick={loadData} className="px-5 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-black uppercase tracking-widest transition-all backdrop-blur-md">
                                Refresh
                            </button>
                        </div>
                    </div>
                    <div className="hidden lg:block">
                        <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-indigo-500/20 to-white/5 border border-white/10 flex items-center justify-center backdrop-blur-xl">
                            <FiActivity className="text-indigo-400 w-12 h-12 animate-pulse" />
                        </div>
                    </div>
                </div>
                {/* Decorative Blobs */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 rounded-full blur-[80px] -mr-32 -mt-32"></div>
            </div>

            {/* QUICK STATS - High density grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {statsData.map((stat, i) => (
                    <div 
                        key={i} 
                        onClick={() => navigate(stat.path)}
                        className="bg-white p-5 rounded-[1.5rem] border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all cursor-pointer group"
                    >
                        <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                            {stat.icon}
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.title}</p>
                        <p className="text-xl font-black text-slate-800 mt-1 truncate">{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* QUICK ACTIONS - Left Column */}
                <div className="lg:col-span-4 space-y-6">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <FiPlus className="text-indigo-600" /> Dispatch Center
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                        {[
                            { label: "New Booking", icon: <FiPlus />, path: "/bookings/calendar", color: "bg-blue-600" },
                            { label: "Check-in Guest", icon: <FiCheckCircle />, path: "/checkin/search", color: "bg-emerald-600" },
                            { label: "Record Payment", icon: <FiCreditCard />, path: "/finance/pay", color: "bg-indigo-600" },
                            { label: "Create Task", icon: <FiClipboard />, path: "/process/create", color: "bg-slate-900" },
                        ].map((action, i) => (
                            <button
                                key={i}
                                onClick={() => navigate(action.path)}
                                className="w-full p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between group hover:border-indigo-500 transition-all"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl ${action.color} text-white flex items-center justify-center shadow-lg shadow-indigo-100`}>
                                        {action.icon}
                                    </div>
                                    <span className="font-bold text-slate-700 text-sm">{action.label}</span>
                                </div>
                                <FiArrowRight className="text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* RECENT ACTIVITY - Right Column */}
                <div className="lg:col-span-8 space-y-6">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <FiActivity className="text-indigo-600" /> Live Activity Feed
                    </h3>
                    <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden">
                        {activities.length > 0 ? (
                            <div className="divide-y divide-slate-50">
                                {activities.map((activity, i) => (
                                    <div key={i} className="flex items-center gap-4 p-5 hover:bg-slate-50/50 transition-colors">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center text-xl">
                                            {activity.icon || "⚡"}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-slate-800">{activity.title}</p>
                                            <p className="text-xs text-slate-500 truncate">{activity.description}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-tighter">
                                                {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-20 text-center">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FiActivity className="text-slate-200 w-8 h-8" />
                                </div>
                                <p className="text-slate-400 font-medium">No activity recorded today.</p>
                            </div>
                        )}
                        <button className="w-full py-4 bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-widest hover:bg-slate-100 transition-colors">
                            View Full Audit Log
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}