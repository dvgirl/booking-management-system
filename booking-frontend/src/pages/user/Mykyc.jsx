import { useEffect, useState, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import { toast } from "react-toastify";
import {
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    EyeIcon,
    ShieldCheckIcon,
    DocumentTextIcon,
    ExclamationTriangleIcon,
    MagnifyingGlassIcon,
    ClipboardDocumentIcon,
    UserCircleIcon,
    CalendarDaysIcon,
    IdentificationIcon
} from "@heroicons/react/24/outline";

const STATUSES = ["PENDING", "VERIFIED", "REJECTED", "ALL"];

export default function MyKyc() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const defaultStatus = searchParams.get("status") || "PENDING";

    // --- STATE ---
    const [status, setStatus] = useState(defaultStatus);
    const [kycs, setKycs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // --- EFFECTS ---
    useEffect(() => {
        fetchKyc();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status]);

    // --- API CALL ---
    const fetchKyc = async () => {
        try {
            setLoading(true);
            const url = status === "ALL" ? "/kyc/my" : `/kyc/my?status=${status}`;
            const res = await axios.get(url);
            setKycs(Array.isArray(res.data?.data) ? res.data.data : []);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load KYC records");
            setKycs([]);
        } finally {
            setLoading(false);
        }
    };

    // --- COMPUTED ---
    const filteredKycs = useMemo(() => {
        if (!searchTerm) return kycs;
        const lowerTerm = searchTerm.toLowerCase();
        return kycs.filter(k => 
            k.fullName?.toLowerCase().includes(lowerTerm) ||
            k.userId?.phone?.includes(lowerTerm) ||
            k.aadhaarLast4?.includes(lowerTerm) ||
            k._id.toLowerCase().includes(lowerTerm)
        );
    }, [kycs, searchTerm]);

    const stats = useMemo(() => ({
        total: kycs.length,
        pending: kycs.filter(k => k.kycStatus === "PENDING").length,
        verified: kycs.filter(k => k.kycStatus === "VERIFIED").length
    }), [kycs]);

    // --- ACTIONS ---
    const handleCopyId = (id) => {
        navigator.clipboard.writeText(id);
        toast.success("Reference ID copied to clipboard");
    };

    // --- COMPONENTS ---

    const StatusPill = ({ status }) => {
        const styles = {
            VERIFIED: "bg-emerald-100 text-emerald-700 ring-emerald-500/20",
            REJECTED: "bg-rose-100 text-rose-700 ring-rose-500/20",
            PENDING: "bg-amber-100 text-amber-700 ring-amber-500/20",
        };
        const icons = {
            VERIFIED: <CheckCircleIcon className="w-3.5 h-3.5" />,
            REJECTED: <XCircleIcon className="w-3.5 h-3.5" />,
            PENDING: <ClockIcon className="w-3.5 h-3.5" />,
        };

        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ring-1 ring-inset ${styles[status] || styles.PENDING}`}>
                {icons[status] || icons.PENDING}
                {status}
            </span>
        );
    };

    const LoadingSkeleton = () => (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse h-[280px]">
            <div className="flex justify-between items-start mb-6">
                <div className="w-1/2 h-6 bg-slate-100 rounded-md"></div>
                <div className="w-20 h-6 bg-slate-100 rounded-full"></div>
            </div>
            <div className="space-y-3 mb-6">
                <div className="w-full h-4 bg-slate-100 rounded-md"></div>
                <div className="w-2/3 h-4 bg-slate-100 rounded-md"></div>
            </div>
            <div className="w-full h-32 bg-slate-50 rounded-xl"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 p-6 lg:p-12">
            <div className="max-w-7xl mx-auto">

                {/* --- 1. HEADER SECTION --- */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">KYC & Compliance</h1>
                        <p className="text-slate-500 mt-2 text-sm font-medium">
                            Manage your identity verification documents securely.
                        </p>
                    </div>
                    
                    {/* Quick Stats Summary */}
                    {/* <div className="flex items-center gap-6 bg-white px-6 py-3 rounded-xl border border-slate-200 shadow-sm">
                        <div className="text-center">
                            <span className="block text-xl font-bold text-slate-900 leading-none">{stats.total}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total</span>
                        </div>
                        <div className="w-px h-8 bg-slate-100"></div>
                        <div className="text-center">
                            <span className="block text-xl font-bold text-emerald-600 leading-none">{stats.verified}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Verified</span>
                        </div>
                        <div className="w-px h-8 bg-slate-100"></div>
                        <div className="text-center">
                            <span className="block text-xl font-bold text-amber-500 leading-none">{stats.pending}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pending</span>
                        </div>
                    </div> */}
                </div>

                {/* --- 2. TOOLBAR --- */}
                <div className="sticky top-4 z-20 flex flex-col lg:flex-row items-center justify-between gap-4 bg-white/80 backdrop-blur-md p-2 rounded-2xl border border-slate-200 shadow-lg shadow-slate-200/50 mb-8">
                    {/* Status Tabs */}
                    <div className="flex w-full lg:w-auto bg-slate-100/80 p-1 rounded-xl overflow-x-auto">
                        {STATUSES.map((s) => (
                            <button
                                key={s}
                                onClick={() => { setStatus(s); navigate(`?status=${s}`); }}
                                className={`
                                    flex-1 lg:flex-none px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 whitespace-nowrap
                                    ${status === s 
                                        ? "bg-white text-indigo-600 shadow-sm text-indigo-700" 
                                        : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                                    }
                                `}
                            >
                                {s}
                            </button>
                        ))}
                    </div>

                    {/* Search Bar */}
                    <div className="relative w-full lg:w-80 group">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Search name, phone or ID..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-transparent focus:bg-white focus:border-indigo-200 rounded-xl text-sm font-semibold outline-none transition-all placeholder:text-slate-400"
                        />
                    </div>
                </div>

                {/* --- 3. MAIN GRID CONTENT --- */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => <LoadingSkeleton key={i} />)}
                    </div>
                ) : filteredKycs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white border border-dashed border-slate-300 rounded-3xl">
                        <div className="p-4 bg-slate-50 rounded-full mb-4">
                            <DocumentTextIcon className="w-10 h-10 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">No Records Found</h3>
                        <p className="text-slate-500 text-sm mt-1">Try adjusting your filters or search terms.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredKycs.map((kyc) => (
                            <div 
                                key={kyc._id} 
                                className="group relative bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-100 hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden"
                            >
                                {/* Semantic Color Border Top */}
                                <div className={`h-1.5 w-full ${
                                    kyc.kycStatus === 'VERIFIED' ? 'bg-emerald-500' : 
                                    kyc.kycStatus === 'REJECTED' ? 'bg-rose-500' : 'bg-amber-400'
                                }`} />

                                <div className="p-6 flex-1 flex flex-col">
                                    {/* Card Header */}
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-1">
                                                <IdentificationIcon className="w-4 h-4" />
                                                <span onClick={() => handleCopyId(kyc._id)} className="font-mono cursor-pointer hover:text-indigo-600 transition-colors flex items-center gap-1">
                                                    #{kyc._id.slice(-6)}
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-900 line-clamp-1" title={kyc.fullName}>{kyc.fullName}</h3>
                                        </div>
                                        <StatusPill status={kyc.kycStatus} />
                                    </div>

                                    {/* Info Grid */}
                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                            <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                                                <UserCircleIcon className="w-3 h-3" /> Mobile
                                            </span>
                                            <span className="text-sm font-bold text-slate-700 font-mono">{kyc.userId?.phone || "--"}</span>
                                        </div>
                                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                            <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                                                <CalendarDaysIcon className="w-3 h-3" /> Date
                                            </span>
                                            <span className="text-sm font-bold text-slate-700">{new Date(kyc.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    {/* Document Preview Area */}
                                    <div className="relative h-40 w-full bg-slate-100 rounded-2xl overflow-hidden border border-slate-100 group-hover:border-indigo-100 transition-colors mt-auto">
                                        <div className="absolute top-2 left-2 z-10 bg-white/90 backdrop-blur px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-sm border border-white/50">
                                            Aadhaar •••• {kyc.aadhaarLast4}
                                        </div>
                                        <img 
                                            src={`${import.meta.env.VITE_API_BASE_URL}/${kyc.documentUrl.replace(/\\/g, '/')}`}
                                            alt="KYC Doc"
                                            loading="lazy"
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                            <a 
                                                href={`${import.meta.env.VITE_API_BASE_URL}/${kyc.documentUrl.replace(/\\/g, '/')}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="bg-white text-slate-900 p-2.5 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300"
                                            >
                                                <EyeIcon className="w-5 h-5" />
                                            </a>
                                        </div>
                                    </div>
                                    
                                    {/* Action Footer (Only for Rejected) */}
                                    {kyc.kycStatus === 'REJECTED' && (
                                        <div className="mt-4 pt-4 border-t border-slate-100">
                                            <div className="flex items-start gap-2 mb-3">
                                                <ExclamationTriangleIcon className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
                                                <p className="text-xs font-medium text-rose-600 leading-snug">
                                                    {kyc.offlineNote || "Verification failed. Check document clarity."}
                                                </p>
                                            </div>
                                            <button 
                                                onClick={() => navigate('/kyc')}
                                                className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold uppercase rounded-lg transition-colors border border-rose-200"
                                            >
                                                Re-Submit Document
                                            </button>
                                        </div>
                                    )}

                                    {kyc.kycStatus === 'VERIFIED' && (
                                        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-emerald-600">
                                            <ShieldCheckIcon className="w-4 h-4" />
                                            <span className="text-xs font-bold">Verification Complete</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}