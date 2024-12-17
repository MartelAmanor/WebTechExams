const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const validate = require('../middleware/validate');
const Event = require('../models/Event');
const User = require('../models/User');

// @route   GET api/events
// @desc    Get all events
// @access  Public
router.get('/', async (req, res) => {
  try {
    const events = await Event.find()
      .sort({ date: 1 })
      .populate('createdBy', 'name')
      .populate('registeredUsers', '_id name');
    res.json(events);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   GET api/events/:id
// @desc    Get event by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('createdBy', 'name')
      .populate('registeredUsers', '_id name');

    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }

    res.json(event);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Event not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   POST api/events
// @desc    Create an event
// @access  Private (Admin only)
router.post('/', [
  auth,
  admin,
  [
    check('title', 'Title is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty(),
    check('location', 'Location is required').not().isEmpty(),
    check('category', 'Category is required').isIn(['social', 'academic', 'sports', 'cultural', 'other']),
    check('capacity', 'Capacity must be a positive number if provided')
      .optional()
      .isInt({ min: 1 })
  ],
  validate
], async (req, res) => {
  try {
    const { title, description, date, location, category, capacity } = req.body;

    // Log the received data
    console.log('Received event data:', {
      title,
      description,
      date,
      location,
      category,
      capacity
    });

    // Validate date
    const eventDate = new Date(date);
    if (isNaN(eventDate.getTime())) {
      return res.status(400).json({ msg: 'Invalid date format' });
    }

    // Create event object
    const eventData = {
      title,
      description,
      date: eventDate,
      location,
      category,
      createdBy: req.user.id
    };

    // Only add capacity if it's provided
    if (capacity) {
      eventData.capacity = capacity;
    }

    // Log the event data being saved
    console.log('Saving event data:', eventData);

    const newEvent = new Event(eventData);
    const event = await newEvent.save();

    const populatedEvent = await Event.findById(event._id)
      .populate('createdBy', 'name email')
      .populate('registeredUsers', '_id name');

    res.json(populatedEvent);
  } catch (err) {
    console.error('Event creation error:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        msg: 'Invalid event data', 
        errors: Object.values(err.errors).map(e => ({ msg: e.message }))
      });
    }
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
});

// @route   PUT api/events/:id
// @desc    Update an event
// @access  Private (Admin only)
router.put('/:id', [auth, admin], async (req, res) => {
  try {
    let event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }

    event = await Event.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    ).populate('createdBy', 'name');

    res.json(event);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/events/:id
// @desc    Delete an event
// @access  Private (Admin only)
router.delete('/:id', [auth, admin], async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }

    await event.remove();
    res.json({ msg: 'Event removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/events/:id/register
// @desc    Register for an event
// @access  Private
router.post('/:id/register', auth, async (req, res) => {
  try {
    console.log('Registration attempt for event:', req.params.id);
    console.log('User ID:', req.user.id);

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }

    // Check if event is full
    if (event.registeredUsers.length >= event.capacity) {
      return res.status(400).json({ msg: 'Event is full' });
    }

    // Check if user is already registered
    if (event.registeredUsers.includes(req.user.id)) {
      return res.status(400).json({ msg: 'Already registered for this event' });
    }

    // Add user to event's registered users
    event.registeredUsers.push(req.user.id);
    await event.save();

    // Add event to user's registered events
    const user = await User.findById(req.user.id);
    if (!user.registeredEvents.includes(event._id)) {
      user.registeredEvents.push(event._id);
      await user.save();
    }

    // Return populated event
    const updatedEvent = await Event.findById(event._id)
      .populate('registeredUsers', '_id name')
      .populate('createdBy', 'name');

    res.json(updatedEvent);
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
});

// @route   DELETE api/events/:id/register
// @desc    Cancel registration for an event
// @access  Private
router.delete('/:id/register', auth, async (req, res) => {
  try {
    console.log('Cancellation attempt for event:', req.params.id);
    console.log('User ID:', req.user.id);

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }

    // Check if user is registered
    if (!event.registeredUsers.includes(req.user.id)) {
      return res.status(400).json({ msg: 'Not registered for this event' });
    }

    // Remove user from event's registered users
    event.registeredUsers = event.registeredUsers.filter(
      userId => userId.toString() !== req.user.id
    );
    await event.save();

    // Remove event from user's registered events
    const user = await User.findById(req.user.id);
    user.registeredEvents = user.registeredEvents.filter(
      eventId => eventId.toString() !== event._id.toString()
    );
    await user.save();

    // Return populated event
    const updatedEvent = await Event.findById(event._id)
      .populate('registeredUsers', '_id name')
      .populate('createdBy', 'name');

    res.json(updatedEvent);
  } catch (err) {
    console.error('Cancellation error:', err);
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
});

module.exports = router;
