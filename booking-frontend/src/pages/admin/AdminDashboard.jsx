import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { 
  HomeModernIcon, 
  SparklesIcon, 
  NoSymbolIcon, 
  CreditCardIcon, 
  UserCircleIcon,
  ShieldCheckIcon,
  IdentificationIcon
} from "@heroicons/react/24/outline";

export default function AdminDashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const adminCards = [
    { 
      title: "Rooms Management", 
      desc: "Configure inventory and pricing",
      icon: <HomeModernIcon className="w-8 h-8" />, 
      path: "/admin/rooms", 
      color: "text-blue-600",
      bg: "bg-blue-50" 
    },
    { 
      title: "Amenities", 
      desc: "Manage room features & extras",
      icon: <SparklesIcon className="w-8 h-8" />, 
      path: "/admin/amenities", 
      color: "text-purple-600",
      bg: "bg-purple-50"
    },
    { 
      title: "Facility Blocking", 
      desc: "Set maintenance & downtime",
      icon: <NoSymbolIcon className="w-8 h-8" />, 
      path: "/admin/facilities", 
      color: "text-rose-600", 
      bg: "bg-rose-50"
    },
    { 
      title: "Virtual Accounts", 
      desc: "Financial settings & ledgers",
      icon: <CreditCardIcon className="w-8 h-8" />, 
      path: "/admin/virtual-accounts", 
      color: "text-emerald-600",
      bg: "bg-emerald-50"
    },
    { 
      title: "KYC Verification", 
      desc: "Review user identities",
      icon: <IdentificationIcon className="w-8 h-8" />, 
      path: "/admin/kyc", 
      color: "text-amber-600",
      bg: "bg-amber-50"
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-10">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Control Center</h2>
            <p className="text-slate-500 font-medium">System-wide configurations and operational management.</p>
          </div>
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-200">
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
              {user?.name?.charAt(0) || "A"}
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Active Session</p>
              <p className="text-sm font-bold text-slate-800">{user?.name || "Administrator"}</p>
            </div>
          </div>
        </div>

        {/* QUICK STATS (Optional Addition) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <p className="text-sm font-medium text-slate-500">System Integrity</p>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-2xl font-bold text-slate-900">Operational</span>
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
                </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <p className="text-sm font-medium text-slate-500">Global Role</p>
                <p className="text-2xl font-bold text-indigo-600 mt-1">{user?.role || "Super Admin"}</p>
            </div>
        </div>

        {/* MANAGEMENT CARDS */}
        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <ShieldCheckIcon className="w-5 h-5 text-indigo-500" />
            Core Management
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {adminCards.map((card, index) => (
            <div
              key={index}
              onClick={() => navigate(card.path)}
              className="group bg-white rounded-2xl border border-slate-200 p-6 cursor-pointer hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 relative overflow-hidden"
            >
              <div className={`inline-flex p-3 rounded-xl mb-4 transition-colors ${card.bg} ${card.color}`}>
                {card.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-1">{card.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{card.desc}</p>
              
              {/* Subtle arrow that appears on hover */}
              <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>
          ))}
        </div>

        {/* SYSTEM DETAILS SECTION */}
        <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div>
                    <h3 className="text-2xl font-bold mb-2">System Information</h3>
                    <p className="text-slate-400 max-w-md">Detailed breakdown of the current authenticated administrative session and environment.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 md:min-w-[400px]">
                    <div className="bg-white/5 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
                        <div className="flex items-center gap-3 mb-1 text-slate-400">
                            <UserCircleIcon className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-widest">Administrator</span>
                        </div>
                        <p className="text-lg font-medium">{user?.name || user?.phone || "N/A"}</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
                        <div className="flex items-center gap-3 mb-1 text-slate-400">
                            <ShieldCheckIcon className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-widest">Access Level</span>
                        </div>
                        <p className="text-lg font-medium capitalize">{user?.role || "Restricted"}</p>
                    </div>
                </div>
            </div>
            {/* Decorative background circle */}
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl"></div>
        </div>
      </div>
    </div>
  );
}