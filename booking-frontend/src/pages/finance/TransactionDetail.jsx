import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getTransactionById } from "../../api/transaction.api";
import { 
  FiChevronLeft, FiPrinter, FiShare2, FiShield, 
  FiHash, FiClock, FiUser, FiCreditCard 
} from "react-icons/fi";

export default function TransactionDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [tx, setTx] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        load();
    }, [id]);

    const load = async () => {
        try {
            const res = await getTransactionById(id);
            setTx(res.data);
        } catch (error) {
            console.error("Failed to fetch transaction", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

    if (!tx) return (
      <div className="p-12 text-center text-slate-500 font-bold uppercase tracking-widest">
        Transaction record not found.
      </div>
    );

    const isCredit = tx.type === "INCOME" || tx.direction === "IN";

    return (
        <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-12 animate-in fade-in duration-500">
            <div className="max-w-2xl mx-auto">
                
                {/* ACTIONS */}
                <div className="flex justify-between items-center mb-8">
                  <button 
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-indigo-600 transition-all"
                  >
                    <FiChevronLeft /> Close Detail
                  </button>
                  <div className="flex gap-2">
                    <button className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 transition-all shadow-sm">
                      <FiPrinter size={16} />
                    </button>
                    <button className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 transition-all shadow-sm">
                      <FiShare2 size={16} />
                    </button>
                  </div>
                </div>

                {/* THE RECEIPT CARD */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
                  
                  {/* HERO SECTION */}
                  <div className="p-10 text-center border-b border-slate-50 relative overflow-hidden">
                    {/* Decorative Background Icon */}
                    <FiShield className="absolute -top-10 -right-10 text-slate-50/50 w-40 h-40" />
                    
                    <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 ${
                      tx.status === 'VERIFIED' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${tx.status === 'VERIFIED' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                      {tx.status}
                    </div>

                    <h1 className="text-5xl font-black tracking-tighter text-slate-900 mb-2">
                      {isCredit ? "+" : "-"}₹{tx.amount?.toLocaleString('en-IN')}
                    </h1>
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">{tx.method} Transaction</p>
                  </div>

                  {/* DATA GRID */}
                  <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                    
                    <div className="space-y-1">
                      <p className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <FiHash size={12} className="text-indigo-500" /> Reference ID
                      </p>
                      <p className="font-mono text-sm font-bold text-slate-700 break-all">{tx.referenceId || "TXN-AUTO-GEN"}</p>
                    </div>

                    <div className="space-y-1">
                      <p className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <FiClock size={12} className="text-indigo-500" /> Timestamp
                      </p>
                      <p className="text-sm font-bold text-slate-700">
                        {new Date(tx.createdAt || Date.now()).toLocaleString('en-GB', {
                          day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <FiCreditCard size={12} className="text-indigo-500" /> Payment Mode
                      </p>
                      <p className="text-sm font-bold text-slate-700">{tx.mode || "System Ledger"}</p>
                    </div>

                    <div className="space-y-1">
                      <p className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <FiUser size={12} className="text-indigo-500" /> Authorized By
                      </p>
                      <p className="text-sm font-bold text-slate-700">{tx.createdBy || "System"}</p>
                    </div>

                  </div>

                  {/* FOOTER NOTE */}
                  <div className="bg-slate-50/50 p-8 border-t border-slate-50">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-300 border border-slate-100 shadow-sm shrink-0">
                        <FiShield />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-slate-500 tracking-tight">System Verification</p>
                        <p className="text-[11px] font-medium text-slate-400 mt-0.5 leading-relaxed">
                          This transaction has been cryptographically signed and logged. Verified status indicates the funds have been settled in the primary ledger.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* PROOF SECTION (If applicable) */}
                {tx.proofUrl && (
                  <div className="mt-8 space-y-4">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Digital Attachment</h3>
                    <div className="rounded-[2.5rem] border-4 border-white shadow-xl overflow-hidden">
                      <img 
                        src={`${import.meta.env.VITE_API_BASE_URL}/${tx.proofUrl}`} 
                        alt="Transaction Proof" 
                        className="w-full h-auto"
                      />
                    </div>
                  </div>
                )}
            </div>
        </div>
    );
}