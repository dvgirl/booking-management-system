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
  IdentificationIcon,
  ArrowRightIcon,
  SignalIcon
} from "@heroicons/react/24/outline";

export default function AdminDashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const adminCards = [
    { 
      title: "Rooms Management", 
      desc: "Configure inventory and pricing",
      icon: <HomeModernIcon className="w-7 h-7" />, 
      path: "/admin/rooms", 
      color: "text-blue-600",
      bg: "bg-blue-50",
      accent: "group-hover:bg-blue-600"
    },
    { 
      title: "Amenities", 
      desc: "Manage room features & extras",
      icon: <SparklesIcon className="w-7 h-7" />, 
      path: "/admin/amenities", 
      color: "text-purple-600",
      bg: "bg-purple-50",
      accent: "group-hover:bg-purple-600"
    },
    { 
      title: "Facility Blocking", 
      desc: "Set maintenance & downtime",
      icon: <NoSymbolIcon className="w-7 h-7" />, 
      path: "/admin/facilities", 
      color: "text-rose-600", 
      bg: "bg-rose-50",
      accent: "group-hover:bg-rose-600"
    },
    { 
      title: "Virtual Accounts", 
      desc: "Financial settings & ledgers",
      icon: <CreditCardIcon className="w-7 h-7" />, 
      path: "/admin/virtual-accounts", 
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      accent: "group-hover:bg-emerald-600"
    },
    { 
      title: "KYC Verification", 
      desc: "Review user identities",
      icon: <IdentificationIcon className="w-7 h-7" />, 
      path: "/admin/kyc", 
      color: "text-amber-600",
      bg: "bg-amber-50",
      accent: "group-hover:bg-amber-600"
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="h-1 w-8 bg-indigo-600 rounded-full"></span>
            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em]">System Overview</p>
          </div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Control Center</h2>
          <p className="text-slate-500 font-medium mt-1">Global system configurations and administrative overrides.</p>
        </div>

        {/* User Session Snapshot */}
        <div className="flex items-center gap-4 bg-white p-2 pr-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-indigo-100 font-black text-xl">
            {user?.name?.charAt(0) || "A"}
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800 leading-none">{user?.name || "Administrator"}</p>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{user?.role || "Super Admin"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* QUICK STATUS TRACKER */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 flex items-center gap-5">
           <div className="p-3 bg-slate-50 rounded-2xl text-slate-400"><SignalIcon className="w-6 h-6" /></div>
           <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Server Status</p>
              <p className="text-lg font-black text-slate-800 tracking-tight">Active / Healthy</p>
           </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 flex items-center gap-5">
           <div className="p-3 bg-slate-50 rounded-2xl text-slate-400"><ShieldCheckIcon className="w-6 h-6" /></div>
           <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Encryption</p>
              <p className="text-lg font-black text-slate-800 tracking-tight">AES-256 Enabled</p>
           </div>
        </div>
      </div>

      <div className="h-px bg-slate-200 w-full"></div>

      {/* INTERACTIVE NAVIGATION CARDS */}
      <div>
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
          Core Infrastructure
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminCards.map((card, index) => (
            <div
              key={index}
              onClick={() => navigate(card.path)}
              className="group relative bg-white rounded-[2rem] border border-slate-200 p-8 cursor-pointer hover:border-indigo-400 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all duration-300 overflow-hidden"
            >
              {/* Background Decoration */}
              <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-[0.03] transition-transform duration-500 group-hover:scale-150 ${card.bg.replace('50', '500')}`}></div>
              
              <div className={`inline-flex p-4 rounded-2xl mb-6 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg ${card.bg} ${card.color}`}>
                {card.icon}
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">{card.title}</h3>
              <p className="text-slate-500 text-sm font-medium leading-relaxed mb-4">{card.desc}</p>
              
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                Configure Module <ArrowRightIcon className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SESSION FOOTER / LOGS MOCKUP */}
      <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center">
              <ShieldCheckIcon className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h4 className="text-xl font-bold">Secure Administrative Session</h4>
              <p className="text-slate-400 text-sm">Session valid until token expiry or manual logout.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 border-t border-white/10 pt-8 mt-4">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Authenticated As</p>
              <p className="font-bold text-indigo-100 truncate">{user?.name || "N/A"}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Access Level</p>
              <p className="font-bold text-indigo-100">{user?.role || "Restricted"}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">IP Address</p>
              <p className="font-bold text-indigo-100 italic">Masked for Security</p>
            </div>
            {/* <div className="flex justify-end items-center">
               <button className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-black uppercase tracking-widest transition-all">View Audit Logs</button>
            </div> */}
          </div>
        </div>

        {/* Abstract background graphics */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none"></div>
      </div>
    </div>
  );
}