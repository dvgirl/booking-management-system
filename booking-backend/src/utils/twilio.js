const twilio = require("twilio");

const client = twilio(
  process.env.TWILIO_SID,
  process.env.TWILIO_AUTH
);

const sendSms = async (phone, otp) => {
  try {
    console.log("📞 Raw phone received:", phone);

    const formattedPhone = phone.startsWith("+")
      ? phone
      : `+91${phone}`;

    console.log("✅ Formatted phone for Twilio:", formattedPhone);
    console.log("🔐 OTP to send:", otp);
    console.log("📤 From (Twilio number):", process.env.TWILIO_PHONE);

    const response = await client.messages.create({
      body: `Your OTP is ${otp}`,
      from: process.env.TWILIO_PHONE,
      to: formattedPhone
    });

    console.log("✅ SMS SENT SUCCESSFULLY");
    console.log("📨 Twilio SID:", response.sid);

    return response;

  } catch (error) {
    console.error("❌ TWILIO SMS FAILED");

    // Most useful error info
    console.error("Error message:", error.message);
    console.error("Error code:", error.code);
    console.error("More info:", error.moreInfo);

    throw error; // IMPORTANT: rethrow so controller knows it failed
  }
};

module.exports = { sendSms };
