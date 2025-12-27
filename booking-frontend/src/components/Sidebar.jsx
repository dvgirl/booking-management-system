import { Link, useLocation } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext, ROLES } from "../context/AuthContext";

export default function Sidebar() {
    const { user, hasRole } = useContext(AuthContext);
    const location = useLocation();
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const isActive = (path) =>
        location.pathname === path ||
        location.pathname.startsWith(path + "/");

    const menuItems = [
        {
            path: "/dashboard",
            label: "Dashboard",
            icon: "📊",
            roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.FRONT_DESK, ROLES.ACCOUNTANT, ROLES.OFFICER],
        },
        {
            path: "/admin/bookings",
            label: "Bookings",
            icon: "🏨",
            roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.FRONT_DESK],
        },
        {
            path: "/inventory/calendar",
            label: "Inventory",
            icon: "📦",
            roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.FRONT_DESK],
        },
        {
            path: "/checkin/search",
            label: "Check-in",
            icon: "✅",
            roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.FRONT_DESK],
        },
        {
            path: "/admin/kyc?status=ALL",
            label: "KYC",
            icon: "🆔",
            roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.FRONT_DESK, ROLES.OFFICER],
        },
        {
            path: "/kyc-list",
            label: "My KYC",
            icon: "🆔",
            roles: [ROLES.USER],
        },
        {
            path: "/finance/list",
            label: "Finance",
            icon: "💰",
            roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ACCOUNTANT, ROLES.FRONT_DESK, ROLES.USER],
        },
        {
            path: "/process/list",
            label: "Tasks",
            icon: "🔁",
            roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.FRONT_DESK, ROLES.OFFICER],
        },
        {
            path: "/admin/dashboard",
            label: "Admin",
            icon: "⚙️",
            roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
        },
        {
            path: "/documents",
            label: "Documents",
            icon: "📄",
            roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.FRONT_DESK],
        },
        {
            path: "/bookings/calendar",
            label: "Booking Calendar",
            icon: "📅",
            roles: [ROLES.USER, ROLES.GUEST]
        }
    ];

    const filteredMenuItems = menuItems.filter((item) => {
        // User must have a role
        if (!user?.role) return false;

        // Show menu only if user's role is explicitly allowed
        if (!item.roles.includes(user.role)) return false;

        // Extra restriction: USER with unapproved KYC
        if (user.role === "USER" && user.kycStatus !== "APPROVED") {
            const allowedForUnapproved = ["/dashboard", "/kyc", "/kyc/pending", "/kyc/rejected"];
            return allowedForUnapproved.includes(item.path);
        }

        return true;
    });

    return (
        <>
            {/* Mobile Menu Button - Styled with Blur */}
            <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 bg-slate-900/80 backdrop-blur-md text-white p-2.5 rounded-xl border border-slate-700 shadow-lg hover:bg-slate-800 transition-all"
            >
                {isMobileOpen ? (
                    <span className="block w-6 h-6 text-center leading-6 font-bold">✕</span>
                ) : (
                    <span className="block w-6 h-6 text-center leading-6 font-bold">☰</span>
                )}
            </button>

            {/* Sidebar Container */}
            <aside
                className={`
                    fixed lg:static inset-y-0 left-0 z-40
                    w-72 bg-[#0f172a] text-slate-200
                    border-r border-slate-800/60
                    transform transition-transform duration-300 ease-out
                    ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
                    h-screen flex flex-col shadow-2xl
                `}
            >
                {/* Branding Section */}
                <div className="flex items-center justify-between px-6 py-8">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600 p-2 rounded-lg shadow-inner">
                            <span className="text-xl">🏨</span>
                        </div>
                        <h2 className="text-lg font-bold tracking-tight text-white uppercase">
                            Guest Booking
                        </h2>
                    </div>
                    <button
                        onClick={() => setIsMobileOpen(false)}
                        className="lg:hidden text-slate-400 hover:text-white transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* User Profile Card */}
                {user && (
                    <div className="mx-4 mb-6 p-4 bg-slate-800/40 border border-slate-700/50 rounded-2xl backdrop-blur-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-md">
                                {(user.name || user.role || "U").charAt(0).toUpperCase()}
                            </div>
                            <div className="overflow-hidden">
                                <p className="font-medium text-slate-100 truncate">
                                    {user.name || user.phone || "User"}
                                </p>
                                <p className="text-blue-400 text-[11px] font-bold uppercase tracking-wider">
                                    {user.role || "GUEST"}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation Items */}
                <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar pb-6">
                    <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Main Menu</p>
                    {filteredMenuItems.map((item) => {
                        const active = isActive(item.path);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsMobileOpen(false)}
                                className={`
                                    group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                                    ${active
                                        ? "bg-blue-600/10 text-blue-400 font-semibold border-l-4 border-blue-500"
                                        : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-100 border-l-4 border-transparent"
                                    }
                                `}
                            >
                                <span className={`text-xl transition-transform group-hover:scale-110 ${active ? "opacity-100" : "opacity-70 group-hover:opacity-100"}`}>
                                    {item.icon}
                                </span>
                                <span className="text-sm tracking-wide">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Sidebar Footer (Optional) */}
                <div className="p-4 border-t border-slate-800/60">
                    <p className="text-[10px] text-center text-slate-500">© 2024 Admin Panel v2.0</p>
                </div>
            </aside>

            {/* Mobile Overlay - Smoother Fade */}
            {isMobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-30 transition-opacity"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}
        </>
    );
}