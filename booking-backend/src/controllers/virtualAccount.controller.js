const VirtualAccount = require("../models/VirtualAccount");
const User = require("../models/User");


exports.createVirtualAccount = async (req, res) => {
  const { name } = req.body;

  const account = await VirtualAccount.create({
    name,
    code: "VA-" + Date.now(),
    createdBy: req.user.id
  });

  res.json({
    message: "Virtual account created",
    account
  });
};

exports.assignAdmin = async (req, res) => {
  const { adminId, virtualAccountId } = req.body;

  // 1. Check if the Virtual Account exists first
  const accountExists = await VirtualAccount.findById(virtualAccountId);
  if (!accountExists) {
    return res.status(404).json({ message: "Virtual Account not found" });
  }

  // 2. Assign the user
  const admin = await User.findByIdAndUpdate(
    adminId,
    { 
      virtualAccountId, 
      role: "ADMIN" // Automatically elevate role to ADMIN
    },
    { new: true }
  ).select("-password"); // Never return the password hash to the frontend

  if (!admin) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json({ 
    message: `Admin assigned to ${accountExists.name}`, 
    admin 
  });
};

exports.listVirtualAccounts = async (req, res) => {
  const virtualAccounts = await VirtualAccount.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "virtualAccountId",
        as: "users"
      }
    },
    {
      $addFields: {
        admins: {
          $filter: {
            input: "$users",
            as: "user",
            cond: { $eq: ["$$user.role", "ADMIN"] }
          }
        }
      }
    },
    {
      $project: {
        users: 0 // hide full user list if not needed
      }
    }
  ]);

  res.json(virtualAccounts);
};

exports.getUsers = async (req, res) => {
  const users = await User.find();
  res.json(users);
};