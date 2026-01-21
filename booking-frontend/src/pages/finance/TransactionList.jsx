import { useEffect, useState, useContext } from "react";
import * as TransactionAPI from "../../api/transaction.api";
import { AuthContext, ROLES } from "../../context/AuthContext";
import { toast } from "react-toastify";
import {
  FiArrowUpRight,
  FiArrowDownLeft,
  FiCamera,
  FiCheckCircle,
  FiX,
  FiInfo,
  FiRefreshCw,
  FiFileText,
  FiCreditCard,
  FiCalendar
} from "react-icons/fi";

export default function TransactionList() {
  const { hasRole } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTx, setSelectedTx] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Role definition
  const isStaff = hasRole([ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.FRONT_DESK, ROLES.ACCOUNTANT]);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const res = await TransactionAPI.getTransactions();
      const data = res?.data ? res.data : res;
      setTransactions(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Error synchronizing ledger records");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    if (!isStaff) return;
    const file = e.target.files[0];
    if (!file || !selectedTx) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      await TransactionAPI.uploadProof(selectedTx._id, formData);
      toast.success("Financial proof uploaded successfully");
      load();
      setSelectedTx(null);
    } catch (error) {
      toast.error("Cloud storage upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleVerify = async (id) => {
    if (!isStaff) return;
    try {
      await TransactionAPI.verifyTransaction(id);
      toast.success("Ledger Entry Verified");
      load();
      setSelectedTx(null);
    } catch (error) {
      toast.error("Verification protocol failed");
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  // --- HELPER: Specific Status Color Coding ---
  const getStatusTheme = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return {
          badge: 'bg-emerald-50 text-emerald-600 border-emerald-100',
          dot: 'bg-emerald-500',
          text: 'text-emerald-500',
          bg: 'bg-emerald-50'
        };
      case 'CHECKED_IN':
        return {
          badge: 'bg-indigo-50 text-indigo-600 border-indigo-100',
          dot: 'bg-indigo-500',
          text: 'text-indigo-500',
          bg: 'bg-indigo-50'
        };
      case 'CHECKED_OUT':
        return {
          badge: 'bg-slate-100 text-slate-600 border-slate-200',
          dot: 'bg-slate-500',
          text: 'text-slate-500',
          bg: 'bg-slate-50'
        };
      case 'CANCELLED':
        return {
          badge: 'bg-rose-50 text-rose-600 border-rose-100',
          dot: 'bg-rose-500',
          text: 'text-rose-500',
          bg: 'bg-rose-50'
        };
      case 'PENDING':
      default:
        return {
          badge: 'bg-amber-50 text-amber-600 border-amber-100',
          dot: 'bg-amber-500 animate-pulse',
          text: 'text-amber-500',
          bg: 'bg-amber-50'
        };
    }
  };

  const tableColSpan = isStaff ? 4 : 3;

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-12 animate-in fade-in duration-500">
      <div className="max-w-7xl mx-auto">

        {/* HEADER SECTION */}
        <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-slate-900 uppercase">
              {isStaff ? "Treasury Logs" : "Payment Archive"}
            </h1>
            <p className="text-slate-500 font-medium text-sm mt-1">
              {isStaff ? "Cross-reference and verify incoming capital" : "History of all financial commitments"}
            </p>
          </div>
          <button
            onClick={load}
            className="flex items-center gap-2 px-8 py-3.5 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm font-black text-[10px] uppercase tracking-widest text-slate-600 hover:text-indigo-600"
          >
            <FiRefreshCw className={loading ? "animate-spin" : ""} />
            Sync Records
          </button>
        </header>

        {/* LEDGER TABLE */}
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-10 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Classification</th>
                  <th className="px-10 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Capital Flow</th>
                  <th className="px-10 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Lifecycle</th>
                  {isStaff && (
                    <th className="px-10 py-6 text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Action</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan={tableColSpan} className="py-32 text-center">
                      <div className="w-8 h-8 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
                    </td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan={tableColSpan} className="py-32 text-center text-slate-400 font-black uppercase text-[10px] tracking-widest">
                      Zero entries found in registry
                    </td>
                  </tr>
                ) : transactions.map((t) => {
                  const statusStyle = getStatusTheme(t.status);
                  return (
                    <tr
                      key={t._id}
                      onClick={() => setSelectedTx(t)}
                      className="group hover:bg-slate-50/80 transition-all cursor-pointer"
                    >
                      <td className="px-10 py-7">
                        <div className="flex items-center gap-5">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-transform group-hover:scale-110 shadow-sm ${t.direction === 'IN' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                            }`}>
                            {t.direction === 'IN' ? <FiArrowDownLeft /> : <FiArrowUpRight />}
                          </div>
                          <div>
                            <div className="font-black text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">
                              {t.transactionRef || 'SYSTEM_TXN'}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{t.paymentMode}</span>
                              <span className="h-1 w-1 rounded-full bg-slate-200"></span>
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                                {new Date(t.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-7">
                        <div className={`text-lg font-black tracking-tight ${t.direction === 'IN' ? 'text-slate-900' : 'text-rose-600'}`}>
                          {t.direction === 'OUT' ? '-' : '+'} {formatCurrency(t.amount)}
                        </div>
                      </td>
                      <td className="px-10 py-7">
                        <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 text-[9px] font-black rounded-xl uppercase border tracking-widest shadow-sm ${statusStyle.badge}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                          {t.status}
                        </span>
                      </td>

                      {isStaff && (
                        <td className="px-10 py-7 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTx(t);
                            }}
                            className="p-3 bg-white border border-slate-100 text-slate-400 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 rounded-2xl transition-all shadow-sm hover:shadow-md"
                          >
                            <FiInfo size={18} />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* DETAIL DRAWER */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setSelectedTx(null)} />

          <div className="relative w-full max-w-md bg-white h-full shadow-2xl p-10 flex flex-col animate-in slide-in-from-right duration-500 border-l border-slate-100">
            <header className="flex justify-between items-center mb-10">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl shadow-sm"><FiFileText size={20} /></div>
                <h2 className="text-xl font-black uppercase tracking-tighter text-slate-900">Entry Data</h2>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="p-3 hover:bg-slate-100 text-slate-400 hover:text-slate-900 rounded-2xl transition-colors"
              >
                <FiX size={20} />
              </button>
            </header>

            <div className="space-y-8 flex-1 overflow-y-auto custom-scrollbar">
              {/* Card Visualization */}
              <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-2xl shadow-indigo-200 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <FiCreditCard className="absolute top-[-20px] right-[-20px] text-white/5 transition-transform group-hover:scale-110 duration-700" size={150} />

                <p className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em] mb-2 relative z-10">Accounting Value</p>
                <p className="text-4xl font-black tracking-tighter relative z-10">{formatCurrency(selectedTx.amount)}</p>

                <div className="mt-8 grid grid-cols-2 gap-4 relative z-10">
                  <div>
                    <p className="text-[9px] font-black text-indigo-300 uppercase mb-1">Payment Method</p>
                    <p className="text-sm font-bold">{selectedTx.paymentMode}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-indigo-300 uppercase mb-1">Time Stamp</p>
                    <p className="text-sm font-bold flex items-center gap-2"><FiCalendar size={12} /> {new Date(selectedTx.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Proof Section */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block flex items-center justify-between">
                  <span>Merchant/Customer Proof</span>
                  {selectedTx.proofUrl && <span className="text-emerald-500 flex items-center gap-1"><FiCheckCircle size={10} /> Attached</span>}
                </label>

                {selectedTx.proofUrl ? (
                  <div className="rounded-[2rem] overflow-hidden border-4 border-slate-50 shadow-inner group relative">
                    <img
                      src={`${import.meta.env.VITE_API_BASE_URL}/${selectedTx.proofUrl}`}
                      alt="Proof"
                      className="w-full h-64 object-cover transition-transform group-hover:scale-105 duration-700"
                    />
                    {isStaff && (
                      <label className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm">
                        <span className="px-6 py-3 bg-white text-slate-900 rounded-xl font-black text-[10px] uppercase flex items-center gap-2 shadow-xl hover:scale-105 transition-transform">
                          <FiCamera /> Swap Document
                        </span>
                        <input type="file" className="hidden" onChange={handleUpload} />
                      </label>
                    )}
                  </div>
                ) : (
                  <label className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-200 rounded-[2.5rem] transition-all ${isStaff ? 'hover:bg-slate-50 hover:border-indigo-300 cursor-pointer' : 'bg-slate-50'}`}>
                    <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-slate-300 mb-4">
                      <FiCamera size={24} />
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center px-8 leading-relaxed">
                      {isStaff ? (uploading ? "Uploading to secure server..." : "Attach transaction receipt") : "No documentation provided"}
                    </span>
                    {isStaff && <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />}
                  </label>
                )}
              </div>
            </div>

            {/* ACTION ZONE (Footer) */}
            <footer className="pt-8 border-t border-slate-100 mt-auto">
              {isStaff && selectedTx.status === 'PENDING' ? (
                <button
                  onClick={() => handleVerify(selectedTx._id)}
                  className="w-full bg-indigo-600 text-white py-5 rounded-[1.5rem] font-black uppercase text-[11px] tracking-[0.2em] hover:bg-slate-900 transition-all shadow-xl shadow-indigo-200 hover:shadow-slate-200 flex items-center justify-center gap-3 active:scale-95"
                >
                  <FiCheckCircle size={18} /> Confirm Ledger Entry
                </button>
              ) : (
                // Dynamic Footer Color based on status
                <div className={`p-5 rounded-2xl flex items-center justify-center gap-3 ${getStatusTheme(selectedTx.status).bg}`}>
                  <FiCheckCircle className={getStatusTheme(selectedTx.status).text} />
                  <p className={`text-[10px] font-black uppercase tracking-[0.1em] ${getStatusTheme(selectedTx.status).text}`}>
                    {selectedTx.status}
                  </p>
                </div>
              )}
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}