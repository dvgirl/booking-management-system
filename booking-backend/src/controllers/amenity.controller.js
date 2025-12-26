const Amenity = require("../models/Amenity");
const User = require("../models/User");

exports.addAmenity = async (req, res) => {
  try {
    // Look up the user in the DB to get the LATEST virtualAccountId
    const user = await User.findById(req.user.id);

    if (!user || !user.virtualAccountId) {
      return res.status(403).json({
        message: "Action denied. You must be assigned to a Virtual Account first."
      });
    }

    const amenity = await Amenity.create({
      name: req.body.name,
      virtualAccountId: user.virtualAccountId // Use the ID from the fresh DB look-up
    });

    res.json({ message: "Amenity added", amenity });
  } catch (error) {
    // Handle duplicate name errors (from the index we created earlier)
    if (error.code === 11000) {
      return res.status(400).json({ message: "An amenity with this name already exists." });
    }
    res.status(500).json({ message: error.message });
  }
};

exports.listAmenities = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user?.virtualAccountId) {
      return res.status(403).json({ message: "No Virtual Account Linked" });
    }

    const now = new Date();

    const amenities = await Amenity.aggregate([
      {
        $match: {
          virtualAccountId: user.virtualAccountId,
          isActive: true
        }
      },
      {
        $lookup: {
          from: "facilityblocks",
          let: { amenityId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$roomId", "$$amenityId"] },
                    { $lte: ["$fromDate", now] },
                    { $gte: ["$toDate", now] }
                  ]
                }
              }
            }
          ],
          as: "activeBlock"
        }
      },
      {
        $addFields: {
          isBlocked: { $gt: [{ $size: "$activeBlock" }, 0] }
        }
      }
    ]);

    res.json(amenities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};