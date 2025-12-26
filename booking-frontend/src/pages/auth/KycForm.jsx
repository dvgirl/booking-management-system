import { useState } from "react";
import { submitKyc } from "../../api/kyc.api";
import { useNavigate } from "react-router-dom";
import { User, Users, Baby, Upload, Trash2, Plus, ArrowLeft, CheckCircle } from "lucide-react";

export default function KycForm() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [self, setSelf] = useState({ name: "", dob: "", aadhaarFile: null });
    const [spouse, setSpouse] = useState({ name: "", aadhaarFile: null });
    const [children, setChildren] = useState([]);

    const addChild = () => setChildren([...children, { name: "", dob: "" }]);
    const removeChild = (index) => setChildren(children.filter((_, i) => i !== index));

    const handleSubmit = async () => {
        setError("");
        if (!self.name || !self.dob || !self.aadhaarFile) {
            setError("Please fill all required fields for the Officer section.");
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("self", JSON.stringify({ name: self.name, dob: self.dob }));
            formData.append("spouse", JSON.stringify({ name: spouse.name }));
            formData.append("children", JSON.stringify(children));
            formData.append("selfAadhaar", self.aadhaarFile);
            if (spouse.aadhaarFile) formData.append("spouseAadhaar", spouse.aadhaarFile);

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
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
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
                        <p className="text-gray-500 mt-1">Please provide accurate information for verification.</p>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg text-red-700 flex items-center shadow-sm">
                        <span className="text-sm font-medium">{error}</span>
                    </div>
                )}

                <div className="space-y-6">
                    {/* Officer Section */}
                    <section className={cardStyle}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><User size={20} /></div>
                            <h2 className="text-xl font-bold text-gray-800">Officer Information</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className={labelStyle}>Full Name <span className="text-red-500">*</span></label>
                                <input
                                    placeholder="John Doe"
                                    className={inputStyle}
                                    value={self.name}
                                    onChange={(e) => setSelf({ ...self, name: e.target.value })}
                                />
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
                                <label className={labelStyle}>Aadhaar Document <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <input
                                        id="self-aadhaar"
                                        type="file"
                                        className="hidden"
                                        onChange={(e) => setSelf({ ...self, aadhaarFile: e.target.files[0] })}
                                    />
                                    <label htmlFor="self-aadhaar" className="flex items-center justify-center w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all">
                                        <Upload size={18} className="text-gray-400 mr-2" />
                                        <span className="text-sm text-gray-600 truncate">
                                            {self.aadhaarFile ? self.aadhaarFile.name : "Upload Aadhaar PDF/Image"}
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Spouse Section */}
                    <section className={cardStyle}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><Users size={20} /></div>
                            <h2 className="text-xl font-bold text-gray-800">Spouse Details <span className="text-sm font-normal text-gray-400 ml-2">(Optional)</span></h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={labelStyle}>Spouse Name</label>
                                <input
                                    placeholder="Spouse Name"
                                    className={inputStyle}
                                    value={spouse.name}
                                    onChange={(e) => setSpouse({ ...spouse, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className={labelStyle}>Spouse Aadhaar</label>
                                <input
                                    id="spouse-aadhaar"
                                    type="file"
                                    className="hidden"
                                    onChange={(e) => setSpouse({ ...spouse, aadhaarFile: e.target.files[0] })}
                                />
                                <label htmlFor="spouse-aadhaar" className="flex items-center justify-center w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-all">
                                    <Upload size={18} className="text-gray-400 mr-2" />
                                    <span className="text-sm text-gray-600 truncate">
                                        {spouse.aadhaarFile ? spouse.aadhaarFile.name : "Upload Document"}
                                    </span>
                                </label>
                            </div>
                        </div>
                    </section>

                    {/* Children Section */}
                    <section className={cardStyle}>
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 text-green-600 rounded-lg"><Baby size={20} /></div>
                                <h2 className="text-xl font-bold text-gray-800">Children</h2>
                            </div>
                            <button 
                                onClick={addChild} 
                                className="inline-flex items-center px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition-colors text-sm font-semibold"
                            >
                                <Plus size={16} className="mr-1" /> Add Child
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            {children.map((child, i) => (
                                <div key={i} className="flex flex-col md:flex-row gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 animate-in fade-in slide-in-from-top-2">
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
                                        <label className={labelStyle}>Date of Birth</label>
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
                                        <button
                                            onClick={() => removeChild(i)}
                                            className="p-2.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200"
                                            title="Remove"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {children.length === 0 && (
                                <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
                                    <p className="text-gray-400 text-sm">No children added yet.</p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-4 pb-12">
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-blue-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <><CheckCircle size={20} /> Submit KYC Application</>
                            )}
                        </button>
                        <button
                            onClick={() => navigate("/dashboard")}
                            className="px-8 py-3 bg-white text-gray-700 font-semibold rounded-xl border border-gray-300 hover:bg-gray-50 transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}