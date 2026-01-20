import { Link, useLocation } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext, ROLES } from "../context/AuthContext";

export default function Sidebar() {
    const { user } = useContext(AuthContext);
    const location = useLocation();
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const isActive = (path) => {
        if (location.pathname === path) return true;
        if (path === "/bookings") {
            return location.pathname.startsWith("/bookings/") && !location.pathname.startsWith("/bookings/calendar");
        }
        return location.pathname.startsWith(path + "/");
    };

    const menuItems = [
        {
            path: "/dashboard",
            label: "Dashboard",
            icon: "📊",
            roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.FRONT_DESK, ROLES.ACCOUNTANT, ROLES.OFFICER],
        },
        {
            path: "/bookings",
            label: "Bookings",
            icon: "🏨",
            roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.FRONT_DESK, ROLES.USER, ROLES.GUEST],
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
            roles: [ROLES.USER, ROLES.GUEST, ROLES.SUPER_ADMIN, ROLES.ADMIN]
        }
    ];

    const filteredMenuItems = menuItems.filter((item) => {
        if (!user?.role) return false;
        if (!item.roles.includes(user.role)) return false;

        if (user.role === "USER") {
            const alwaysVisible = ["/kyc-list", "/dashboard"];
            if (alwaysVisible.includes(item.path)) return true;
            if (user.kycStatus !== "APPROVED") return false;
        }
        return true;
    });

    return (
        <>
            {/* Responsive Handle (Mobile Toggle) */}
            <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className={`
                    lg:hidden fixed top-3 left-3 z-[60] 
                    p-2.5 rounded-xl shadow-lg border border-white/10 backdrop-blur-md transition-all duration-300
                    ${isMobileOpen 
                        ? "bg-rose-500 text-white rotate-90" 
                        : "bg-slate-900/90 text-white hover:bg-slate-800"
                    }
                `}
                aria-label="Toggle Navigation"
            >
                {isMobileOpen ? (
                    <span className="text-lg font-bold">✕</span>
                ) : (
                    <span className="text-lg font-bold">☰</span>
                )}
            </button>

            {/* Sidebar Container */}
            <aside
                className={`
                    fixed lg:sticky lg:top-0 inset-y-0 left-0 z-40
                    w-72 bg-[#0f172a] text-slate-200
                    border-r border-slate-800/60
                    transform transition-transform duration-300 ease-out flex-shrink-0
                    ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
                    h-screen flex flex-col shadow-2xl
                `}
            >
                {/* Header */}
                <div className="flex items-center gap-3 px-6 py-8">
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-lg shadow-lg shadow-blue-900/50">
                        <span className="text-xl">🏨</span>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold tracking-tight text-white uppercase leading-none">
                            Guest Booking
                        </h2>
                        <p className="text-[10px] text-slate-500 font-bold tracking-widest mt-1">MANAGEMENT</p>
                    </div>
                </div>

                {/* User Info Card */}
                {user && (
                    <div className="mx-4 mb-6 p-4 bg-slate-800/40 border border-slate-700/50 rounded-2xl backdrop-blur-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-md ring-2 ring-slate-700/50">
                                {(user.name || user.role || "U").charAt(0).toUpperCase()}
                            </div>
                            <div className="overflow-hidden">
                                <p className="font-medium text-slate-100 truncate text-sm">
                                    {user.name || user.phone || "User"}
                                </p>
                                <p className="text-blue-400 text-[10px] font-bold uppercase tracking-wider">
                                    {user.role}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation Menu - Hidden Scrollbar */}
                <nav className="flex-1 px-4 space-y-1 overflow-y-auto pb-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                    <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 mt-2">Menu</p>
                    {filteredMenuItems.map((item) => {
                        const active = isActive(item.path);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsMobileOpen(false)}
                                className={`
                                    group flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200
                                    ${active
                                        ? "bg-blue-600 text-white font-medium shadow-lg shadow-blue-900/30"
                                        : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                                    }
                                `}
                            >
                                <span className={`text-xl transition-transform group-hover:scale-110 ${active ? "text-white" : "text-slate-500 group-hover:text-white"}`}>
                                    {item.icon}
                                </span>
                                <span className="text-sm tracking-wide">{item.label}</span>
                                {active && <span className="ml-auto w-1.5 h-1.5 bg-white rounded-full animate-pulse" />}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-slate-800/60 bg-[#0f172a]">
                    <p className="text-[10px] text-center text-slate-600 font-medium">
                        v2.0 &bull; © {new Date().getFullYear()} Booking System
                    </p>
                </div>
            </aside>

            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-slate-950/60 backdrop-blur-[2px] z-30 animate-in fade-in duration-200"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}
        </>
    );
}