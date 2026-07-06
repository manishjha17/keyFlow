const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
  },
  avatarSeed: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    default: '',
    maxlength: 200
  },
  streak: {
    type: Number,
    default: 0
  },
  lastTestDate: {
    type: Date,
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
