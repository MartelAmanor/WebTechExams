const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check } = require('express-validator');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const User = require('../models/User');
const mongoose = require('mongoose');

// @route   POST api/auth/register
// @desc    Register a user
// @access  Public
router.post('/register', [
  check('name', 'Name is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
  validate
], async (req, res) => {
  console.log('Registration endpoint hit with body:', {
    name: req.body.name,
    email: req.body.email,
    hasPassword: !!req.body.password,
    preferences: req.body.preferences
  });

  try {
    const { name, email, password, preferences } = req.body;

    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      console.error('MongoDB not connected. Connection state:', mongoose.connection.readyState);
      return res.status(503).json({ msg: 'Database connection unavailable. Please try again later.' });
    }

    console.log('Checking if user exists...');
    // Check if user exists
    let user = await User.findOne({ email });
    
    if (user) {
      console.log('User already exists with email:', email);
      return res.status(400).json({ msg: 'User already exists' });
    }

    console.log('Creating new user...');
    // Create new user
    user = new User({
      name,
      email,
      password,
      role: 'admin', // Make the first user an admin
      preferences: preferences || []
    });

    // Hash password
    console.log('Hashing password...');
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    console.log('Saving user to database...');
    await user.save();

    console.log('User saved successfully. Creating JWT token...');
    // Create and return JWT token
    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '5h' },
      (err, token) => {
        if (err) {
          console.error('JWT Sign Error:', err);
          return res.status(500).json({ msg: 'Error creating authentication token' });
        }
        console.log('Registration complete. Sending response...');
        res.json({ token });
      }
    );
  } catch (err) {
    console.error('Registration Error:', {
      message: err.message,
      stack: err.stack,
      code: err.code,
      name: err.name
    });
    
    if (err.name === 'ValidationError') {
      return res.status(400).json({ msg: 'Invalid input data', errors: err.errors });
    }
    
    if (err.code === 11000) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    res.status(500).json({ msg: 'Server error during registration', error: err.message });
  }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists(),
  validate
], async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '5h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/auth
// @desc    Get authenticated user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('registeredEvents');
    
    // Add isAdmin field based on role
    const userData = user.toObject();
    userData.isAdmin = user.role === 'admin';
    
    console.log('User data being sent:', {
      id: userData._id,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      isAdmin: userData.isAdmin
    });
    
    res.json(userData);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/auth/password
// @desc    Change password
// @access  Private
router.put('/password', [
  auth,
  [
    check('currentPassword', 'Current password is required').exists(),
    check('newPassword', 'Please enter a new password with 6 or more characters').isLength({ min: 6 })
  ],
  validate
], async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user.id).select('+password');

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Current password is incorrect' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ msg: 'Password updated successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
