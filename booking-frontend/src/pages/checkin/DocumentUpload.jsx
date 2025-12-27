import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { useState } from "react";
import { uploadDocuments, confirmCheckIn } from "../../api/checkin.api";
import { toast } from "react-toastify";
import { FiFileText, FiUploadCloud, FiX, FiCheckCircle, FiChevronLeft } from "react-icons/fi";

export default function DocumentUpload() {
    const { state } = useLocation();
    const navigate = useNavigate();
    const [docs, setDocs] = useState([]);
    const [uploading, setUploading] = useState(false);

    // Guard clause if state is missing
    if (!state?._id) return <Navigate to="/checkin/history" />;

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        setDocs((prev) => [...prev, ...selectedFiles]);
    };

    const removeFile = (index) => {
        setDocs(docs.filter((_, i) => i !== index));
    };

    const handleFinalCheckIn = async () => {
        if (docs.length === 0) {
            toast.error("Please upload at least one ID document.");
            return;
        }

        try {
            setUploading(true);
            const formData = new FormData();
            docs.forEach(d => formData.append("documents", d));

            // 1. Upload Docs
            await uploadDocuments(state._id, formData);
            // 2. Finalize Check-in Status
            await confirmCheckIn(state._id);

            toast.success("Check-in completed successfully!");
            navigate("/dashboard");
        } catch (error) {
            console.error(error);
            toast.error("Failed to complete check-in. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Navigation & Title */}
            <div className="flex flex-col gap-4">
                <button 
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors w-fit"
                >
                    <FiChevronLeft /> Back to Details
                </button>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Final Confirmation</h1>
                <p className="text-slate-500 font-medium">Upload physical ID scans or digital documents to authorize check-in for <span className="text-slate-900 font-bold">Room {state.roomId?.roomNumber || "N/A"}</span>.</p>
            </div>

            {/* Upload Zone */}
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem] p-12 text-center hover:border-indigo-400 transition-all group relative">
                <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={uploading}
                />
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                        <FiUploadCloud size={32} />
                    </div>
                    <div>
                        <p className="text-sm font-black text-slate-900 uppercase tracking-widest">Click or Drag ID Documents</p>
                        <p className="text-xs text-slate-400 mt-1 font-medium">Supported: JPG, PNG, PDF (Max 5MB each)</p>
                    </div>
                </div>
            </div>

            {/* File List Preview */}
            {docs.length > 0 && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Ready for upload ({docs.length})</p>
                    <div className="grid grid-cols-1 gap-2">
                        {docs.map((file, index) => (
                            <div key={index} className="flex items-center justify-between bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <FiFileText className="text-indigo-600 shrink-0" />
                                    <span className="text-sm font-bold text-slate-700 truncate">{file.name}</span>
                                    <span className="text-[10px] text-slate-300 font-mono">{(file.size / 1024).toFixed(0)} KB</span>
                                </div>
                                <button 
                                    onClick={() => removeFile(index)}
                                    className="p-2 hover:bg-rose-50 text-slate-300 hover:text-rose-500 rounded-lg transition-colors"
                                >
                                    <FiX />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Action Button */}
            <div className="pt-6">
                <button 
                    onClick={handleFinalCheckIn} 
                    disabled={uploading || docs.length === 0}
                    className="group relative w-full bg-slate-900 hover:bg-indigo-600 text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95 disabled:opacity-30 disabled:grayscale"
                >
                    {uploading ? (
                        <div className="flex items-center justify-center gap-3">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span>Finalizing Stay...</span>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center gap-2">
                            <FiCheckCircle />
                            <span>Confirm & Complete Check-In</span>
                        </div>
                    )}
                </button>
                <p className="text-center text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-6">
                    By clicking, you confirm that all guest details have been verified.
                </p>
            </div>
        </div>
    );
}