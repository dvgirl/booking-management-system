import { useEffect, useState, useContext } from "react";
import { createRoom, getRooms, updateRoom, deleteRoom, getHotels } from "../../api/admin.api";
import { AuthContext } from "../../context/AuthContext";
import { toast } from "react-toastify";
import {
    PlusIcon,
    PencilSquareIcon,
    TrashIcon,
    MapPinIcon,
    HomeModernIcon,
    TagIcon,
    UsersIcon,
    XMarkIcon,
    ShieldCheckIcon,
    BuildingOfficeIcon,
    ChevronDownIcon
} from "@heroicons/react/24/outline";

export default function RoomsManager() {
    const { user } = useContext(AuthContext);
    const [rooms, setRooms] = useState([]);
    const [hotels, setHotels] = useState([]); // State for hotel dropdown
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingRoom, setEditingRoom] = useState(null);

    const [filters, setFilters] = useState({ city: "", state: "", type: "" });
    const isSuperAdmin = user?.role === "SUPER_ADMIN";

    const [formData, setFormData] = useState({
        roomNumber: "",
        type: "Standard",
        price: "",
        capacity: 1,
        description: "",
        city: "",
        state: "",
        hotelId: "",
        amenities: [],
        allowedRoles: ["USER", "ADMIN", "SUPER_ADMIN"]
    });

    const [amenityInput, setAmenityInput] = useState("");
    const roomTypes = ["Standard", "Deluxe", "Suite", "Executive", "Presidential"];

    // 1. Load Data: Rooms and Hotels
    const loadInitialData = async () => {
        try {
            setLoading(true);
            const [roomsRes, hotelsRes] = await Promise.all([
                getRooms(),
                isSuperAdmin ? getHotels() : Promise.resolve({ data: { data: [] } })
            ]);
            
            setRooms(roomsRes.data || []);
            if (isSuperAdmin) {
                setHotels(hotelsRes.data?.data || hotelsRes.data || []);
            }
        } catch (error) {
            toast.error("Failed to sync with server");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadInitialData();
    }, []);

    // 2. Handle Hotel Selection (Super Admin only)
    const handleHotelChange = (e) => {
        const selectedHotelId = e.target.value;
        const selectedHotel = hotels.find(h => h._id === selectedHotelId);
        
        if (selectedHotel) {
            setFormData(prev => ({
                ...prev,
                hotelId: selectedHotelId,
                city: selectedHotel.city,
                state: selectedHotel.state
            }));
        } else {
            setFormData(prev => ({ ...prev, hotelId: "", city: "", state: "" }));
        }
    };

    const resetForm = () => {
        setFormData({
            roomNumber: "",
            type: "Standard",
            price: "",
            capacity: 1,
            description: "",
            city: !isSuperAdmin ? (user?.city || "") : "",
            state: !isSuperAdmin ? (user?.state || "") : "",
            hotelId: !isSuperAdmin ? (user?.hotelId || "") : "",
            amenities: [],
            allowedRoles: ["USER", "ADMIN", "SUPER_ADMIN"]
        });
        setAmenityInput("");
        setEditingRoom(null);
        setShowForm(false);
    };

    const filteredRooms = rooms.filter(room => {
        return (
            (filters.city === "" || room.city?.toLowerCase().includes(filters.city.toLowerCase())) &&
            (filters.state === "" || room.state?.toLowerCase().includes(filters.state.toLowerCase())) &&
            (filters.type === "" || room.type === filters.type)
        );
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.roomNumber.trim() || !formData.price || !formData.city || !formData.hotelId) {
            toast.warning("Incomplete Data: Please select a hotel and enter price/room number.");
            return;
        }

        try {
            setLoading(true);
            const payload = {
                ...formData,
                price: parseFloat(formData.price),
                capacity: parseInt(formData.capacity)
            };

            if (editingRoom) {
                await updateRoom(editingRoom._id, payload);
                toast.success("Room updated successfully");
            } else {
                await createRoom(payload);
                toast.success("New room registered");
            }
            resetForm();
            loadInitialData();
        } catch (error) {
            toast.error(error.response?.data?.message || "Operation failed");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (room) => {
        setFormData({
            ...room,
            roomNumber: room.roomNumber.toString(),
            price: room.price.toString()
        });
        setEditingRoom(room);
        setShowForm(true);
    };

    const addAmenity = () => {
        if (amenityInput.trim() && !formData.amenities.includes(amenityInput.trim())) {
            setFormData(prev => ({
                ...prev,
                amenities: [...prev.amenities, amenityInput.trim()]
            }));
            setAmenityInput("");
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        {isSuperAdmin ? (
                            <span className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-bold uppercase tracking-widest border border-indigo-100">
                                <ShieldCheckIcon className="w-3.5 h-3.5" /> Multi-Property Access
                            </span>
                        ) : (
                            <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold uppercase tracking-widest border border-emerald-100">
                                <BuildingOfficeIcon className="w-3.5 h-3.5" /> Local Admin: {user?.city}
                            </span>
                        )}
                    </div>
                    <h2 className="text-3xl font-semibold text-slate-800 tracking-tight">Inventory Manager</h2>
                    <p className="text-slate-500 text-sm">Organize rooms and pricing across your hotel portfolio.</p>
                </div>
                
                <button
                    onClick={() => (showForm ? resetForm() : setShowForm(true))}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-md ${
                        showForm 
                        ? "bg-slate-100 text-slate-600 hover:bg-slate-200" 
                        : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100"
                    }`}
                >
                    {showForm ? <XMarkIcon className="w-5 h-5" /> : <PlusIcon className="w-5 h-5" />}
                    {showForm ? "Cancel" : "Add New Room"}
                </button>
            </div>

            {/* Filter Toolbar */}
            <div className="bg-white p-4 rounded-[1.5rem] border border-slate-200 shadow-sm flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-[180px] relative">
                    <MapPinIcon className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Filter by City..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all"
                        value={filters.city}
                        onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                    />
                </div>
                <select
                    className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium text-slate-600 appearance-none cursor-pointer"
                    value={filters.type}
                    onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                >
                    <option value="">All Categories</option>
                    {roomTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
            </div>

            {/* Form Section */}
            {showForm && (
                <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 animate-in zoom-in-95 duration-300">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            
                            {/* HOTEL DROPDOWN (New for Multi-Hotel) */}
                            <div className="md:col-span-3 space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Target Hotel Property</label>
                                {isSuperAdmin ? (
                                    <div className="relative">
                                        <select
                                            value={formData.hotelId}
                                            onChange={handleHotelChange}
                                            className="w-full px-5 py-3 bg-indigo-50/50 border border-indigo-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none appearance-none font-semibold text-slate-700 transition-all"
                                            required
                                        >
                                            <option value="">Select a Hotel...</option>
                                            {hotels.map(h => (
                                                <option key={h._id} value={h._id}>{h.name} ({h.city})</option>
                                            ))}
                                        </select>
                                        <ChevronDownIcon className="w-5 h-5 absolute right-4 top-3.5 text-indigo-400 pointer-events-none" />
                                    </div>
                                ) : (
                                    <div className="px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-500 font-medium">
                                        {user?.hotelName || "Your Assigned Property"}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">City</label>
                                <input
                                    type="text"
                                    value={formData.city}
                                    readOnly
                                    className="w-full px-5 py-3 bg-slate-100 border-none rounded-2xl text-slate-400 cursor-not-allowed text-sm"
                                    placeholder="Auto-filled from Hotel"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Room Number</label>
                                <input
                                    type="text"
                                    value={formData.roomNumber}
                                    onChange={(e) => setFormData(p => ({ ...p, roomNumber: e.target.value }))}
                                    className="w-full px-5 py-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                    placeholder="e.g. 101"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Price / Night</label>
                                <div className="relative">
                                    <span className="absolute left-5 top-3 text-slate-400 font-bold">₹</span>
                                    <input
                                        type="number"
                                        value={formData.price}
                                        onChange={(e) => setFormData(p => ({ ...p, price: e.target.value }))}
                                        className="w-full pl-10 pr-5 py-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold text-emerald-600"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Category</label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData(p => ({ ...p, type: e.target.value }))}
                                    className="w-full px-5 py-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-sm"
                                >
                                    {roomTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Capacity</label>
                                <input
                                    type="number"
                                    value={formData.capacity}
                                    onChange={(e) => setFormData(p => ({ ...p, capacity: e.target.value }))}
                                    className="w-full px-5 py-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-4 pt-4">
                            <button type="button" onClick={resetForm} className="text-xs font-bold uppercase text-slate-400 hover:text-slate-600 transition-colors">Discard</button>
                            <button type="submit" disabled={loading} className="px-10 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-all disabled:opacity-50">
                                {loading ? "Syncing..." : editingRoom ? "Update Room" : "Create Room"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* List Section */}
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase text-slate-400 tracking-wider">Room & Property</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase text-slate-400 tracking-wider">Details</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase text-slate-400 tracking-wider">Pricing</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase text-slate-400 tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredRooms.map(room => (
                                <tr key={room._id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
                                                <HomeModernIcon className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900">Room {room.roomNumber}</p>
                                                <p className="text-[11px] font-medium text-slate-400 uppercase">{room.city}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="text-xs font-bold text-slate-600 uppercase">{room.type}</span>
                                        <div className="flex items-center gap-1 text-slate-400 text-xs">
                                            <UsersIcon className="w-3.5 h-3.5" /> Fits {room.capacity}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <p className="text-lg font-bold text-emerald-600">₹{room.price}</p>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => handleEdit(room)} className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-indigo-600 transition-all">
                                                <PencilSquareIcon className="w-5 h-5" />
                                            </button>
                                            <button onClick={() => handleDelete(room._id)} className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-rose-600 transition-all">
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}