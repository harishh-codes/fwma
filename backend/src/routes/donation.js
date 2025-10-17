const express = require('express');
const router = express.Router();
const { io } = require('../index');
const User = require('../models/User');
const Donation = require('../models/Donation');
const authMiddleware = require('../middleware/auth'); // we will create simple auth next

// create donation
router.post('/', authMiddleware, async (req, res) => {
  const { title, description, quantity, pickupLng, pickupLat, preferredPickupTime } = req.body;
  const donation = await Donation.create({
    donorId: req.user.id,
    title,
    description,
    quantity,
    pickupLocation: { type: 'Point', coordinates: [parseFloat(pickupLng), parseFloat(pickupLat)] },
    preferredPickupTime
  });
  res.json(donation);
});

// list current user's donations
router.get('/mine', authMiddleware, async (req, res) => {
  const donations = await Donation.find({ donorId: req.user.id });
  res.json(donations);
});

// get available donations near a location (for NGOs)
router.get('/nearby', authMiddleware, async (req, res) => {
  const { lng, lat, radius } = req.query;
  const maxDistance = (parseFloat(radius) || 5) * 1000; // km to meters
  const donations = await Donation.find({
    pickupLocation: {
      $near: {
        $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
        $maxDistance: maxDistance
      }
    },
    status: 'POSTED'
  }).limit(50);
  res.json(donations);
});

router.post('/:id/accept', authMiddleware, async (req, res) => {
  const donation = await Donation.findById(req.params.id);
  if (!donation) return res.status(404).json({ message: 'Not found' });

  donation.status = 'ACCEPTED_BY_NGO';
  donation.ngoId = req.user.id;
  donation.updatedAt = Date.now();
  await donation.save();

  // find nearby delivery partners
  const [lng, lat] = donation.pickupLocation.coordinates;
  const maxDistance = 5000; // meters
  const partners = await User.find({
    role: 'delivery',
    isAvailable: true,
    location: {
      $near: { $geometry: { type: 'Point', coordinates: [lng, lat] }, $maxDistance: maxDistance }
    }
  }).limit(10);

  // emit offers via sockets to partners' rooms
  partners.forEach(p => {
    io.to(`user:${p._id}`).emit('assignment:offer', { donationId: donation._id, pickup: donation.pickupLocation });
  });

  // notify donor
  io.to(`user:${donation.donorId}`).emit('donation:accepted', donation);

  res.json({ message: 'Accepted and offers sent to partners', partnersCount: partners.length });
});

// delivery accepts assignment
router.post('/:id/assign', authMiddleware, async (req, res) => {
  const donationId = req.params.id;
  const userId = req.user.id;
  // atomic update: only assign if current status is ACCEPTED_BY_NGO and no deliveryPartnerId
  const updated = await Donation.findOneAndUpdate(
    { _id: donationId, status: 'ACCEPTED_BY_NGO', deliveryPartnerId: { $exists: false } },
    { $set: { deliveryPartnerId: userId, status: 'ASSIGNED_TO_DELIVERY', updatedAt: Date.now() } },
    { new: true }
  );
  if (!updated) return res.status(409).json({ message: 'Already assigned or invalid status' });
  
  // notify donor and NGO
  io.to(`user:${updated.donorId}`).emit('assignment:accepted', updated);
  io.to(`user:${updated.ngoId}`).emit('assignment:accepted', updated);

  res.json({ message: 'Assigned to you', donation: updated });
});

router.post('/:id/location', authMiddleware, async (req, res) => {
  const { lat, lng } = req.body;
  const donation = await Donation.findById(req.params.id);
  if (!donation) return res.status(404).json({});

  // update delivery partner location in user doc
  await User.findByIdAndUpdate(req.user.id, { location: { type: 'Point', coordinates: [lng, lat] } });

  // broadcast location to donation room
  io.to(`donation:${donation._id}`).emit('location:update', { lat, lng, donationId: donation._id });

  res.json({ ok: true });
});

router.post('/:id/picked-up', authMiddleware, async (req, res) => {
  const donation = await Donation.findById(req.params.id);
  if (!donation) return res.status(404).json();
  donation.status = 'PICKED_UP';
  donation.updatedAt = Date.now();
  await donation.save();
  io.to(`donation:${donation._id}`).emit('donation:status:update', donation);
  res.json(donation);
});

router.post('/:id/delivered', authMiddleware, async (req, res) => {
  const donation = await Donation.findById(req.params.id);
  if (!donation) return res.status(404).json();
  donation.status = 'DELIVERED';
  donation.updatedAt = Date.now();
  await donation.save();
  io.to(`donation:${donation._id}`).emit('donation:status:update', donation);
  res.json(donation);
});

module.exports = router;
