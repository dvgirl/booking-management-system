import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { 
  BuildingOffice2Icon, PlusIcon, MapPinIcon, UserCircleIcon,
  PencilSquareIcon, TrashIcon, XMarkIcon, GlobeAltIcon
} from "@heroicons/react/24/outline";
import { getHotels, createHotel, updateHotel, deleteHotel, getManagers } from "../../api/admin.api";

export default function HotelPortfolio() {
  const [hotels, setHotels] = useState([]);
  const [managers, setManagers] = useState([]); 
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);
  
  const [formData, setFormData] = useState({
    name: "", city: "", state: "", address: "", description: "",
    managerId: "" // Changed to ID for better data handling
  });

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [hotelRes, managerRes] = await Promise.all([getHotels(), getManagers()]);
      setHotels(hotelRes.data?.data || []);
      setManagers(managerRes.data?.data || []);
    } catch (err) { 
      toast.error("Error loading portfolio data"); 
    } finally { setLoading(false); }
  };

  useEffect(() => { loadInitialData(); }, []);

  const handleEditClick = (hotel) => {
    setEditingHotel(hotel);
    setFormData({
      name: hotel.name || "",
      city: hotel.city || "",
      state: hotel.state || "",
      address: hotel.address || "",
      description: hotel.description || "",
      managerId: hotel.manager?._id || "" 
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setFormData({ name: "", city: "", state: "", address: "", description: "", managerId: "" });
    setEditingHotel(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      // Note: Backend createHotel logic might need to accept managerId instead of managerEmail
      if (editingHotel) {
        await updateHotel(editingHotel._id, formData);
        toast.success("Property updated");
      } else {
        await createHotel(formData);
        toast.success("Property registered");
      }
      resetForm();
      loadInitialData();
    } catch (err) { 
      toast.error(err.response?.data?.message || "Operation failed"); 
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-semibold text-slate-800 tracking-tight">Hotel Portfolio</h2>
          <p className="text-slate-500 text-sm mt-1">Manage global properties and regional branches.</p>
        </div>
        <button 
          onClick={() => (showForm ? resetForm() : setShowForm(true))}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-all shadow-md ${
            showForm ? "bg-slate-100 text-slate-600" : "bg-indigo-600 text-white hover:bg-indigo-700"
          }`}
        >
          {showForm ? <XMarkIcon className="w-4 h-4" /> : <PlusIcon className="w-4 h-4" />}
          {showForm ? "Cancel" : "Add Property"}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-xl animate-in slide-in-from-top-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <input className="px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm" placeholder="Hotel Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
              <input className="px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm" placeholder="City" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} required />
              <input className="px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm" placeholder="State" value={formData.state} onChange={(e) => setFormData({...formData, state: e.target.value})} required />
              <div className="md:col-span-2">
                <input className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm" placeholder="Street Address" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} required />
              </div>

              {/* UPDATED SELECT: Handles ID as value, displays Email or Phone */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-indigo-400 uppercase px-1">Assign Manager</label>
                <select 
                  className="w-full px-4 py-2.5 bg-indigo-50/50 border border-indigo-100 rounded-xl text-sm outline-none"
                  value={formData.managerId}
                  onChange={(e) => setFormData({...formData, managerId: e.target.value})}
                >
                  <option value="">Select Manager</option>
                  {managers.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.name} ({m.displayContact})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button disabled={loading} className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-semibold shadow-lg">
              {loading ? "Processing..." : (editingHotel ? "Save Changes" : "Register Property")}
            </button>
          </form>
        </div>
      )}

      {/* LIST GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hotels.map((hotel) => (
          <div key={hotel._id} className="bg-white p-6 rounded-[1.5rem] border border-slate-200 hover:shadow-xl transition-all group relative overflow-hidden">
            <div className="flex justify-between items-start mb-5 relative z-10">
              <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600"><BuildingOffice2Icon className="w-6 h-6" /></div>
              <div className="flex gap-1">
                <button onClick={() => handleEditClick(hotel)} className="p-2 text-slate-300 hover:text-indigo-600"><PencilSquareIcon className="w-4 h-4" /></button>
                <button onClick={() => handleDeleteHotel(hotel._id, hotel.name)} className="p-2 text-slate-300 hover:text-rose-600"><TrashIcon className="w-4 h-4" /></button>
              </div>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">{hotel.name}</h3>
            <div className="flex items-center gap-2 text-slate-500 mb-4">
              <MapPinIcon className="w-4 h-4 text-indigo-500" />
              <span className="text-[11px] font-bold uppercase">{hotel.city}, {hotel.state}</span>
            </div>
            <div className="pt-3 border-t border-slate-50 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400"><UserCircleIcon className="w-4 h-4" /></div>
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase">Manager</p>
                <p className="text-xs font-semibold text-slate-700">{hotel.manager?.name || "Unassigned"}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}