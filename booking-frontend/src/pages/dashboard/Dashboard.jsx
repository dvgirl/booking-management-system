import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { getDashboardStats, getRecentActivity } from "../../api/report.api";
import { toast } from "react-toastify";

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
            console.error("Error loading dashboard data:", error);
            // Set default values on error
            setStats({
                todaysCheckIns: 0,
                todaysCheckOuts: 0,
                pendingKyc: 0,
                openTasks: 0,
                activeBookings: 0,
                todaysRevenue: 0
            });
            setActivities([]);
            // Error toast is handled by axios interceptor
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const formatTimeAgo = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 60) {
            return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
        } else if (diffHours < 24) {
            return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
        } else {
            return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
        }
    };

    const statsData = stats ? [
        { title: "Today's Check-ins", value: stats.todaysCheckIns.toString(), icon: "✅", color: "bg-green-500", path: "/checkin/search" },
        { title: "Check-outs", value: stats.todaysCheckOuts.toString(), icon: "🚪", color: "bg-blue-500", path: "/checkin/history" },
        {
            title: "Pending KYC",
            value: stats.pendingKyc.toString(),
            icon: "🆔",
            color: "bg-yellow-500",
            path: "/admin/kyc?status=PENDING"
        },
        { title: "Open Tasks", value: stats.openTasks.toString(), icon: "🔁", color: "bg-purple-500", path: "/process/list" },
        { title: "Active Bookings", value: stats.activeBookings.toString(), icon: "🏨", color: "bg-indigo-500", path: "/bookings/calendar" },
        { title: "Revenue Today", value: formatCurrency(stats.todaysRevenue), icon: "💰", color: "bg-emerald-500", path: "/finance/list" },
    ] : [];

    const quickActions = [
        { label: "New Booking", icon: "➕", path: "/bookings/calendar", color: "bg-blue-600 hover:bg-blue-700" },
        { label: "Check-in Guest", icon: "✅", path: "/checkin/search", color: "bg-green-600 hover:bg-green-700" },
        { label: "Record Payment", icon: "💳", path: "/finance/pay", color: "bg-purple-600 hover:bg-purple-700" },
        { label: "Create Task", icon: "📋", path: "/process/create", color: "bg-orange-600 hover:bg-orange-700" },
    ];

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg p-6 text-white">
                    <h1 className="text-3xl font-bold mb-2">Loading Dashboard...</h1>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                            <div className="h-8 bg-gray-200 rounded mb-2"></div>
                            <div className="h-6 bg-gray-200 rounded"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg p-6 text-white">
                <h1 className="text-3xl font-bold mb-2">
                    Welcome back, {user?.name || user?.phone || "User"}!
                </h1>
                <p className="text-blue-100">
                    {user?.role ? `Role: ${user.role.replace("_", " ")}` : "Dashboard Overview"}
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {statsData.map((stat, index) => (
                    <div
                        key={index}
                        onClick={() => navigate(stat.path)}
                        className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-3xl">{stat.icon}</span>
                            <div className={`w-3 h-3 rounded-full ${stat.color}`}></div>
                        </div>
                        <h4 className="text-sm font-medium text-gray-600 mb-1">{stat.title}</h4>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold mb-4 text-gray-800">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {quickActions.map((action, index) => (
                        <button
                            key={index}
                            onClick={() => navigate(action.path)}
                            className={`${action.color} text-white rounded-lg p-6 flex flex-col items-center justify-center gap-2 transition-transform hover:scale-105`}
                        >
                            <span className="text-4xl">{action.icon}</span>
                            <span className="font-semibold">{action.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold mb-4 text-gray-800">Recent Activity</h2>
                {activities.length > 0 ? (
                    <div className="space-y-3">
                        {activities.map((activity, index) => (
                            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <span className="text-2xl">{activity.icon}</span>
                                <div className="flex-1">
                                    <p className="font-medium">{activity.title}</p>
                                    <p className="text-sm text-gray-500">
                                        {activity.description} - {formatTimeAgo(activity.timestamp)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        No recent activity
                    </div>
                )}
            </div>
        </div>
    );
}
