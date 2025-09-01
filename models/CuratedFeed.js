// models/CuratedFeed.js
const mongoose = require("mongoose");

const curatedFeedSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
    unique: true,
  },
  category: {
    type: String,
    required: true,
    enum: ["Tech", "Global News", "Sports", "Design"], // Defines the allowed categories
  },
});

module.exports = mongoose.model("CuratedFeed", curatedFeedSchema);
