import { useState, useEffect } from "react";
// Import the new GET function
import { submitKyc, getMyKycData } from "../../api/kyc.api";
import { useNavigate } from "react-router-dom";
import {
    User, Users, Baby, Upload, Trash2, Plus, ArrowLeft,
    CheckCircle, CreditCard, AlertCircle, FileText, Loader2, XCircle
} from "lucide-react";

export default function KycForm() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true); // New loading state for page load
    const [error, setError] = useState("");
    const [rejectionReason, setRejectionReason] = useState(null); // Store reason

    const [self, setSelf] = useState({
        name: "",
        dob: "",
        aadhaarNumber: "",
        aadhaarFile: null
    });
    const [spouse, setSpouse] = useState({ name: "" });
    const [children, setChildren] = useState([]);

    // --- NEW: Fetch Existing Data on Mount ---
    useEffect(() => {
        const loadData = async () => {
            try {
                const res = await getMyKycData();
                const data = res.data;

                // If the user is REJECTED, pre-fill the form
                if (data && data.status === "REJECTED") {
                    setRejectionReason(data.rejectionReason || "Documentation verification failed.");

                    // Pre-fill Self
                    if (data.self) {
                        setSelf(prev => ({
                            ...prev,
                            name: data.self.name || "",
                            // Format date to YYYY-MM-DD for input field
                            dob: data.self.dob ? new Date(data.self.dob).toISOString().split('T')[0] : "",
                            aadhaarNumber: data.self.aadhaarNumber || "",
                            // Note: We cannot pre-fill 'aadhaarFile' due to browser security
                        }));
                    }
                    // Pre-fill Spouse & Children
                    if (data.spouse) setSpouse({ name: data.spouse.name || "" });
                    if (data.children) setChildren(data.children || []);
                }
            } catch (err) {
                // It's okay if 404 (user hasn't submitted yet)
                console.log("No previous KYC data found.");
            } finally {
                setFetching(false);
            }
        };
        loadData();
    }, []);

    const validateAadhaar = (num) => /^\d{12}$/.test(num);
    const addChild = () => setChildren([...children, { name: "", dob: "" }]);
    const removeChild = (index) => setChildren(children.filter((_, i) => i !== index));

    const handleSubmit = async () => {
        setError("");

        // Validation
        if (!self.name || !self.dob || !self.aadhaarNumber) {
            setError("All Officer fields are required.");
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        // For Resubmission: Force file upload if it was rejected
        if (!self.aadhaarFile) {
            setError("Please re-upload your Aadhaar document for verification.");
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        if (!validateAadhaar(self.aadhaarNumber)) {
            setError("Please enter a valid 12-digit Aadhaar number.");
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            const last4 = self.aadhaarNumber.slice(-4);

            formData.append("self", JSON.stringify({
                name: self.name,
                dob: self.dob,
                aadhaarNumber: self.aadhaarNumber,
                aadhaarLast4: last4
            }));
            formData.append("spouse", JSON.stringify({ name: spouse.name }));
            formData.append("children", JSON.stringify(children));
            formData.append("selfAadhaar", self.aadhaarFile);

            await submitKyc(formData);

            // Forces a hard refresh to clear cache and update Context/Sidebar
            window.location.href = "/kyc/pending";

        } catch (err) {
            setError(err.response?.data?.message || "Failed to submit. Please try again.");
            setLoading(false);
        }
    };

    const inputWrapperStyle = "space-y-1.5";
    const labelStyle = "block text-sm font-semibold text-slate-700";
    const inputStyle = "w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all";
    const cardStyle = "bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 mb-6";
    const iconBoxStyle = (colorClass) => `p-2.5 rounded-lg ${colorClass} shadow-sm`;

    // Skeleton Loader while fetching existing data
    if (fetching) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="animate-spin text-indigo-600" size={32} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 font-sans antialiased text-slate-900">
            <div className="max-w-4xl mx-auto">

                {/* Header */}
                <div className="mb-8">
                    <button onClick={() => navigate("/dashboard")} className="group flex items-center text-slate-500 hover:text-indigo-600 transition-colors mb-4 text-sm font-medium">
                        <ArrowLeft size={18} className="mr-2" /> Back to Dashboard
                    </button>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                        {rejectionReason ? "Resubmit KYC Application" : "KYC Verification"}
                    </h1>
                </div>

                {/* --- NEW: Rejection Banner --- */}
                {rejectionReason && (
                    <div className="mb-8 p-5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-4 shadow-sm animate-fadeIn">
                        <XCircle className="text-red-600 shrink-0 mt-1" size={24} />
                        <div>
                            <h3 className="text-red-800 font-bold text-lg">Application Rejected</h3>
                            <p className="text-red-700 mt-1">
                                <strong>Admin Note:</strong> {rejectionReason}
                            </p>
                            <p className="text-red-600 text-sm mt-2 font-medium">
                                Please correct the details below and re-upload your document.
                            </p>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="mb-8 p-4 bg-orange-50 border border-orange-200 rounded-xl text-orange-800 flex items-center gap-3">
                        <AlertCircle size={20} /> {error}
                    </div>
                )}

                <div className="space-y-8">
                    {/* OFFICER SECTION */}
                    <section className={cardStyle}>
                        <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                            <div className={iconBoxStyle("bg-indigo-100 text-indigo-600")}><User size={24} /></div>
                            <h2 className="text-xl font-bold text-slate-800">Officer Information</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className={`${inputWrapperStyle} md:col-span-2`}>
                                <label className={labelStyle}>Full Name <span className="text-red-500">*</span></label>
                                <input placeholder="Enter full name" className={inputStyle} value={self.name} onChange={(e) => setSelf({ ...self, name: e.target.value })} />
                            </div>

                            <div className={`${inputWrapperStyle} md:col-span-2`}>
                                <label className={labelStyle}>Aadhaar Number <span className="text-red-500">*</span></label>
                                <div className="relative group">
                                    <input type="text" maxLength="12" placeholder="0000 0000 0000" className={`${inputStyle} pl-11 tracking-widest font-mono`} value={self.aadhaarNumber} onChange={(e) => setSelf({ ...self, aadhaarNumber: e.target.value.replace(/\D/g, "") })} />
                                    <CreditCard size={20} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                </div>
                            </div>

                            <div className={inputWrapperStyle}>
                                <label className={labelStyle}>Date of Birth <span className="text-red-500">*</span></label>
                                <input type="date" className={inputStyle} value={self.dob} onChange={(e) => setSelf({ ...self, dob: e.target.value })} />
                            </div>

                            <div className={inputWrapperStyle}>
                                <label className={labelStyle}>
                                    {rejectionReason ? "Re-upload Aadhaar Document" : "Upload Aadhaar Document"}
                                    <span className="text-red-500">*</span>
                                </label>
                                <input id="self-aadhaar" type="file" className="hidden" accept=".pdf,image/*" onChange={(e) => setSelf({ ...self, aadhaarFile: e.target.files[0] })} />
                                <label htmlFor="self-aadhaar" className={`flex items-center justify-center w-full px-4 py-2.5 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200 ${self.aadhaarFile ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300 hover:border-indigo-400'}`}>
                                    {self.aadhaarFile ? (
                                        <><CheckCircle size={20} className="text-emerald-600 mr-2" /><span className="text-emerald-700">{self.aadhaarFile.name}</span></>
                                    ) : (
                                        <><Upload size={20} className="text-slate-400 mr-2" /><span className="text-slate-600">Click to Upload New File</span></>
                                    )}
                                </label>
                            </div>
                        </div>
                    </section>

                    {/* SPOUSE & CHILDREN SECTIONS (Same as before) */}
                    <section className={cardStyle}>
                        <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                            <div className={iconBoxStyle("bg-purple-100 text-purple-600")}><Users size={24} /></div>
                            <h2 className="text-xl font-bold text-slate-800">Spouse Details</h2>
                        </div>
                        <div className={inputWrapperStyle}>
                            <label className={labelStyle}>Spouse Name</label>
                            <input placeholder="Enter full name" className={inputStyle} value={spouse.name} onChange={(e) => setSpouse({ ...spouse, name: e.target.value })} />
                        </div>
                    </section>

                    <section className={cardStyle}>
                        <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                            <div className="flex items-center gap-3">
                                <div className={iconBoxStyle("bg-emerald-100 text-emerald-600")}><Baby size={24} /></div>
                                <h2 className="text-xl font-bold text-slate-800">Children</h2>
                            </div>
                            <button onClick={addChild} className="flex items-center px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-semibold border border-emerald-200"><Plus size={16} className="mr-1" /> Add Child</button>
                        </div>
                        <div className="space-y-4">
                            {children.map((child, i) => (
                                <div key={i} className="flex flex-col md:flex-row gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                                    <div className="flex-1"><label className="text-xs font-bold text-slate-500 uppercase">Name</label><input className={inputStyle} value={child.name} onChange={(e) => { const u = [...children]; u[i].name = e.target.value; setChildren(u); }} /></div>
                                    <div className="flex-1"><label className="text-xs font-bold text-slate-500 uppercase">DOB</label><input type="date" className={inputStyle} value={child.dob} onChange={(e) => { const u = [...children]; u[i].dob = e.target.value; setChildren(u); }} /></div>
                                    <div className="flex items-end"><button onClick={() => removeChild(i)} className="p-3 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={20} /></button></div>
                                </div>
                            ))}
                            {children.length === 0 && <p className="text-center text-slate-400 py-4">No children added.</p>}
                        </div>
                    </section>

                    {/* ACTIONS */}
                    <div className="flex flex-col-reverse sm:flex-row gap-4 pb-12">
                        <button onClick={() => navigate("/dashboard")} className="px-8 py-3.5 bg-white text-slate-700 font-bold rounded-xl border border-slate-300">Cancel</button>
                        <button onClick={handleSubmit} disabled={loading} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-lg flex items-center justify-center gap-2">
                            {loading ? <Loader2 className="animate-spin" /> : <CheckCircle />}
                            {rejectionReason ? "Resubmit Application" : "Submit Verification"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}