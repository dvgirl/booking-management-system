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

    useEffect(() => {
        setShowUserMenu(false);
    }, [location.pathname]);

    const getUserInitial = () => {
        if (user?.name) return user.name.charAt(0).toUpperCase();
        if (user?.phone) return user.phone.charAt(user.phone.length - 1);
        return "U";
    };

    return (
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 lg:px-8 py-3 flex items-center justify-between transition-all">
            {/* LEFT: Branding/Title */}
            <div className="flex items-center gap-4">
                <div className="hidden lg:block">
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                        Guest Booking
                    </h1>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none">
                        Hotel PMS System
                    </p>
                </div>
                
                {/* Visual separator for desktop */}
                <div className="hidden lg:block h-8 w-[1px] bg-gray-200 mx-2" />

                {/* Desktop Search Bar */}
                {/* <div className="relative hidden md:block">
                    <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                        🔍
                    </span>
                    <input
                        type="text"
                        placeholder="Search bookings..."
                        className="bg-gray-100/50 border border-transparent rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-64 lg:w-80 transition-all"
                    />
                </div> */}
            </div>

            {/* RIGHT: Actions */}
            <div className="flex items-center gap-2 lg:gap-5">
                {/* Mobile Search Icon (Placeholder for functionality) */}
                <button className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
                    🔍
                </button>

                {/* Notifications */}
                <button className="relative p-2.5 text-gray-500 hover:bg-gray-100 rounded-xl transition-all group">
                    <span className="text-xl group-hover:scale-110 transition-transform block">🔔</span>
                    <span className="absolute top-2 right-2 bg-red-500 border-2 border-white text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full shadow-sm">
                        3
                    </span>
                </button>

                {/* User Menu */}
                <div className="relative">
                    <button
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className={`flex items-center gap-3 p-1.5 pr-3 rounded-full transition-all border ${
                            showUserMenu ? "bg-gray-100 border-gray-300 shadow-sm" : "border-transparent hover:bg-gray-50"
                        }`}
                    >
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-blue-200 ring-2 ring-white">
                            {getUserInitial()}
                        </div>
                        <div className="hidden lg:block text-left">
                            <p className="text-sm font-semibold text-gray-800 leading-tight">
                                {user?.name || user?.phone || "User"}
                            </p>
                            <p className="text-[11px] font-medium text-blue-600 uppercase">
                                {user?.role || "Guest"}
                            </p>
                        </div>
                        <span className={`text-[10px] text-gray-400 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`}>
                            ▼
                        </span>
                    </button>

                    {/* Dropdown Menu */}
                    {showUserMenu && (
                        <>
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setShowUserMenu(false)}
                            />
                            <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-20 animate-in fade-in zoom-in duration-150 origin-top-right">
                                <div className="px-4 py-3 border-b border-gray-50 mb-1">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter mb-1">Signed in as</p>
                                    <p className="text-sm font-semibold text-gray-900 truncate">
                                        {user?.name || user?.phone || "Guest User"}
                                    </p>
                                </div>

                                {user?.role === "USER" && (
                                    <button
                                        onClick={() => navigate("/kyc-list")}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                                    >
                                        <span className="opacity-70">🆔</span> My KYC Status
                                    </button>
                                )}

                                <button
                                    onClick={() => navigate("/profile")}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                                >
                                    <span className="opacity-70">⚙️</span> Profile Settings
                                </button>

                                <div className="h-[1px] bg-gray-100 my-1 mx-2" />

                                <button
                                    onClick={logout}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    <span className="opacity-70">🚪</span> Sign Out
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}