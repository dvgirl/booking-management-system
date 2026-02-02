const Hotel = require('../models/Hotel');
const User = require('../models/User');
const mongoose = require('mongoose');

// @desc    Get all hotels in the portfolio
// @route   GET /api/hotels
exports.getAllHotels = async (req, res) => {
    try {
        const hotels = await Hotel.find().populate('manager', 'name email role');
        
        res.status(200).json({
            success: true,
            count: hotels.length,
            data: hotels
        });
    } catch (error) {
        console.error("Fetch Hotels Error:", error);
        res.status(500).json({ message: "Failed to fetch hotel portfolio" });
    }
};

// @desc    Get single hotel by ID
// @route   GET /api/hotels/:id
exports.getHotelById = async (req, res) => {
    try {
        // Validation: Ensure ID is a valid MongoDB ObjectId to prevent internal crashes
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Invalid Hotel ID format" });
        }

        const hotel = await Hotel.findById(req.params.id).populate('manager', 'name email');
        
        if (!hotel) {
            return res.status(404).json({ message: "Hotel property not found" });
        }

        res.status(200).json({ success: true, data: hotel });
    } catch (error) {
        console.error("GetHotelById Error:", error);
        res.status(500).json({ message: "Error fetching hotel details" });
    }
};

// @desc    Register a new hotel and optionally assign a manager
// @route   POST /api/hotels
exports.createHotel = async (req, res) => {
    try {
        const { name, city, state, address, description, managerEmail } = req.body;

        if (!name || !city || !state || !address) {
            return res.status(400).json({ message: "Please provide all required location fields" });
        }

        // Create hotel instance
        const hotel = new Hotel({ name, city, state, address, description });

        if (managerEmail) {
            const user = await User.findOne({ email: managerEmail });
            if (!user) {
                return res.status(404).json({ message: "Manager email not found in system" });
            }
            
            // Link User to Hotel and elevate role
            hotel.manager = user._id;
            user.role = "ADMIN";
            user.hotelId = hotel._id;
            user.city = city;
            user.state = state;
            await user.save();
        }

        await hotel.save();

        res.status(201).json({
            success: true,
            message: "Hotel registered successfully",
            data: hotel
        });
    } catch (error) {
        console.error("Create Hotel Error:", error);
        res.status(500).json({ message: error.message || "Failed to create hotel" });
    }
};
// @desc    Update hotel details
// @route   PUT /api/hotels/:id
exports.updateHotel = async (req, res) => {
    try {
        const { name, city, state, address, description, managerEmail, managerId } = req.body;

        const hotel = await Hotel.findById(req.params.id);
        if (!hotel) {
            return res.status(404).json({ message: "Hotel not found" });
        }

        // 1. Update basic hotel info
        hotel.name = name || hotel.name;
        hotel.city = city || hotel.city;
        hotel.state = state || hotel.state;
        hotel.address = address || hotel.address;
        hotel.description = description || hotel.description;

        // 2. Logic to handle manager change (ID has priority, Email is fallback)
        let user;
        if (managerId) {
            user = await User.findById(managerId);
        } else if (managerEmail) {
            user = await User.findOne({ email: managerEmail });
        }

        if (user) {
            hotel.manager = user._id;
            user.role = "ADMIN";
            user.hotelId = hotel._id;
            // Sync location to user as per your original logic
            user.city = city || hotel.city;
            user.state = state || hotel.state;
            await user.save();
        }

        await hotel.save();

        res.status(200).json({
            success: true,
            message: "Hotel updated successfully",
            data: hotel
        });
    } catch (error) {
        console.error("Update Hotel Error:", error);
        res.status(500).json({ message: "Update failed" });
    }
};

// @desc    Delete hotel and reset associated users
// @route   DELETE /api/hotels/:id
exports.deleteHotel = async (req, res) => {
    try {
        const hotel = await Hotel.findById(req.params.id);

        if (!hotel) {
            return res.status(404).json({ message: "Hotel not found" });
        }

        // Reset all users associated with this hotel
        await User.updateMany(
            { hotelId: req.params.id }, 
            { hotelId: null, role: "USER" }
        );

        await hotel.deleteOne();

        res.status(200).json({
            success: true,
            message: "Hotel property removed from system"
        });
    } catch (error) {
        console.error("Delete Hotel Error:", error);
        res.status(500).json({ message: "Delete failed" });
    }
};

// @desc    Get list of users who can be assigned as managers
// @route   GET /api/hotels/available-managers
exports.getAvailableManagers = async (req, res) => {
    try {
        // Fetch users and include phone field
        const managers = await User.find({ 
            role: { $in: ["ADMIN", "USER"] } 
        })
        .select('name email phone _id')
        .sort({ name: 1 });

        // Transform data: if email is missing, use phone
        const transformedManagers = managers.map(user => ({
            _id: user._id,
            name: user.name,
            displayContact: user.email || user.phone || "No Contact Info",
            identifier: user.email || user._id // Fallback for your existing email logic
        }));

        res.status(200).json({
            success: true,
            data: transformedManagers
        });
    } catch (error) {
        console.error("Manager Fetch Error:", error);
        res.status(500).json({ message: "Failed to fetch managers list" });
    }
};