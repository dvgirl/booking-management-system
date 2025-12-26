import { useEffect, useState } from "react";
import { createRoom, getRooms, updateRoom, deleteRoom } from "../../api/admin.api";
import { toast } from "react-toastify";

export default function RoomsManager() {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingRoom, setEditingRoom] = useState(null);
    const [formData, setFormData] = useState({
        roomNumber: "",
        type: "Standard",
        price: "",
        capacity: 1,
        description: "",
        amenities: [],
        allowedRoles: ["USER", "ADMIN", "SUPER_ADMIN"]
    });
    const [amenityInput, setAmenityInput] = useState("");

    const roomTypes = ["Standard", "Deluxe", "Suite", "Executive", "Presidential"];
    const userRoles = ["USER", "ADMIN", "SUPER_ADMIN"];

    const loadRooms = async () => {
        try {
            setLoading(true);
            const res = await getRooms();
            setRooms(res.data || []);
        } catch (error) {
            console.error("Error loading rooms:", error);
            toast.error("Failed to load rooms");
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            roomNumber: "",
            type: "Standard",
            price: "",
            capacity: 1,
            description: "",
            amenities: [],
            allowedRoles: ["USER", "ADMIN", "SUPER_ADMIN"]
        });
        setAmenityInput("");
        setEditingRoom(null);
        setShowForm(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.roomNumber.trim() || !formData.price) {
            toast.warning("Room number and price are required");
            return;
        }

        if (parseFloat(formData.price) <= 0) {
            toast.warning("Price must be greater than 0");
            return;
        }

        try {
            setLoading(true);
            const data = {
                ...formData,
                price: parseFloat(formData.price),
                capacity: parseInt(formData.capacity)
            };

            if (editingRoom) {
                await updateRoom(editingRoom._id, data);
                toast.success("Room updated successfully");
            } else {
                await createRoom(data);
                toast.success("Room created successfully");
            }

            resetForm();
            loadRooms();
        } catch (error) {
            console.error("Error saving room:", error);
            toast.error(error.response?.data?.message || "Failed to save room");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (room) => {
        setFormData({
            roomNumber: room.roomNumber.toString(),
            type: room.type,
            price: room.price.toString(),
            capacity: room.capacity,
            description: room.description || "",
            amenities: room.amenities || [],
            allowedRoles: room.allowedRoles || ["USER", "ADMIN", "SUPER_ADMIN"]
        });
        setEditingRoom(room);
        setShowForm(true);
    };

    const handleDelete = async (roomId) => {
        if (!window.confirm("Are you sure you want to delete this room? This action cannot be undone.")) {
            return;
        }

        try {
            setLoading(true);
            await deleteRoom(roomId);
            toast.success("Room deleted successfully");
            loadRooms();
        } catch (error) {
            console.error("Error deleting room:", error);
            toast.error(error.response?.data?.message || "Failed to delete room");
        } finally {
            setLoading(false);
        }
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

    const removeAmenity = (amenity) => {
        setFormData(prev => ({
            ...prev,
            amenities: prev.amenities.filter(a => a !== amenity)
        }));
    };

    const toggleRole = (role) => {
        setFormData(prev => ({
            ...prev,
            allowedRoles: prev.allowedRoles.includes(role)
                ? prev.allowedRoles.filter(r => r !== role)
                : [...prev.allowedRoles, role]
        }));
    };

    useEffect(() => {
        loadRooms();
    }, []);

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Room Management</h2>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
                >
                    {showForm ? "Cancel" : "+ Add Room"}
                </button>
            </div>

            {/* Room Form */}
            {showForm && (
                <div className="bg-white p-6 rounded-lg shadow-md mb-6 border">
                    <h3 className="text-lg font-semibold mb-4">
                        {editingRoom ? "Edit Room" : "Add New Room"}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Room Number *
                                </label>
                                <input
                                    type="number"
                                    value={formData.roomNumber}
                                    onChange={(e) => setFormData(prev => ({ ...prev, roomNumber: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Room Type
                                </label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {roomTypes.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Price per Night (₹) *
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.price}
                                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Capacity
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={formData.capacity}
                                    onChange={(e) => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows="3"
                                placeholder="Optional room description..."
                            />
                        </div>

                        {/* Amenities */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Amenities
                            </label>
                            <div className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    value={amenityInput}
                                    onChange={(e) => setAmenityInput(e.target.value)}
                                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addAmenity())}
                                    placeholder="Add amenity..."
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                    type="button"
                                    onClick={addAmenity}
                                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
                                >
                                    Add
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {formData.amenities.map((amenity, index) => (
                                    <span
                                        key={index}
                                        className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center gap-1"
                                    >
                                        {amenity}
                                        <button
                                            type="button"
                                            onClick={() => removeAmenity(amenity)}
                                            className="text-blue-600 hover:text-blue-800"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Allowed Roles */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Who can book this room?
                            </label>
                            <div className="flex gap-4">
                                {userRoles.map(role => (
                                    <label key={role} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={formData.allowedRoles.includes(role)}
                                            onChange={() => toggleRole(role)}
                                            className="mr-2"
                                        />
                                        {role}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-2 pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md font-medium disabled:opacity-50"
                            >
                                {loading ? "Saving..." : editingRoom ? "Update Room" : "Create Room"}
                            </button>
                            <button
                                type="button"
                                onClick={resetForm}
                                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-md font-medium"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Rooms List */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800">All Rooms ({rooms.length})</h3>
                </div>

                {loading && rooms.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">Loading rooms...</div>
                ) : rooms.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No rooms found. Add your first room above.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Room
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Price
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Capacity
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Allowed Roles
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {rooms.map(room => (
                                    <tr key={room._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                Room {room.roomNumber}
                                            </div>
                                            {room.description && (
                                                <div className="text-sm text-gray-500 truncate max-w-xs">
                                                    {room.description}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-900">{room.type}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-medium text-green-600">
                                                ₹{room.price}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-900">{room.capacity}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {room.allowedRoles?.map(role => (
                                                    <span
                                                        key={role}
                                                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                                    >
                                                        {role}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => handleEdit(room)}
                                                className="text-blue-600 hover:text-blue-900 mr-4"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(room._id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
