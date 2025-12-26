import { useEffect, useState, useContext } from "react";
import * as TransactionAPI from "../../api/transaction.api";
import { AuthContext, ROLES } from "../../context/AuthContext"; // Import AuthContext
import { toast } from "react-toastify";
import { 
  FiArrowUpRight, 
  FiArrowDownLeft, 
  FiCamera, 
  FiCheckCircle, 
  FiX, 
  FiInfo 
} from "react-icons/fi";

export default function TransactionList() {
  const { user, hasRole } = useContext(AuthContext); // Get user and role helper
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTx, setSelectedTx] = useState(null); 
  const [uploading, setUploading] = useState(false);

  // Check if current user is just a regular USER
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
      toast.error("Error loading transactions");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    if (!isStaff) return; // Prevent user action
    const file = e.target.files[0];
    if (!file || !selectedTx) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      if (TransactionAPI.uploadProof) {
        await TransactionAPI.uploadProof(selectedTx._id, formData);
        toast.success("Proof uploaded successfully");
        load(); 
        setSelectedTx(null); 
      }
    } catch (error) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleVerify = async (id) => {
    if (!isStaff) return; // Prevent user action
    try {
      if (TransactionAPI.verifyTransaction) {
        await TransactionAPI.verifyTransaction(id);
        toast.success("Transaction Verified");
        load();
        setSelectedTx(null);
      }
    } catch (error) {
      toast.error("Verification failed");
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-10 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900">
              {isStaff ? "Finance" : "My Payments"}
            </h1>
            <p className="text-slate-500 font-medium">
              {isStaff ? "Manage payments and verification" : "View your transaction history"}
            </p>
          </div>
          <button 
            onClick={load} 
            className="px-6 py-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm font-bold text-sm"
          >
            Refresh
          </button>
        </header>

        {/* Transactions Table */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400 border-b">Transaction</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400 border-b">Amount</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400 border-b">Status</th>
                  <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest text-slate-400 border-b">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr><td colSpan="4" className="py-20 text-center text-slate-400 italic">Loading records...</td></tr>
                ) : transactions.length === 0 ? (
                  <tr><td colSpan="4" className="py-20 text-center text-slate-400 italic">No transactions found</td></tr>
                ) : transactions.map((t) => (
                  <tr key={t._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${t.direction === 'IN' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                          {t.direction === 'IN' ? <FiArrowDownLeft /> : <FiArrowUpRight />}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{t.transactionRef || 'Txn'}</div>
                          <div className="text-[10px] font-black text-slate-400 uppercase">
                            {t.paymentMode} • {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className={`font-black ${t.direction === 'IN' ? 'text-slate-900' : 'text-rose-600'}`}>
                        {t.direction === 'OUT' ? '-' : '+'} {formatCurrency(t.amount)}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 text-[10px] font-black rounded-full uppercase ${
                        t.status === 'VERIFIED' || t.status === 'SUCCESS' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button 
                        onClick={() => setSelectedTx(t)}
                        className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-900 transition-all"
                      >
                        <FiInfo size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detail Drawer */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedTx(null)} />
          
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl p-8 flex flex-col">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black uppercase tracking-tight">Receipt Detail</h2>
              <button onClick={() => setSelectedTx(null)} className="p-2 hover:bg-slate-100 rounded-full"><FiX /></button>
            </div>

            <div className="space-y-6 flex-1 overflow-y-auto">
              <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Total Amount</p>
                <p className="text-3xl font-black text-slate-900">{formatCurrency(selectedTx.amount)}</p>
                <div className="mt-4 flex gap-4">
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase">Method</p>
                    <p className="text-xs font-bold">{selectedTx.paymentMode}</p>
                  </div>
                  <div className="border-r border-slate-200" />
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase">Ref ID</p>
                    <p className="text-xs font-bold">{selectedTx.transactionRef || "N/A"}</p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase mb-3">Transaction Proof</p>
                {selectedTx.proofUrl ? (
                  <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm group relative">
                    <img 
                      src={`${import.meta.env.VITE_API_BASE_URL}/${selectedTx.proofUrl}`} 
                      alt="Proof" 
                      className="w-full h-48 object-cover"
                    />
                    {/* Only show "Change Proof" if user is Staff */}
                    {isStaff && (
                      <label className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all cursor-pointer">
                         <span className="text-white font-black text-[10px] uppercase flex items-center gap-2">
                          <FiCamera /> Change Proof
                         </span>
                         <input type="file" className="hidden" onChange={handleUpload} />
                      </label>
                    )}
                  </div>
                ) : (
                  <div className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 rounded-2xl ${isStaff ? 'hover:bg-slate-50 cursor-pointer' : 'bg-slate-50'}`}>
                    <FiCamera className="text-slate-300 text-2xl mb-2" />
                    <span className="text-[10px] font-black text-slate-400 uppercase px-4 text-center">
                      {isStaff ? (uploading ? "Uploading..." : "Upload Receipt") : "No Receipt Uploaded Yet"}
                    </span>
                    {isStaff && <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons: Only visible for Staff */}
            {isStaff && selectedTx.status !== 'VERIFIED' && (
              <div className="pt-6 border-t mt-auto">
                <button 
                  onClick={() => handleVerify(selectedTx._id)}
                  className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
                >
                  <FiCheckCircle /> Verify Transaction
                </button>
              </div>
            )}
            
            {!isStaff && (
              <div className="pt-6 border-t mt-auto">
                <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Verified payments reflect here automatically
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}