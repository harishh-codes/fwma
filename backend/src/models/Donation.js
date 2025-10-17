const mongoose = require('mongoose');

const DonationSchema = new mongoose.Schema({
  donorId: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
  title: String,
  description: String,
  quantity: String,
  pickupLocation: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } // [lng, lat]
  },
  images: [String],
  preferredPickupTime: Date,
  status: {
    type: String,
    enum: ['POSTED','ACCEPTED_BY_NGO','ASSIGNED_TO_DELIVERY','PICKED_UP','DELIVERED','CANCELLED'],
    default: 'POSTED'
  },
  ngoId: { type: mongoose.Types.ObjectId, ref: 'User' },
  deliveryPartnerId: { type: mongoose.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date
});

DonationSchema.index({ pickupLocation: '2dsphere' });

module.exports = mongoose.model('Donation', DonationSchema);
