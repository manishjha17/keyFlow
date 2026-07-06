const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  wpm: {
    type: Number,
    required: true
  },
  accuracy: {
    type: Number,
    required: true
  },
  mode: {
    type: String, // 'time' or 'words'
    required: true
  },
  duration: {
    type: Number, // the setting they chose (e.g., 30s or 25 words)
    required: true
  },
  language: {
    type: String,
    default: 'english'
  },
  raw: {
    type: Number
  },
  consistency: {
    type: Number
  }
}, { timestamps: true });

module.exports = mongoose.model('Score', scoreSchema);
