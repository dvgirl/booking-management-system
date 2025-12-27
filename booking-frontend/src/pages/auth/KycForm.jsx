import { useState } from "react";
import { submitKyc } from "../../api/kyc.api";
import { useNavigate } from "react-router-dom";
import { User, Users, Baby, Upload, Trash2, Plus, ArrowLeft, CheckCircle, CreditCard } from "lucide-react";

export default function KycForm() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // State: Added 'aadhaarNumber' to self
    const [self, setSelf] = useState({ 
        name: "", 
        dob: "", 
        aadhaarNumber: "", 
        aadhaarFile: null 
    });
    const [spouse, setSpouse] = useState({ name: "" });
    const [children, setChildren] = useState([]);

    const addChild = () => setChildren([...children, { name: "", dob: "" }]);
    const removeChild = (index) => setChildren(children.filter((_, i) => i !== index));

    // Aadhaar Validation: 12 digits only
    const validateAadhaar = (num) => /^\d{12}$/.test(num);

    const handleSubmit = async () => {
        setError("");
        
        // 1. Mandatory Field Validation
        if (!self.name || !self.dob || !self.aadhaarNumber || !self.aadhaarFile) {
            setError("All Officer fields and the Aadhaar document are required.");
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        // 2. Aadhaar Number Format Validation
        if (!validateAadhaar(self.aadhaarNumber)) {
            setError("Please enter a valid 12-digit Aadhaar number.");
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            
            // Extract last 4 digits for the backend 'aadhaarLast4' field if needed
            const last4 = self.aadhaarNumber.slice(-4);

            // Append Metadata (Adding aadhaarNumber to the JSON object)
            formData.append("self", JSON.stringify({ 
                name: self.name, 
                dob: self.dob,
                aadhaarNumber: self.aadhaarNumber,
                aadhaarLast4: last4 
            }));
            formData.append("spouse", JSON.stringify({ name: spouse.name }));
            formData.append("children", JSON.stringify(children));

            // Append the single Aadhaar File
            formData.append("selfAadhaar", self.aadhaarFile);

            await submitKyc(formData);
            navigate("/kyc/pending");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to submit. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-700 bg-white";
    const labelStyle = "block text-sm font-semibold text-gray-600 mb-1.5";
    const cardStyle = "bg-white rounded-xl shadow-sm border border-gray-100 p-5 md:p-8 mb-6";

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 antialiased">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <button 
                            onClick={() => navigate("/dashboard")}
                            className="flex items-center text-gray-500 hover:text-gray-700 transition-colors mb-2 text-sm font-medium"
                        >
                            <ArrowLeft size={16} className="mr-1" /> Back to Dashboard
                        </button>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">KYC Verification</h1>
                        <p className="text-gray-500 mt-1">Submit your details for verification.</p>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg text-red-700 flex items-center shadow-sm">
                        <span className="text-sm font-medium">{error}</span>
                    </div>
                )}

                <div className="space-y-6">
                    {/* OFFICER SECTION */}
                    <section className={cardStyle}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><User size={20} /></div>
                            <h2 className="text-xl font-bold text-gray-800">Officer Information</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className={labelStyle}>Full Name <span className="text-red-500">*</span></label>
                                <input
                                    placeholder="Full Name as per Aadhaar"
                                    className={inputStyle}
                                    value={self.name}
                                    onChange={(e) => setSelf({ ...self, name: e.target.value })}
                                />
                            </div>
                            
                            {/* AADHAAR NUMBER INPUT */}
                            <div className="md:col-span-2">
                                <label className={labelStyle}>Aadhaar Number <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        maxLength="12"
                                        placeholder="1234 5678 9012"
                                        className={`${inputStyle} pl-10`}
                                        value={self.aadhaarNumber}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, ""); // Only allow digits
                                            setSelf({ ...self, aadhaarNumber: val });
                                        }}
                                    />
                                    <CreditCard size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                </div>
                                <p className="mt-1 text-xs text-gray-400">Enter your 12-digit Aadhaar number without spaces.</p>
                            </div>

                            <div>
                                <label className={labelStyle}>Date of Birth <span className="text-red-500">*</span></label>
                                <input
                                    type="date"
                                    className={inputStyle}
                                    value={self.dob}
                                    onChange={(e) => setSelf({ ...self, dob: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className={labelStyle}>Upload Aadhaar <span className="text-red-500">*</span></label>
                                <input
                                    id="self-aadhaar"
                                    type="file"
                                    className="hidden"
                                    accept=".pdf,image/*"
                                    onChange={(e) => setSelf({ ...self, aadhaarFile: e.target.files[0] })}
                                />
                                <label htmlFor="self-aadhaar" className="flex items-center justify-center w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all group">
                                    <Upload size={18} className="text-gray-400 mr-2 group-hover:text-blue-500" />
                                    <span className="text-sm text-gray-600 truncate">
                                        {self.aadhaarFile ? self.aadhaarFile.name : "Choose File"}
                                    </span>
                                </label>
                            </div>
                        </div>
                    </section>

                    {/* SPOUSE SECTION */}
                    <section className={cardStyle}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><Users size={20} /></div>
                            <h2 className="text-xl font-bold text-gray-800">Spouse Details <span className="text-sm font-normal text-gray-400 ml-2">(Optional)</span></h2>
                        </div>
                        <label className={labelStyle}>Spouse Name</label>
                        <input
                            placeholder="Full Name"
                            className={inputStyle}
                            value={spouse.name}
                            onChange={(e) => setSpouse({ ...spouse, name: e.target.value })}
                        />
                    </section>

                    {/* CHILDREN SECTION */}
                    <section className={cardStyle}>
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 text-green-600 rounded-lg"><Baby size={20} /></div>
                                <h2 className="text-xl font-bold text-gray-800">Children</h2>
                            </div>
                            <button onClick={addChild} className="inline-flex items-center px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition-colors text-sm font-semibold">
                                <Plus size={16} className="mr-1" /> Add Child
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            {children.map((child, i) => (
                                <div key={i} className="flex flex-col md:flex-row gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="flex-1">
                                        <label className={labelStyle}>Name</label>
                                        <input
                                            placeholder="Child's Name"
                                            className={inputStyle}
                                            value={child.name}
                                            onChange={(e) => {
                                                const updated = [...children];
                                                updated[i].name = e.target.value;
                                                setChildren(updated);
                                            }}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className={labelStyle}>DOB</label>
                                        <input
                                            type="date"
                                            className={inputStyle}
                                            value={child.dob}
                                            onChange={(e) => {
                                                const updated = [...children];
                                                updated[i].dob = e.target.value;
                                                setChildren(updated);
                                            }}
                                        />
                                    </div>
                                    <div className="flex items-end">
                                        <button onClick={() => removeChild(i)} className="p-2.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200">
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {children.length === 0 && (
                                <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-xl bg-white/50 text-gray-400 text-sm">
                                    No children added.
                                </div>
                            )}
                        </div>
                    </section>

                    {/* ACTIONS */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-4 pb-12">
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <><CheckCircle size={20} /> Submit KYC</>}
                        </button>
                        <button onClick={() => navigate("/dashboard")} className="px-8 py-3.5 bg-white text-gray-700 font-semibold rounded-xl border border-gray-300 hover:bg-gray-50 transition-all">
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}