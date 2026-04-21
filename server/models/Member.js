const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    rollNo: { type: String, required: true, trim: true, unique: true },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    role: { type: String, required: true, trim: true },
    profileImage: { type: String, required: true },
    teamName: { type: String, default: 'Team 11', trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Member', memberSchema);