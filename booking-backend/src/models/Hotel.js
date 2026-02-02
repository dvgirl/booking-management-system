const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  address: { type: String, required: true },
  description: { type: String },
  
  // ADD THIS FIELD TO FIX THE ERROR
  manager: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', // This must match the name used in mongoose.model('User', ...)
    default: null 
  }
}, { timestamps: true });

module.exports = mongoose.model('Hotel', hotelSchema);