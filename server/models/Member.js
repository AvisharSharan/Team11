const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    rollNumber: { type: String, required: true, trim: true, unique: true },
    year: {
      type: String,
      required: true,
      enum: ['1st Year', '2nd Year', '3rd Year', '4th Year'],
    },
    degree: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    role: { type: String, required: true, trim: true },
    aboutProject: { type: String, required: true, trim: true },
    hobbies: [{ type: String, trim: true }],
    certificate: { type: String, trim: true, default: '' },
    internship: { type: String, trim: true, default: '' },
    aboutAim: { type: String, trim: true, default: '' },
    photoUrl: { type: String, required: true },
    photoPublicId: { type: String, default: '' },
    photoName: { type: String, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Member', memberSchema);