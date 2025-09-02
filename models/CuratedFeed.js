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
    enum: [
      "Tech",
      "World News",
      "Business",
      "Politics",
      "Science",
      "Health",
      "Sports",
      "Entertainment",
    ], // Defines the allowed categories
  },
});

module.exports = mongoose.model("CuratedFeed", curatedFeedSchema);
