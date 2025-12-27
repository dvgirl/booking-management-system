import { useState, useEffect } from "react";
import * as DocumentAPI from "../../api/document.api";
import { toast } from "react-toastify";
import { 
  FiFileText, FiDownload, FiUploadCloud, FiCheckCircle, 
  FiLoader, FiShield, FiLock, FiSearch, FiActivity, 
  FiPlus, FiX, FiPaperclip, FiExternalLink, FiUser 
} from "react-icons/fi";

export default function MasterDocumentVault() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);

  const [uploadData, setUploadData] = useState({
    bookingId: "",
    userId: "",
    documentType: "KYC",
    source: "ADMIN_UPLOAD",
    verificationStatus: "PENDING",
    isOffline: false,
    remarks: ""
  });

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await DocumentAPI.getAllDocuments(); 
      const data = res.data || [];
      setDocs(data);
      if (data.length > 0 && !selectedDoc) selectAndFormatDoc(data[0]);
    } catch (err) {
      toast.error("API Connection Failed");
    } finally {
      setLoading(false);
    }
  };

  const selectAndFormatDoc = (doc) => {
    const baseUrl = import.meta.env.VITE_APP_API_BASE_URL || "http://3.7.252.110:5000";
    const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const cleanPath = doc.fileUrl?.startsWith('/') ? doc.fileUrl : `/${doc.fileUrl}`;
    const fullUrl = doc.fileUrl?.startsWith('http') ? doc.fileUrl : `${cleanBase}${cleanPath}`;
    
    // Determine if file is image to handle rendering differently
    const isImage = /\.(jpg|jpeg|png|webp|avif|gif)$/i.test(fullUrl);
    setSelectedDoc({ ...doc, fullUrl, isImage });
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFile) return toast.error("Please select a file");

    const formData = new FormData();
    formData.append("file", uploadFile);
    formData.append("bookingId", uploadData.bookingId);
    formData.append("userId", uploadData.userId);
    formData.append("documentType", uploadData.documentType);
    formData.append("source", uploadData.source);
    formData.append("verificationStatus", uploadData.verificationStatus);
    formData.append("isOffline", uploadData.isOffline);
    formData.append("remarks", uploadData.remarks);

    try {
      setIsUploading(true);
      await DocumentAPI.uploadDocument(formData);
      toast.success("Document Archived Successfully");
      setShowUploadModal(false);
      setUploadFile(null);
      fetchDocuments();
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload Failed");
    } finally {
      setIsUploading(false);
    }
  };

  const filteredDocs = docs.filter(d => 
    d.documentType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.bookingId?._id?.includes(searchTerm)
  );

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden font-sans">
      {/* HEADER */}
      <header className="h-20 border-b border-slate-100 px-8 flex items-center justify-between bg-white shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg"><FiShield size={20} /></div>
          <div>
            <h1 className="text-sm font-black uppercase">Document Audit</h1>
            <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Vault Control</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
            <input 
              type="text" placeholder="Search Documents..." 
              className="w-full bg-slate-50 border-none rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold focus:ring-2 focus:ring-blue-500"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button onClick={() => setShowUploadModal(true)} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-[11px] font-black uppercase hover:bg-slate-900 transition-all shadow-lg"><FiPlus /> New Record</button>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden">
        {/* SIDEBAR */}
        <aside className="w-80 border-r border-slate-100 overflow-y-auto bg-white">
          <div className="p-4 bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">Document List</div>
          {filteredDocs.map((doc) => (
            <div 
              key={doc._id} onClick={() => selectAndFormatDoc(doc)}
              className={`p-5 cursor-pointer border-l-4 transition-all ${selectedDoc?._id === doc._id ? "bg-blue-50/50 border-blue-600" : "border-transparent hover:bg-slate-50"}`}
            >
              <p className="text-[11px] font-black uppercase text-slate-900">{doc.documentType?.replace('_', ' ')}</p>
              <div className="flex justify-between mt-1">
                <p className="text-[9px] font-bold text-slate-400 uppercase">{doc.source?.replace('_', ' ')}</p>
                {doc.isOffline && <span className="text-[8px] bg-rose-100 px-1.5 rounded text-rose-600 font-bold">OFFLINE</span>}
              </div>
            </div>
          ))}
        </aside>

        {/* --- FIXED VIEWER: IMAGE FILLS CONTAINER --- */}
        <section className="flex-1 bg-slate-200 flex flex-col items-stretch overflow-hidden">
          {selectedDoc ? (
            <div className="flex-1 flex flex-col h-full bg-white relative overflow-hidden">
              {/* Toolbar */}
              <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-slate-100 shrink-0">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Inspector Mode</span>
                  <div className="h-4 w-[1px] bg-slate-200"></div>
                  <span className="text-[10px] font-bold text-blue-600 truncate max-w-[200px]">{selectedDoc.fileUrl}</span>
                </div>
                <a href={selectedDoc.fullUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-900 hover:text-blue-600 transition-colors">
                  <FiExternalLink /> Full Screen
                </a>
              </div>

              {/* Media Container */}
              <div className="flex-1 w-full h-full relative bg-slate-50 overflow-auto flex items-center justify-center">
                {selectedDoc.isImage ? (
                  <img 
                    src={selectedDoc.fullUrl} 
                    alt="Document" 
                    className="max-w-full max-h-full w-auto h-auto object-contain shadow-2xl"
                  />
                ) : (
                  <iframe 
                    key={selectedDoc._id} 
                    src={`${selectedDoc.fullUrl}#toolbar=0`} 
                    className="w-full h-full border-none"
                    title="Preview" 
                  />
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50">
               <FiUploadCloud size={64} className="mb-4 opacity-10" />
               <p className="text-[11px] font-black uppercase tracking-[0.3em]">Vault Standby</p>
            </div>
          )}
        </section>

        {/* METADATA SIDEBAR */}
        {selectedDoc && (
          <aside className="w-80 border-l border-slate-100 p-8 space-y-8 overflow-y-auto bg-white">
            <div className="space-y-6">
              <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2"><FiActivity /> Properties</h3>
              <InfoBlock label="Verification" value={selectedDoc.verificationStatus} color={selectedDoc.verificationStatus === 'VERIFIED' ? 'text-emerald-500' : 'text-blue-500'} />
              <InfoBlock label="Doc Type" value={selectedDoc.documentType} />
              <InfoBlock label="Source" value={selectedDoc.source} />
              <InfoBlock label="Booking Ref" value={selectedDoc.bookingId?._id || "N/A"} />
              <InfoBlock label="User" value={selectedDoc.userId || "System"} />
              <InfoBlock label="Timestamp" value={new Date(selectedDoc.createdAt).toLocaleString()} />
              {selectedDoc.remarks && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[8px] font-black text-slate-300 uppercase mb-1">Remarks</p>
                  <p className="text-[11px] text-slate-600 italic font-medium">"{selectedDoc.remarks}"</p>
                </div>
              )}
            </div>

            <div className="pt-8 border-t border-slate-50 space-y-3">
              <button className="w-full py-4 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 shadow-lg shadow-emerald-50 transition-all">Verify Record</button>
              <button className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black shadow-lg transition-all">Lock Entry</button>
            </div>
          </aside>
        )}
      </main>

      {/* MODAL (Unchanged Logic, added Remarks & Schema Fields) */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-white">
               <h2 className="font-black uppercase text-sm tracking-tight flex items-center gap-2">Archiving New Document</h2>
               <button onClick={() => setShowUploadModal(false)} className="text-slate-300 hover:text-rose-500 transition-colors"><FiX size={24}/></button>
            </div>
            
            <form onSubmit={handleUploadSubmit} className="p-8 grid grid-cols-2 gap-6 bg-white">
                <div className="col-span-2 group relative border-2 border-dashed border-slate-200 rounded-3xl p-10 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer">
                  <input type="file" required className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setUploadFile(e.target.files[0])} />
                  <FiPaperclip className="mx-auto text-slate-300 text-3xl mb-3" />
                  <p className="text-[11px] font-black text-slate-500 uppercase">{uploadFile ? uploadFile.name : "Drop document here"}</p>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase ml-1 tracking-widest">Booking Ref</label>
                  <input type="text" required placeholder="MongoID..." className="w-full bg-slate-100 p-4 rounded-2xl text-xs font-bold border-none focus:ring-2 focus:ring-blue-500" onChange={(e) => setUploadData({...uploadData, bookingId: e.target.value})} />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase ml-1 tracking-widest">User ID</label>
                  <input type="text" placeholder="MongoID..." className="w-full bg-slate-100 p-4 rounded-2xl text-xs font-bold border-none focus:ring-2 focus:ring-blue-500" onChange={(e) => setUploadData({...uploadData, userId: e.target.value})} />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase ml-1 tracking-widest">Type</label>
                  <select className="w-full bg-slate-100 p-4 rounded-2xl text-[10px] font-black uppercase border-none" value={uploadData.documentType} onChange={(e) => setUploadData({...uploadData, documentType: e.target.value})}>
                    <option value="KYC">KYC</option>
                    <option value="BOOKING_CONFIRMATION">Booking Confirmation</option>
                    <option value="ENTRY_PASS">Entry Pass</option>
                    <option value="PAYMENT_PROOF">Payment Proof</option>
                    <option value="ID_SCAN">ID Scan</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase ml-1 tracking-widest">Source</label>
                  <select className="w-full bg-slate-100 p-4 rounded-2xl text-[10px] font-black uppercase border-none" value={uploadData.source} onChange={(e) => setUploadData({...uploadData, source: e.target.value})}>
                    <option value="ADMIN_UPLOAD">Admin Upload</option>
                    <option value="OFFLINE_SCAN">Offline Scan</option>
                    <option value="ONLINE_USER">Online User</option>
                  </select>
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase ml-1 tracking-widest">Internal Notes</label>
                  <textarea rows="3" className="w-full bg-slate-100 p-4 rounded-2xl text-xs font-bold border-none" placeholder="Context for verification..." onChange={(e) => setUploadData({...uploadData, remarks: e.target.value})}></textarea>
                </div>

                <button type="submit" disabled={isUploading} className="col-span-2 bg-blue-600 text-white py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-blue-100 hover:bg-slate-900 transition-all">
                  {isUploading ? <FiLoader className="animate-spin mx-auto"/> : "Archive & Sync Entry"}
                </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoBlock({ label, value, color = "text-slate-900" }) {
  return (
    <div>
      <p className="text-[9px] font-black text-slate-300 uppercase mb-1 tracking-tighter">{label}</p>
      <p className={`text-[11px] font-black uppercase tracking-tight ${color}`}>{value || "Pending..."}</p>
    </div>
  );
}