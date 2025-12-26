import { useEffect, useState } from "react";
import { createAmenity, getAmenities, blockFacility } from "../../api/admin.api";
import { toast } from "react-toastify";

export default function AmenitiesManager() {
  const [name, setName] = useState("");
  const [amenities, setAmenities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorState, setErrorState] = useState(null);

  const [selectedAmenity, setSelectedAmenity] = useState(null);
  const [blockData, setBlockData] = useState({ fromDate: "", toDate: "", reason: "" });

  const load = async () => {
    try {
      setLoading(true);
      setErrorState(null);
      const res = await getAmenities();
      setAmenities(res.data || []);
    } catch (error) {
      if (error.response?.status === 403) {
        setErrorState("No Virtual Account Linked. Please contact Super Admin.");
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAmenity = async () => {
    if (!name.trim()) return toast.warning("Enter amenity name");
    try {
      await createAmenity({ name: name.trim() });
      setName("");
      load();
      toast.success("Amenity added");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add");
    }
  };

  const handleBlockSubmit = async () => {
    if (!blockData.fromDate || !blockData.toDate || !blockData.reason) {
      return toast.warning("Please fill all block details");
    }
    try {
      await blockFacility({
        roomId: selectedAmenity._id,
        ...blockData
      });
      toast.success(`${selectedAmenity.name} has been blocked`);
      setSelectedAmenity(null);
      setBlockData({ fromDate: "", toDate: "", reason: "" });
    } catch (error) {
      toast.error("Failed to block facility");
    }
  };

  useEffect(() => { load(); }, []);

  if (errorState) {
    return (
      <div className="p-10 text-center">
        <div className="bg-red-50 text-red-700 p-6 rounded-lg border border-red-200 inline-block">
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
          <p>{errorState}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Amenity Inventory</h2>

      <div className="flex gap-2 mb-8 bg-white p-4 rounded-xl shadow-sm border">
        <input
          className="border p-2 rounded flex-1 focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="New Amenity Name (e.g. Swimming Pool)..."
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddAmenity()}
        />
        <button onClick={handleAddAmenity} className="bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-lg font-medium transition-colors">
          Add Amenity
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Active Facilities</h3>
          {loading ? <p>Loading...</p> : amenities.map(a => (
            <div key={a._id} className="p-4 border rounded-xl flex justify-between items-center bg-white shadow-sm hover:border-orange-200 transition-all group">
              <span className="font-semibold text-gray-700">{a.name}</span>
              <button
                disabled={a.isBlocked}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium ${a.isBlocked
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-white text-orange-600 border border-orange-200 hover:bg-orange-600 hover:text-white"
                  }`}
              >
                {a.isBlocked ? "Blocked" : "Schedule Block"}
              </button>

            </div>
          ))}
        </div>

        <div>
          {selectedAmenity ? (
            <div className="p-6 border-2 border-orange-100 rounded-2xl bg-orange-50 sticky top-6">
              <h3 className="font-bold text-orange-800 mb-4 flex items-center gap-2">
                <span>Block {selectedAmenity.name}</span>
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-orange-700 uppercase mb-1">From Date</label>
                  <input type="datetime-local" className="w-full p-2 border border-orange-200 rounded-lg"
                    onChange={e => setBlockData({ ...blockData, fromDate: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-orange-700 uppercase mb-1">To Date</label>
                  <input type="datetime-local" className="w-full p-2 border border-orange-200 rounded-lg"
                    onChange={e => setBlockData({ ...blockData, toDate: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-orange-700 uppercase mb-1">Reason</label>
                  <textarea className="w-full p-2 border border-orange-200 rounded-lg" rows="3" placeholder="Cleaning, Private Booking, etc."
                    onChange={e => setBlockData({ ...blockData, reason: e.target.value })} />
                </div>
                <div className="flex gap-2 pt-2">
                  <button onClick={handleBlockSubmit} className="bg-orange-600 text-white px-4 py-2 rounded-lg flex-1 font-bold shadow-lg shadow-orange-200">Confirm</button>
                  <button onClick={() => setSelectedAmenity(null)} className="bg-white border border-orange-200 text-orange-700 px-4 py-2 rounded-lg">Cancel</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 p-6 text-center">
              <p>Select a facility from the list to schedule a maintenance block.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}