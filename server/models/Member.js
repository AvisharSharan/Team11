const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    rollNo: { type: String, required: true, trim: true, unique: true, sparse: true },
    year: { type: String, trim: true },
    degree: { type: String, trim: true },
    aboutProject: { type: String, trim: true },
    hobbies: { type: String, trim: true },
    certificate: { type: String, trim: true },
    internship: { type: String, trim: true },
    aboutAim: { type: String, trim: true },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      sparse: true,
    },
    role: { type: String, trim: true },
    profileImage: { type: String, required: true },
    teamName: { type: String, default: 'Team 11', trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Member', memberSchema);