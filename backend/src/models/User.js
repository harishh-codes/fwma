const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: String,
  phone: { type: String, required: true, unique: true },
  role: { type: String, enum: ['donor','ngo','delivery'], required: true },
  address: String,
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0,0] } // [lng, lat]
  },
  otp: { code: String, expiresAt: Date },
  isAvailable: { type: Boolean, default: true }, // for delivery
  createdAt: { type: Date, default: Date.now }
});

UserSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('User', UserSchema);
