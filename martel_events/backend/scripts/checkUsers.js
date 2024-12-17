const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const checkUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const users = await User.find({});
    console.log('All users:', users.map(user => ({
      email: user.email,
      role: user.role,
      name: user.name
    })));

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
};

checkUsers();
