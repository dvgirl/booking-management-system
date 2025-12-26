import { useState } from "react";
import { generateDocument } from "../../api/document.api";
import { toast } from "react-toastify";
import { 
  FiFileText, 
  FiDownload, 
  FiUser, 
  FiCalendar, 
  FiInfo, 
  FiLoader 
} from "react-icons/fi";

export default function DocumentGenerate({ booking }) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      
      // Ensure your API call includes { responseType: 'blob' }
      const res = await generateDocument(booking._id);

      // Create a Blob from the PDF Stream
      const file = new Blob([res.data], { type: "application/pdf" });
      
      // Build a temporary URL
      const fileURL = URL.createObjectURL(file);
      
      // Create a hidden link and trigger download
      const link = document.createElement("a");
      link.href = fileURL;
      link.setAttribute("download", `Confirmation_${booking.confirmationNumber || booking._id.slice(-6)}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      link.remove();
      URL.revokeObjectURL(fileURL);
      
      toast.success("Document downloaded successfully");
    } catch (error) {
      console.error("PDF Generation Error:", error);
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden max-w-md">
      {/* Visual Header */}
      <div className="bg-slate-900 p-6 text-white">
        <div className="flex items-center gap-3 mb-1">
          <FiFileText className="text-blue-400 text-xl" />
          <h2 className="text-lg font-black tracking-tight uppercase">Guest Document</h2>
        </div>
        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
          Official Confirmation Receipt
        </p>
      </div>

      <div className="p-6">
        {/* Booking Brief */}
        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
              <FiUser size={16} />
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase">Guest Name</p>
              <p className="text-sm font-bold text-slate-800">{booking.user?.name || "Unknown Guest"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
              <FiCalendar size={16} />
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase">Stay Duration</p>
              <p className="text-sm font-bold text-slate-800">
                {new Date(booking.checkIn).toLocaleDateString()} — {new Date(booking.checkOut).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Info Note */}
        <div className="flex gap-3 p-4 bg-blue-50/50 rounded-2xl border border-blue-100 mb-6">
          <FiInfo className="text-blue-500 shrink-0 mt-1" size={14} />
          <p className="text-[11px] text-blue-700 leading-relaxed font-medium">
            Generating this PDF will create an official booking confirmation containing room details and payment status.
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all ${
            isGenerating 
            ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
            : "bg-blue-600 text-white hover:bg-slate-900 shadow-lg shadow-blue-100 active:scale-95"
          }`}
        >
          {isGenerating ? (
            <>
              <FiLoader className="animate-spin" /> Processing...
            </>
          ) : (
            <>
              <FiDownload /> Download PDF
            </>
          )}
        </button>
      </div>
    </div>
  );
}