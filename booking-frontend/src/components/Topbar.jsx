import { useNavigate, useLocation } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
// Import your API call here
import { getImminentCheckouts } from "../api/booking.api"; 

export default function Topbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout: authLogout } = useContext(AuthContext);
    const [showUserMenu, setShowUserMenu] = useState(false);
    
    // State for imminent checkouts
    const [upcomingCheckouts, setUpcomingCheckouts] = useState([]);

    const logout = () => {
        authLogout();
        navigate("/login");
    };

    // Fetch imminent checkouts every 5 minutes
    // useEffect(() => {
    //     const fetchCheckouts = async () => {
    //         try {
    //             // Replace with your actual API call
    //             const res = await getImminentCheckouts();
    //             setUpcomingCheckouts(res.data);
                
    //             // For demo: Let's assume the API returns an array
    //             setUpcomingCheckouts([]); 
    //         } catch (err) {
    //             console.error("Failed to fetch notifications", err);
    //         }
    //     };

    //     if (user?.role === "ADMIN") {
    //         fetchCheckouts();
    //         const interval = setInterval(fetchCheckouts, 5 * 60 * 1000); // 5 min refresh
    //         return () => clearInterval(interval);
    //     }   
    // }, [user]);

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
            <div className="flex items-center gap-4">
                <div className="hidden lg:block">
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                        Guest Booking
                    </h1>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none">
                        Hotel PMS System
                    </p>
                </div>
                <div className="hidden lg:block h-8 w-[1px] bg-gray-200 mx-2" />
            </div>

            <div className="flex items-center gap-2 lg:gap-5">
                {/* Notifications Bell - Shows count of checkouts in < 1hr */}
                {/* <button 
                    onClick={() => navigate("/reservations", { state: { filter: "IMMINENT" }})}
                    className="relative p-2.5 text-gray-500 hover:bg-gray-100 rounded-xl transition-all group"
                >
                    <span className="text-xl group-hover:scale-110 transition-transform block">🔔</span>
                    {upcomingCheckouts.length > 0 && (
                        <span className="absolute top-2 right-2 bg-red-500 border-2 border-white text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full shadow-sm animate-bounce">
                            {upcomingCheckouts.length}
                        </span>
                    )}
                </button> */}

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
                    </button>

                    {showUserMenu && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
                            <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-20 animate-in fade-in zoom-in duration-150 origin-top-right">
                                <div className="px-4 py-3 border-b border-gray-50 mb-1">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter mb-1">Signed in as</p>
                                    <p className="text-sm font-semibold text-gray-900 truncate">
                                        {user?.name || user?.phone || "Guest User"}
                                    </p>
                                </div>
                                <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
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