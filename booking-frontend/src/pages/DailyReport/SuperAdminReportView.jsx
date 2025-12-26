import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
// Updated import to match your api.js
import { getDailyReport } from "../../api/report.api";
import { toast } from "react-toastify";
import { 
  FiArrowLeft, 
  FiPrinter, 
  FiTrendingUp, 
  FiHome, 
  FiPieChart, 
  FiCreditCard, 
  FiActivity 
} from "react-icons/fi";

export default function SuperAdminReportView() {
  const { date } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, [date]);

  const load = async () => {
    try {
      setLoading(true);
      // Using the correct function name from your api.js
      const res = await getDailyReport(date);
      setReport(res.data || res);
    } catch (error) {
      console.error("Error loading report:", error);
      toast.error("Could not fetch the report for this date.");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Loading Audit...</p>
      </div>
    </div>
  );

  if (!report) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
      <div className="text-center">
        <p className="text-slate-500 font-bold mb-4">Report not found for {date}</p>
        <button onClick={() => navigate(-1)} className="text-blue-600 font-black text-xs uppercase">Go Back</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-10 font-sans text-slate-900">
      <div className="max-w-5xl mx-auto">
        
        {/* Header Actions */}
        <div className="flex justify-between items-center mb-10">
          <button 
            onClick={() => navigate(-1)}
            className="group flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-all"
          >
            <div className="p-2 rounded-xl group-hover:bg-white transition-all">
              <FiArrowLeft size={20} />
            </div>
            <span className="font-black uppercase text-[10px] tracking-widest">Back to Logs</span>
          </button>

          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-white border border-slate-200 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm"
          >
            <FiPrinter /> Print Report
          </button>
        </div>

        {/* Title Section */}
        <div className="mb-10">
          <h1 className="text-4xl font-black tracking-tight text-slate-900">Daily Audit</h1>
          <p className="text-slate-500 font-medium">Detailed performance breakdown for {new Date(date).toDateString()}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard 
            label="Net Revenue" 
            value={formatCurrency(report.revenue?.total)} 
            icon={<FiTrendingUp />} 
            color="text-emerald-600" 
            bg="bg-emerald-50"
          />
          <StatCard 
            label="Occupancy" 
            value={`${report.occupancy?.occupiedRooms || 0} / ${report.occupancy?.totalRooms || 0}`} 
            icon={<FiHome />} 
            color="text-blue-600" 
            bg="bg-blue-50"
          />
          <StatCard 
            label="Booking Activity" 
            value={report.bookings?.total || 0} 
            icon={<FiActivity />} 
            color="text-amber-600" 
            bg="bg-amber-50"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Revenue Details */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-8 flex items-center gap-2">
              <FiCreditCard className="text-blue-500" /> Revenue Breakdown
            </h3>
            <div className="space-y-6">
              <RevenueRow label="Cash Payments" value={report.revenue?.cash} />
              <RevenueRow label="UPI Transfers" value={report.revenue?.upi} />
              <RevenueRow label="Bank Transfers" value={report.revenue?.bank} />
              <RevenueRow label="Razorpay Online" value={report.revenue?.razorpay} />
              <div className="pt-4 mt-4 border-t border-dashed border-slate-100 flex justify-between items-center">
                <span className="font-black text-slate-900 uppercase text-xs">Total Collected</span>
                <span className="text-xl font-black text-blue-600">{formatCurrency(report.revenue?.total)}</span>
              </div>
            </div>
          </div>

          {/* Operational Metrics */}
          <div className="space-y-6">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
                <FiPieChart className="text-amber-500" /> Booking Status
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl">
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Confirmed</p>
                  <p className="text-lg font-black text-emerald-600">{report.bookings?.confirmed || 0}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl">
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Cancelled</p>
                  <p className="text-lg font-black text-rose-500">{report.bookings?.cancelled || 0}</p>
                </div>
              </div>
            </div>

            {/* Admin Info */}
            <div className="bg-slate-900 rounded-[2.5rem] p-8 shadow-xl text-white">
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Audit Metadata</p>
               <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Status</span>
                    <span className="font-bold text-emerald-400">VERIFIED</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Generated By</span>
                    <span className="font-bold">System Admin</span>
                  </div>
               </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// Helper Components
function StatCard({ label, value, icon, color, bg }) {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
      <div className={`w-12 h-12 ${bg} ${color} rounded-2xl flex items-center justify-center mb-6`}>
        {icon}
      </div>
      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">{label}</p>
      <p className="text-3xl font-black text-slate-900">{value}</p>
    </div>
  );
}

function RevenueRow({ label, value }) {
  return (
    <div className="flex justify-between items-center group">
      <span className="text-sm font-bold text-slate-500 group-hover:text-slate-900 transition-colors">{label}</span>
      <span className="font-black text-slate-900">
        {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(value || 0)}
      </span>
    </div>
  );
}