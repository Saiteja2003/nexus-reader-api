// models/Feed.js

const mongoose = require('mongoose');

// This is the blueprint for our feed data
const feedSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
    unique: true, // Don't allow duplicate feed URLs
  },
  // Automatically adds 'createdAt' and 'updatedAt' fields
}, { timestamps: true });

module.exports = mongoose.model('Feed', feedSchema);