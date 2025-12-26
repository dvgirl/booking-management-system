import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
// Change getReportByDate to getDailyReport
import { getDailyReport } from "../../api/report.api"; 
import { toast } from "react-toastify";
import { FiArrowLeft, FiPrinter, FiTrendingUp, FiUsers, FiHome } from "react-icons/fi";

export default function DailyReportView() {
  const { date } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        // Use the correct function name here
        const res = await getDailyReport(date);
        setReport(res.data);
      } catch (error) {
        toast.error("Report not found for this date");
        navigate("/reports");
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [date, navigate]);

  if (loading) return <div className="p-20 text-center font-black animate-pulse">LOADING REPORT...</div>;
  if (!report) return null;

  const formatCurrency = (val) => 
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(val || 0);

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-10 font-sans">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold mb-6 transition-colors"
        >
          <FiArrowLeft /> Back to Logs
        </button>

        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Daily Summary</h1>
            <p className="text-slate-500 font-medium">{new Date(report.date).toDateString()}</p>
          </div>
          <button 
            onClick={() => window.print()}
            className="p-4 bg-white border border-slate-200 rounded-2xl hover:shadow-md transition-all"
          >
            <FiPrinter />
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCard title="Total Revenue" value={formatCurrency(report.revenue?.total)} icon={<FiTrendingUp />} color="text-emerald-600" />
          <StatCard title="Occupancy" value={`${report.occupancy?.occupiedRooms}/${report.occupancy?.totalRooms}`} icon={<FiHome />} color="text-blue-600" />
          <StatCard title="New Bookings" value={report.bookings?.total} icon={<FiUsers />} color="text-slate-900" />
        </div>

        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
          <h3 className="font-black uppercase text-[10px] tracking-widest text-slate-400 mb-6">Revenue Breakdown</h3>
          <div className="space-y-4">
            <PaymentRow label="Cash" amount={report.revenue?.cash} />
            <PaymentRow label="UPI" amount={report.revenue?.upi} />
            <PaymentRow label="Bank Transfer" amount={report.revenue?.bank} />
            <PaymentRow label="Online (Razorpay)" amount={report.revenue?.razorpay} />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
      <div className={`mb-3 ${color}`}>{icon}</div>
      <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">{title}</p>
      <p className="text-2xl font-black text-slate-900">{value}</p>
    </div>
  );
}

function PaymentRow({ label, amount }) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-slate-50 last:border-0">
      <span className="font-bold text-slate-600">{label}</span>
      <span className="font-black text-slate-900">{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount || 0)}</span>
    </div>
  );
}