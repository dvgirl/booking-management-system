import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import * as DocumentAPI from "../../api/document.api";
import { toast } from "react-toastify";
import { 
  FiFileText, 
  FiDownload, 
  FiUploadCloud, 
  FiCheckCircle, 
  FiLoader,
  FiShield,
  FiLock,
  FiArrowLeft,
  FiEye,
  FiUser,
  FiCalendar
} from "react-icons/fi";

export default function UnifiedDocumentManager({ booking }) {
  const [loading, setLoading] = useState(false);
  const [docs, setDocs] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null); // For the Previewer
  const [isGenerating, setIsGenerating] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // 1. Load Documents for this booking
  useEffect(() => {
    if (booking?._id) {
      fetchDocs();
    }
  }, [booking?._id]);

  const fetchDocs = async () => {
    try {
      setLoading(true);
      const res = await DocumentAPI.getBookingDocuments(booking._id);
      setDocs(res.data || []);
      // Auto-select the first document for preview if available
      if (res.data?.length > 0 && !selectedDoc) {
        handleSelectDoc(res.data[0]);
      }
    } catch (err) {
      toast.error("Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  // 2. Select Doc for Preview & Format URL
  const handleSelectDoc = (doc) => {
    const fullUrl = doc.fileUrl?.startsWith('http') 
      ? doc.fileUrl 
      : `${import.meta.env.VITE_APP_API_BASE_URL}/${doc.fileUrl}`;
    setSelectedDoc({ ...doc, fullUrl });
  };

  // 3. Generate New PDF Action
  const handleGeneratePDF = async () => {
    if (!booking?._id) return;
    try {
      setIsGenerating(true);
      toast.info("Generating official document...");
      const res = await DocumentAPI.generateDocument(booking._id);
      
      // Automatic download trigger
      const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Confirmation_${booking.confirmationNumber || booking._id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success("PDF Generated & Saved");
      fetchDocs(); 
    } catch (error) {
      toast.error("Generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  // 4. Verify/Lock Actions
  const handleVerify = async (docId) => {
    try {
      setActionLoading(true);
      await DocumentAPI.verifyDocument(docId);
      toast.success("Document Verified");
      fetchDocs();
    } catch (err) { toast.error("Verification failed"); }
    finally { setActionLoading(false); }
  };

  const handleLock = async (docId) => {
    if (!window.confirm("Permanent lock? This cannot be undone.")) return;
    try {
      setActionLoading(true);
      await DocumentAPI.lockDocument(docId);
      toast.success("Document Locked");
      fetchDocs();
    } catch (err) { toast.error("Locking failed"); }
    finally { setActionLoading(false); }
  };

  // Guard Clause
  if (!booking) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <FiLoader className="animate-spin text-blue-600 mr-2" />
        <p className="text-xs font-black uppercase text-slate-400">Loading Booking Context...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
      {/* HEADER SECTION */}
      <header className="bg-white border-b border-slate-200 p-6 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-100">
            <FiShield size={20} />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900 uppercase tracking-tight">Document Vault</h1>
            <p className="text-[10px] font-bold text-slate-400">REF: {booking.confirmationNumber || booking._id?.slice(-8)}</p>
          </div>
        </div>

        <button 
          onClick={handleGeneratePDF}
          disabled={isGenerating}
          className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all disabled:opacity-50"
        >
          {isGenerating ? <FiLoader className="animate-spin" /> : <FiFileText />}
          {isGenerating ? "Processing..." : "Generate New Confirmation"}
        </button>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex flex-1 overflow-hidden">
        
        {/* LEFT: DOCUMENT LIST & GUEST INFO */}
        <aside className="w-96 border-r border-slate-200 bg-white overflow-y-auto p-6 flex flex-col gap-6">
          
          {/* Guest Summary Card */}
          <section className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Guest Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-xs"><span className="text-slate-500">Name</span><span className="font-bold">{booking.user?.name}</span></div>
              <div className="flex justify-between text-xs"><span className="text-slate-500">Room</span><span className="font-bold">{booking.roomNumber || "TBD"}</span></div>
            </div>
          </section>

          {/* List of Files */}
          <section className="flex-1">
            <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Files ({docs.length})</h3>
            <div className="space-y-2">
              {docs.map((doc) => (
                <div 
                  key={doc._id}
                  onClick={() => handleSelectDoc(doc)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between group ${
                    selectedDoc?._id === doc._id ? "border-blue-600 bg-blue-50/30" : "border-slate-100 hover:border-blue-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <FiFileText className={selectedDoc?._id === doc._id ? "text-blue-600" : "text-slate-400"} />
                    <div>
                      <p className="text-[11px] font-black text-slate-900 uppercase leading-none mb-1">{doc.documentType || "PDF Doc"}</p>
                      <p className="text-[9px] font-bold text-slate-400">{new Date(doc.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  {doc.verificationStatus === 'VERIFIED' && <FiCheckCircle className="text-emerald-500" />}
                </div>
              ))}
            </div>
          </section>
        </aside>

        {/* CENTER: PREVIEWER */}
        <section className="flex-1 bg-slate-200 p-8 overflow-hidden flex flex-col items-center">
          {selectedDoc ? (
            <div className="w-full h-full bg-white shadow-2xl rounded-sm border border-slate-300 relative">
              <iframe 
                src={`${selectedDoc.fullUrl}#toolbar=0`} 
                className="w-full h-full" 
                title="Preview" 
              />
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <FiUploadCloud size={48} className="mb-4 opacity-20" />
              <p className="text-xs font-black uppercase tracking-widest">Select a document to preview</p>
            </div>
          )}
        </section>

        {/* RIGHT: METADATA & ACTIONS */}
        {selectedDoc && (
          <aside className="w-80 bg-white border-l border-slate-200 p-6 flex flex-col gap-6">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Document Details</h3>
            
            <div className="space-y-4 flex-1">
              <MetaItem label="Status" value={selectedDoc.verificationStatus} isStatus />
              <MetaItem label="Type" value={selectedDoc.documentType} />
              <MetaItem label="Source" value={selectedDoc.source || "System Generated"} />
              
              <div className="pt-4 border-t border-slate-50">
                <a 
                  href={selectedDoc.fullUrl} download target="_blank" rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[10px] font-black uppercase transition-all"
                >
                  <FiDownload /> Download File
                </a>
              </div>
            </div>

            <div className="space-y-2">
              <button
                disabled={selectedDoc.verificationStatus === "VERIFIED" || actionLoading}
                onClick={() => handleVerify(selectedDoc._id)}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black uppercase disabled:opacity-30"
              >
                {selectedDoc.verificationStatus === "VERIFIED" ? "Verified" : "Verify This Doc"}
              </button>
              
              <button
                disabled={selectedDoc.locked || actionLoading}
                onClick={() => handleLock(selectedDoc._id)}
                className={`w-full py-3 rounded-xl text-[10px] font-black uppercase transition-all ${
                  selectedDoc.locked ? "bg-slate-100 text-slate-400" : "text-rose-600 border border-rose-100 hover:bg-rose-600 hover:text-white"
                }`}
              >
                <FiLock className="inline mr-2" /> {selectedDoc.locked ? "Locked" : "Lock Permanently"}
              </button>
            </div>
          </aside>
        )}
      </main>
    </div>
  );
}

// Reusable Sub-component for Metadata
function MetaItem({ label, value, isStatus }) {
  return (
    <div>
      <p className="text-[9px] font-black text-slate-300 uppercase mb-1">{label}</p>
      <p className={`text-xs font-black ${isStatus && value === 'VERIFIED' ? 'text-emerald-600' : 'text-slate-900'}`}>
        {value || "N/A"}
      </p>
    </div>
  );
}