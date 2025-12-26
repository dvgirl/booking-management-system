import { useState, useEffect } from "react";
import * as DocumentAPI from "../../api/document.api";
import { toast } from "react-toastify";
import { 
  FiFileText, 
  FiDownload, 
  FiUploadCloud, 
  FiCheckCircle, 
  FiLoader,
  FiShield
} from "react-icons/fi";

export default function DocumentManager({ booking }) {
  const [loading, setLoading] = useState(false);
  const [docs, setDocs] = useState([]);

  // 1. Fetch documents only if booking._id exists
  useEffect(() => {
    if (booking?._id) {
      fetchDocs();
    }
  }, [booking?._id]);

  const fetchDocs = async () => {
    try {
      const res = await DocumentAPI.getBookingDocuments(booking._id);
      setDocs(res.data || []);
    } catch (err) {
      console.error("Failed to load documents");
    }
  };

  const handleGeneratePDF = async () => {
    if (!booking?._id) return;
    
    try {
      setLoading(true);
      toast.info("Preparing your document...");
      
      const res = await DocumentAPI.generateDocument(booking._id);

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Confirmation_${booking.confirmationNumber || booking._id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success("PDF Generated Successfully");
      fetchDocs(); 
    } catch (error) {
      toast.error("Failed to generate PDF");
    } finally {
      setLoading(false);
    }
  };

  // 2. Defensive Guard: If booking is still undefined/null, show a loader instead of crashing
  if (!booking) {
    return (
      <div className="flex items-center justify-center p-12 bg-white rounded-[2rem] border border-slate-100">
        <FiLoader className="animate-spin text-slate-300 mr-2" />
        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Initialising Manager...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/30">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <FiShield className="text-blue-600" /> Guest Documents
          </h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
            {/* 3. Safe access using optional chaining */}
            Booking: {booking.confirmationNumber || booking._id?.slice(-8) || "N/A"}
          </p>
        </div>
        
        <button 
          onClick={handleGeneratePDF} 
          disabled={loading}
          className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all disabled:opacity-50 shadow-lg shadow-slate-200"
        >
          {loading ? <FiLoader className="animate-spin" /> : <FiFileText />}
          {loading ? "Generating..." : "Generate Confirmation PDF"}
        </button>
      </div>

      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Guest Info Summary */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Guest Details</h3>
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
               <div className="flex justify-between mb-3">
                 <span className="text-xs font-bold text-slate-500">Guest Name</span>
                 <span className="text-xs font-black text-slate-900">{booking.user?.name || "N/A"}</span>
               </div>
               <div className="flex justify-between mb-3">
                 <span className="text-xs font-bold text-slate-500">Room Number</span>
                 {/* 4. Safe access for roomId */}
                 <span className="text-xs font-black text-slate-900">{booking.roomNumber || booking.roomId?.roomNumber || "TBD"}</span>
               </div>
               <div className="flex justify-between">
                 <span className="text-xs font-bold text-slate-500">Stay Period</span>
                 <span className="text-[10px] font-black text-blue-600 uppercase">
                    {booking.checkIn ? new Date(booking.checkIn).toLocaleDateString() : "N/A"} - {booking.checkOut ? new Date(booking.checkOut).toLocaleDateString() : "N/A"}
                 </span>
               </div>
            </div>
          </div>

          {/* Document List */}
          <div>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Uploaded & Generated Files</h3>
            <div className="space-y-3">
              {docs.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-3xl">
                   <FiUploadCloud className="mx-auto text-slate-200 text-3xl mb-2" />
                   <p className="text-[10px] font-black text-slate-300 uppercase">No documents found</p>
                </div>
              ) : (
                docs.map((doc) => (
                  <div key={doc._id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-blue-100 transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <FiFileText size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-900 uppercase tracking-tight">{doc.documentType || doc.type}</p>
                        <p className="text-[9px] font-bold text-slate-400">{new Date(doc.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {doc.verificationStatus === 'VERIFIED' && (
                        <FiCheckCircle className="text-emerald-500" title="Verified" />
                      )}
                      <a 
                        href={`${import.meta.env.VITE_APP_API_BASE_URL}/${doc.fileUrl}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                      >
                        <FiDownload size={18} />
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}