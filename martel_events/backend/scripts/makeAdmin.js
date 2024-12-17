const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const makeAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const user = await User.findOneAndUpdate(
      { email: 'martelamanor2004@icloud.com' },
      { $set: { role: 'admin' } },
      { new: true }
    );

    if (user) {
      console.log('User updated to admin:', {
        email: user.email,
        role: user.role,
        name: user.name
      });
    } else {
      console.log('User not found');
    }

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
};

makeAdmin();
