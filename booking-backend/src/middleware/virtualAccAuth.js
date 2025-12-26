const User = require("../models/User");
const jwt = require("jsonwebtoken");

const virtualAccAuth = async (req, res, next) => {
  let token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Access denied. No token provided." });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch fresh user data to see the latest assignment
    const user = await User.findById(decoded.id).select("-password");
    
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Handle the "No Virtual Account" scenario gracefully
    if (!user.virtualAccountId) {
      return res.status(403).json({ 
        message: "No Property Linked",
        description: "This admin account is not assigned to a Virtual Account/Property yet."
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token." });
  }
};

module.exports = virtualAccAuth; // Ensure this is a default export