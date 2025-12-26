import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import { toast } from "react-toastify";
import {
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    ArrowPathIcon,
    EyeIcon
} from "@heroicons/react/24/outline";

const STATUSES = ["PENDING", "VERIFIED", "REJECTED", "ALL"];

export default function MyKyc() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const defaultStatus = searchParams.get("status") || "PENDING";

    const [status, setStatus] = useState(defaultStatus);
    const [kycs, setKycs] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchKyc();
    }, [status]);

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

    // Helper to render Status Badges
    const renderStatusBadge = (kycStatus) => {
        const styles = {
            VERIFIED: "bg-green-50 text-green-700 border-green-200",
            REJECTED: "bg-red-50 text-red-700 border-red-200",
            PENDING: "bg-amber-50 text-amber-700 border-amber-200",
        };

        const getIcon = (status) => {
            switch (status) {
                case "VERIFIED":
                    return (
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    );
                case "REJECTED":
                    return (
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    );
                default:
                    return (
                        <svg className="w-4 h-4 mr-1 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    );
            }
        };

        return (
            <span className={`flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${styles[kycStatus] || styles.PENDING}`}>
                {getIcon(kycStatus)}
                {kycStatus}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-10">
            <div className="max-w-5xl mx-auto">

                {/* HEADER SECTION */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                    <div>
                        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">KYC Verification</h2>
                        <p className="text-slate-500 mt-1">Manage and track your identity verification documents.</p>
                    </div>

                    <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200">
                        {STATUSES.map((s) => (
                            <button
                                key={s}
                                onClick={() => {
                                    setStatus(s);
                                    navigate(`?status=${s}`);
                                }}
                                className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${status === s
                                        ? "bg-blue-600 text-white shadow-md"
                                        : "text-slate-600 hover:bg-slate-50"
                                    }`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                {/* LOADING STATE */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24">
                        <ArrowPathIcon className="w-10 h-10 text-blue-600 animate-spin" />
                        <p className="mt-4 text-slate-500 font-medium">Fetching your documents...</p>
                    </div>
                ) : kycs.length === 0 ? (
                    /* EMPTY STATE */
                    <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl py-20 text-center">
                        <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ClockIcon className="w-8 h-8 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800">No Records Found</h3>
                        <p className="text-slate-500 max-w-xs mx-auto mt-2">
                            We couldn't find any KYC submissions with the status <span className="font-bold text-blue-600">"{status}"</span>.
                        </p>
                    </div>
                ) : (
                    /* DATA LIST */
                    <div className="grid grid-cols-1 gap-6">
                        {kycs.map((kyc) => (
                            <div key={kyc._id} className="group bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col md:flex-row">

                                {/* DOCUMENT PREVIEW */}
                                <div className="relative md:w-56 h-48 md:h-auto bg-slate-100 overflow-hidden border-b md:border-b-0 md:border-r border-slate-100">
                                    <img
                                        src={`${import.meta.env.VITE_API_BASE_URL}/${kyc.documentUrl.replace(/\\/g, '/')}`}
                                        alt="KYC Document"
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <a
                                            href={`${import.meta.env.VITE_API_BASE_URL}/${kyc.documentUrl.replace(/\\/g, '/')}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="bg-white p-2 rounded-full shadow-lg text-slate-900 hover:text-blue-600"
                                        >
                                            <EyeIcon className="w-5 h-5" />
                                        </a>
                                    </div>
                                </div>

                                {/* INFO SECTION */}
                                <div className="p-6 flex-1">
                                    <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900">{kyc.fullName}</h3>
                                            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mt-1">
                                                ID: {kyc._id.slice(-8)}
                                            </p>
                                        </div>
                                        {renderStatusBadge(kyc.kycStatus)}
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 py-4 border-t border-slate-50">
                                        <div>
                                            <p className="text-xs text-slate-500 mb-1">Phone Number</p>
                                            <p className="text-sm font-medium text-slate-800">{kyc.userId?.phone || "N/A"}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 mb-1">Aadhaar (Last 4)</p>
                                            <p className="text-sm font-medium text-slate-800">•••• •••• {kyc.aadhaarLast4}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 mb-1">Submitted Date</p>
                                            <p className="text-sm font-medium text-slate-800">{new Date(kyc.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>

                                    {/* ACTION FOOTER */}
                                    <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                                        {kyc.kycStatus === "REJECTED" ? (
                                            <div className="flex items-center gap-4">
                                                <span className="text-sm text-red-500 italic">Reason: {kyc.offlineNote || "Incomplete documentation"}</span>
                                                <button
                                                    onClick={() => navigate("/kyc")}
                                                    className="text-sm font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-lg transition-colors"
                                                >
                                                    Re-submit KYC
                                                </button>
                                            </div>
                                        ) : kyc.kycStatus === "VERIFIED" ? (
                                            <p className="text-sm text-slate-500">Verified on {new Date(kyc.verifiedAt).toLocaleDateString()}</p>
                                        ) : (
                                            <p className="text-sm text-slate-500 italic">Your document is currently under review by our team.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}