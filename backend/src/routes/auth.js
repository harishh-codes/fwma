const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

// request OTP (dummy)
router.post('/request-otp', async (req, res) => {
  const { phone, role, name } = req.body;
  if (!phone || !role) return res.status(400).json({ message: 'phone and role required' });
  let user = await User.findOne({ phone });
  if (!user) {
    user = await User.create({ phone, role, name });
  }
  const otp = Math.floor(1000 + Math.random()*9000).toString();
  user.otp = { code: otp, expiresAt: Date.now() + 5*60*1000 };
  await user.save();
  // **For demo** return OTP in response
  res.json({ message: 'OTP generated', otp, userId: user._id });
});

// verify OTP
router.post('/verify-otp', async (req, res) => {
  const { phone, otp } = req.body;
  const user = await User.findOne({ phone });
  if (!user) return res.status(404).json({ message: 'user not found' });
  // Demo: accept any otp OR match saved otp
  if (otp === '0000' || (user.otp && user.otp.code === otp && user.otp.expiresAt > Date.now())) {
    const token = signToken(user);
    return res.json({ token, user });
  }
  return res.status(400).json({ message: 'Invalid OTP' });
});

module.exports = router;
