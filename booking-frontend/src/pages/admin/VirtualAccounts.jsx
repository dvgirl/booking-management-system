import { useEffect, useState } from "react";
import { createVirtualAccount, getVirtualAccounts, getUsers, assignAdmin } from "../../api/admin.api";
import { toast } from "react-toastify";

export default function VirtualAccounts() {
    const [name, setName] = useState("");
    const [accounts, setAccounts] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    const loadData = async () => {
        setLoading(true);
        try {
            const [accRes, userRes] = await Promise.all([
                getVirtualAccounts(),
                getUsers()
            ]);
            // Ensure we handle cases where data might be nested or direct arrays
            setAccounts(accRes.data || []);
            setUsers(userRes.data || []);
        } catch (error) {
            console.error("Fetch error:", error);
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!name.trim()) return toast.warning("Enter a property name");
        try {
            await createVirtualAccount({ name });
            setName("");
            toast.success("Property created successfully");
            loadData();
        } catch (error) {
            toast.error("Creation failed");
        }
    };

    const handleAssign = async (virtualAccountId, adminId) => {
        if (!adminId) return;
        try {
            await assignAdmin({ adminId, virtualAccountId });
            toast.success("Admin assigned successfully!");
            loadData(); // Refresh to see updated state if necessary
        } catch (error) {
            toast.error(error.response?.data?.message || "Assignment failed");
        }
    };

    useEffect(() => { loadData(); }, []);

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Property Management</h2>

            {/* Create Section */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 mb-10">
                <div className="flex-1">
                    <label className="block text-sm font-semibold text-gray-600 mb-1 ml-1">New Property Name</label>
                    <input
                        placeholder="e.g. Blue Horizon Resort"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full border border-gray-200 p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                </div>
                <button
                    onClick={handleCreate}
                    className="md:mt-6 bg-blue-600 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-100"
                >
                    Create Account
                </button>
            </div>

            {/* List Section */}
            <div className="space-y-4">
                <div className="flex justify-between items-center px-2">
                    <h3 className="text-gray-500 font-bold uppercase text-xs tracking-widest">Active Virtual Accounts</h3>
                    <span className="text-xs font-medium bg-gray-100 text-gray-500 px-2 py-1 rounded-full">{accounts.length} Total</span>
                </div>

                {loading && accounts.length === 0 ? (
                    <div className="text-center py-10 text-gray-400">Loading accounts...</div>
                ) : accounts.length === 0 ? (
                    <div className="bg-gray-50 border-2 border-dashed rounded-2xl p-10 text-center">
                        <p className="text-gray-400">No virtual accounts found. Create your first property above.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {accounts.map(a => (
                            <div key={a._id} className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div>
                                    <h4 className="font-bold text-lg text-gray-800">{a.name}</h4>

                                    {a.admins?.length > 0 ? (
                                        <p className="text-sm text-green-600 font-semibold mt-1">
                                            Admin: {a.admins[0].phone}
                                        </p>
                                    ) : (
                                        <p className="text-sm text-gray-400 mt-1">No admin assigned</p>
                                    )}
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-bold uppercase">Code</span>
                                        <span className="text-xs text-gray-400 font-mono tracking-tighter">{a.code}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase ml-1">Assign Manager</span>
                                        <select
                                            className="text-sm border-none bg-transparent font-semibold text-gray-700 focus:ring-0 cursor-pointer"
                                            onChange={(e) => handleAssign(a._id, e.target.value)}
                                            defaultValue=""
                                        >
                                            <option value="" disabled>Select Admin Phone...</option>
                                            {users.map(u => (
                                                <option key={u._id} value={u._id}>
                                                    {u.phone} ({u.role})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="h-8 w-[1px] bg-gray-200 mx-2"></div>
                                    <div className="text-blue-600">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                        </svg>
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