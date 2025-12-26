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

    // Role-based menu items
    const menuItems = [
        {
            path: "/dashboard",
            label: "Dashboard",
            icon: "📊",
            roles: [
                ROLES.SUPER_ADMIN,
                ROLES.ADMIN,
                ROLES.FRONT_DESK,
                ROLES.ACCOUNTANT,
                ROLES.OFFICER
            ],
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

        // 🔐 Admin / Staff KYC
        {
            path: "/admin/kyc?status=ALL",
            label: "KYC",
            icon: "🆔",
            roles: [
                ROLES.SUPER_ADMIN,
                ROLES.ADMIN,
                ROLES.FRONT_DESK,
                ROLES.OFFICER,
            ],
        },

        // 👤 USER-only KYC
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
            roles: [
                ROLES.SUPER_ADMIN,
                ROLES.ADMIN,
                ROLES.ACCOUNTANT,
                ROLES.FRONT_DESK,
                ROLES.USER
            ],
        },
        {
            path: "/process/list",
            label: "Tasks",
            icon: "🔁",
            roles: [
                ROLES.SUPER_ADMIN,
                ROLES.ADMIN,
                ROLES.FRONT_DESK,
                ROLES.OFFICER,
            ],
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
            // Available to all roles
            roles: [ROLES.USER, ROLES.GUEST]
        }
    ];

    const filteredMenuItems = menuItems.filter(
        (item) => !item.roles || item.roles.some((role) => hasRole(role))
    );
    console.log("Filtered Menu Items:", filteredMenuItems);

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 bg-gray-900 text-white p-2 rounded-md"
            >
                {isMobileOpen ? "✕" : "☰"}
            </button>

            {/* Sidebar */}
            <aside
                className={`
                    fixed lg:static inset-y-0 left-0 z-40
                    w-64 bg-gray-900 text-white
                    transform transition-transform duration-300 ease-in-out
                    ${isMobileOpen
                        ? "translate-x-0"
                        : "-translate-x-full lg:translate-x-0"
                    }
                    h-screen p-4 overflow-y-auto
                `}
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">🏨 Guest Booking</h2>
                    <button
                        onClick={() => setIsMobileOpen(false)}
                        className="lg:hidden text-white"
                    >
                        ✕
                    </button>
                </div>

                {user && (
                    <div className="mb-4 p-2 bg-gray-800 rounded text-sm">
                        <p className="font-semibold">
                            {user.name || user.phone || "User"}
                        </p>
                        <p className="text-gray-400 text-xs">
                            {user.role || "GUEST"}
                        </p>
                    </div>
                )}

                <nav className="space-y-2">
                    {filteredMenuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setIsMobileOpen(false)}
                            className={`
                                flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                                ${isActive(item.path)
                                    ? "bg-blue-600 text-white"
                                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                                }
                            `}
                        >
                            <span className="text-xl">{item.icon}</span>
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </nav>
            </aside>

            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}
        </>
    );
}
