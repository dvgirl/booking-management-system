import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import {
  User, Phone, Shield, Calendar,
  Settings, LogOut, Key, CheckCircle
} from "lucide-react";

export default function Profile() {
  const { user, logout } = useContext(AuthContext);

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 bg-slate-200 rounded-full animate-pulse mx-auto mb-4" />
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Identity Not Found</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 lg:p-12 font-sans">
      <div className="max-w-4xl mx-auto">

        {/* HEADER SECTION */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">
              Account Vault
            </h1>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
              Management & Security Settings
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* LEFT COLUMN: IDENTITY CARD */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-8 text-center relative overflow-hidden">
              {/* Background Accent */}
              <div className="absolute top-0 left-0 w-full h-24 bg-slate-900" />

              <div className="relative pt-4">
                <div className="w-24 h-24 rounded-[2rem] bg-white p-1 shadow-xl mx-auto mb-4">
                  <div className="w-full h-full rounded-[1.8rem] bg-blue-600 flex items-center justify-center text-white text-3xl font-black shadow-inner">
                    {user.name ? user.name.charAt(0).toUpperCase() : <User size={32} />}
                  </div>
                </div>

                <h2 className="text-xl font-black text-slate-900 leading-tight">
                  {user.name || "Administrator"}
                </h2>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full mt-2">
                  <CheckCircle size={10} strokeWidth={3} />
                  <span className="text-[9px] font-black uppercase tracking-widest">Verified {user.role}</span>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-slate-50 space-y-2">
                <button className="w-full py-3 bg-slate-50 text-slate-400 rounded-xl text-[10px] font-black uppercase cursor-not-allowed">
                  Edit Avatar
                </button>
              </div>
            </div>

            {/* QUICK STATS */}
            <div className="bg-slate-900 rounded-[2rem] p-6 text-white shadow-xl">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Security Level</p>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/10 rounded-2xl text-blue-400">
                  <Shield size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold">Standard Admin</p>
                  <p className="text-[10px] text-white/50">Full Write Access</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: DATA & SETTINGS */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/50 flex items-center gap-2">
                <Settings size={16} className="text-slate-400" />
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Personal Identification</h3>
              </div>

              <div className="p-8 space-y-8">
                <DataRow
                  icon={<User size={18} />}
                  label="System Alias"
                  value={user.name || "Not Set"}
                />
                <DataRow
                  icon={<Phone size={18} />}
                  label="Secured Line"
                  value={user.phone}
                />
                <DataRow
                  icon={<Key size={18} />}
                  label="Role Permission"
                  value={user.role}
                  isBadge
                />
                <DataRow
                  icon={<Calendar size={18} />}
                  label="Member Since"
                  value={new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                />
              </div>

              <div className="px-8 py-6 bg-amber-50/50 border-t border-amber-100">
                <p className="text-[10px] font-bold text-amber-700 leading-relaxed flex items-center gap-2">
                  <Shield size={12} />
                  Self-service profile updates are currently restricted. Contact System Architect for credential changes.
                </p>
              </div>
            </div>

            {/* ACTION FOOTER */}
          </div>

        </div>
      </div>
    </div>
  );
}

// Reusable Component for Data Rows
function DataRow({ icon, label, value, isBadge = false }) {
  return (
    <div className="flex items-center justify-between group">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-slate-50 text-slate-400 rounded-2xl group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
          {icon}
        </div>
        <div>
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-0.5">{label}</p>
          <p className={`text-sm font-bold ${isBadge ? 'text-blue-600 uppercase tracking-tighter' : 'text-slate-700'}`}>
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}