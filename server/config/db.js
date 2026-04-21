const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Drop conflicting indexes on Member collection if they exist (for development)
    const Member = require('../models/Member');
    try {
      await Member.collection.dropIndex('rollNumber_1');
      console.log('Dropped old rollNumber index');
    } catch (err) {
      // Index doesn't exist, that's fine
    }
    try {
      await Member.collection.dropIndex('email_1');
      console.log('Dropped old email index');
    } catch (err) {
      // Index doesn't exist, that's fine
    }
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
