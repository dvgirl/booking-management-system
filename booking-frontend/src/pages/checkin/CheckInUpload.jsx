import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { useState } from "react";
import axios from "../../api/axios";
import { toast } from "react-toastify";
import { FiUser, FiHeart, FiSmile, FiPlus, FiUpload, FiCheckCircle, FiInfo } from "react-icons/fi";

export default function CheckInUpload() {
    const { state: booking } = useLocation();
    const navigate = useNavigate();

    if (!booking) return <Navigate to="/checkin/search" />;

    const [loading, setLoading] = useState(false);
    const [self, setSelf] = useState({ name: "" });
    const [spouse, setSpouse] = useState({ name: "" });
    const [children, setChildren] = useState([]);

    const [selfFile, setSelfFile] = useState(null);
    const [spouseFile, setSpouseFile] = useState(null);
    const [childrenFiles, setChildrenFiles] = useState([]);

    const addChild = () => setChildren([...children, { name: "" }]);

    const submitKyc = async () => {
        if (!self.name || !selfFile) {
            toast.error("Self name and Aadhaar are required");
            return;
        }

        try {
            setLoading(true);
            const formData = new FormData();
            formData.append("self", JSON.stringify(self));
            formData.append("selfAadhaar", selfFile);

            if (spouse.name && spouseFile) {
                formData.append("spouse", JSON.stringify(spouse));
                formData.append("spouseAadhaar", spouseFile);
            }

            if (children.length > 0) {
                formData.append("children", JSON.stringify(children));
                childrenFiles.forEach(file => formData.append("childrenAadhaar", file));
            }

            await axios.post("/kyc/submit", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            toast.success("KYC records registered successfully.");
            navigate("/checkin/details", { state: booking });
        } catch (error) {
            toast.error("KYC submission failed");
        } finally {
            setLoading(false);
        }
    };

    const FileInput = ({ label, onChange, file, id }) => (
        <div className="mt-4">
            <label htmlFor={id} className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-all group">
                {file ? (
                    <div className="flex flex-col items-center gap-1">
                        <FiCheckCircle className="text-emerald-500 text-2xl" />
                        <span className="text-[10px] font-black uppercase text-slate-500">{file.name.slice(0, 20)}...</span>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2">
                        <FiUpload className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span>
                    </div>
                )}
                <input id={id} type="file" className="hidden" onChange={onChange} />
            </label>
        </div>
    );

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Identity Registry</h1>
                <p className="text-slate-500 font-medium mt-1">Please provide identification for all guests staying in Room {booking.roomId?.roomNumber}.</p>
            </div>

            {/* Quick Summary Card */}
            <div className="bg-indigo-600 rounded-[2rem] p-8 text-white flex flex-col md:flex-row justify-between items-center gap-6 shadow-xl shadow-indigo-200">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                        <FiInfo size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Active Booking</p>
                        <h2 className="text-xl font-bold">{booking.userId?.phone}</h2>
                    </div>
                </div>
                <div className="text-right hidden md:block">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Check-in Date</p>
                    <p className="font-bold">{new Date(booking.checkIn).toDateString()}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {/* PRIMARY GUEST */}
                <Section icon={<FiUser />} title="Primary Guest (Self)" subtitle="Required for legal check-in">
                    <input
                        placeholder="Legal Full Name"
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                        onChange={e => setSelf({ name: e.target.value })}
                    />
                    <FileInput id="self-up" label="Upload Aadhaar / ID" file={selfFile} onChange={e => setSelfFile(e.target.files[0])} />
                </Section>

                {/* SPOUSE */}
                <Section icon={<FiHeart />} title="Spouse" subtitle="Optional accompaniment">
                    <input
                        placeholder="Spouse Full Name"
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                        onChange={e => setSpouse({ name: e.target.value })}
                    />
                    <FileInput id="spouse-up" label="Upload ID Card" file={spouseFile} onChange={e => setSpouseFile(e.target.files[0])} />
                </Section>

                {/* CHILDREN */}
                <Section icon={<FiSmile />} title="Children" subtitle="Minor identification">
                    <div className="space-y-6">
                        {children.map((child, index) => (
                            <div key={index} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <input
                                    placeholder="Child Name"
                                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold mb-3"
                                    onChange={e => {
                                        const updated = [...children];
                                        updated[index].name = e.target.value;
                                        setChildren(updated);
                                    }}
                                />
                                <FileInput 
                                    id={`child-${index}`} 
                                    label="Upload Document" 
                                    file={childrenFiles[index]} 
                                    onChange={e => {
                                        const files = [...childrenFiles];
                                        files[index] = e.target.files[0];
                                        setChildrenFiles(files);
                                    }} 
                                />
                            </div>
                        ))}
                        <button onClick={addChild} className="flex items-center justify-center gap-2 w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:border-indigo-400 hover:text-indigo-600 transition-all">
                            <FiPlus /> Add Another Child
                        </button>
                    </div>
                </Section>
            </div>

            <button
                onClick={submitKyc}
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-indigo-600 text-white py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95 disabled:opacity-50"
            >
                {loading ? "Processing Documents..." : "Finalize Registration"}
            </button>
        </div>
    );
}

function Section({ icon, title, subtitle, children }) {
    return (
        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500">
                    {icon}
                </div>
                <div>
                    <h3 className="text-lg font-black text-slate-900 tracking-tight leading-none">{title}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{subtitle}</p>
                </div>
            </div>
            {children}
        </div>
    );
}