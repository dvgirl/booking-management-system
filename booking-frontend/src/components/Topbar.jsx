import { useNavigate, useLocation } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Topbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout: authLogout } = useContext(AuthContext);
    const [showUserMenu, setShowUserMenu] = useState(false);

    const logout = () => {
        authLogout();
        navigate("/login");
    };

    // Close dropdown on route change
    useEffect(() => {
        setShowUserMenu(false);
    }, [location.pathname]);

    const getUserInitial = () => {
        if (user?.name) {
            return user.name.charAt(0).toUpperCase();
        }
        if (user?.phone) {
            return user.phone.charAt(user.phone.length - 1);
        }
        return "U";
    };

    return (
        <header className="bg-white shadow-md px-4 lg:px-6 py-3 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            {/* LEFT */}
            <div className="w-full lg:w-auto">
                <h1 className="text-lg font-semibold text-gray-800">
                    Guest Booking Platform
                </h1>
                <p className="text-sm text-gray-500">
                    Hotel PMS System
                </p>
            </div>

            {/* RIGHT */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 w-full lg:w-auto">
                {/* Desktop Search */}
                <div className="hidden lg:block">
                    <input
                        type="text"
                        placeholder="Search booking / guest"
                        className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                    />
                </div>

                {/* Mobile Search */}
                <div className="lg:hidden w-full">
                    <input
                        type="text"
                        placeholder="Search..."
                        className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                    />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    {/* Notifications */}
                    <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <span className="text-xl">🔔</span>
                        <span className="absolute top-0 right-0 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                            3
                        </span>
                    </button>

                    {/* User Menu */}
                    <div className="relative">
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                                {getUserInitial()}
                            </div>
                            <div className="hidden lg:block text-left">
                                <p className="text-sm font-medium text-gray-800">
                                    {user?.name || user?.phone || "User"}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {user?.role || "Guest"}
                                </p>
                            </div>
                        </button>

                        {/* Dropdown */}
                        {showUserMenu && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setShowUserMenu(false)}
                                />
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-20">
                                    <div className="px-4 py-2 border-b border-gray-200">
                                        <p className="text-sm font-medium text-gray-800">
                                            {user?.name || user?.phone || "User"}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {user?.role || "Guest"}
                                        </p>
                                    </div>

                                    {/* USER-only KYC */}
                                    {user?.role === "USER" && (
                                        <button
                                            onClick={() => navigate("/kyc-list")}
                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            My KYC
                                        </button>
                                    )}

                                    <button
                                        onClick={() => navigate("/profile")}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                        Profile Settings
                                    </button>

                                    <button
                                        onClick={logout}
                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
