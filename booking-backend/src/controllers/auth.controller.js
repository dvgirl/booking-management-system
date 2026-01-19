const User = require("../models/User");
const Otp = require("../models/Otp");
const jwt = require("jsonwebtoken");
const { generateOtp } = require("../utils/otp");
const { sendSms } = require("../utils/twilio");
const Kyc = require("../models/Kyc");
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ================= SEND OTP =================
exports.sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min

    await Otp.deleteMany({ phone });

    await Otp.create({
      phone,
      otp,
      expiresAt
    });

    // 🔴 SEND SMS
    // await sendSms(phone, otp);

    // UPDATED: Included otp in the response
    res.json({ 
      message: "OTP sent successfully",
      otp: otp // 👈 This allows your frontend to see the OTP in the network tab
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

// ================= VERIFY OTP =================
exports.verifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    const otpRecord = await Otp.findOne({ phone, otp });
    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (otpRecord.expiresAt < new Date()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    let user = await User.findOne({ phone });
    let isNewUser = false;

    if (!user) {
      user = await User.create({
        phone,
        isVerified: true
      });
      isNewUser = true;
    }

    // ✅ Fetch KYC info
    const kyc = await Kyc.findOne({ userId: user._id });

    let kycStatus = "NOT_STARTED";
    if (kyc) {
      kycStatus = kyc.kycStatus; // PENDING / VERIFIED / REJECTED
    }

    await Otp.deleteMany({ phone });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      message: "Login successful",
      token,
      user,
      isNewUser,
      kycStatus
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.googleLogin = async (req, res) => {
  console.log("googleLogin call" )
  try {
    const { token } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email, name, sub: googleId } = ticket.getPayload();

    let user = await User.findOne({ email });

    if (!user) {
      // Create user if they don't exist
      user = await User.create({
        email,
        name,
        googleId,
        isVerified: true,
        // Since Google doesn't always provide phone, we mark kyc as needed
      });
    }

    const kyc = await Kyc.findOne({ userId: user._id });
    let kycStatus = kyc ? kyc.kycStatus : "NOT_STARTED";

    const jwtToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Google Login successful",
      token: jwtToken,
      user,
      isNewUser: !kyc,
      kycStatus
    });

  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Google verification failed" });
  }
};
