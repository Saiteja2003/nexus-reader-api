// models/Feed.js

const mongoose = require("mongoose");

// This is the blueprint for our feed data
const feedSchema = new mongoose.Schema(
  {
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
    favicon: { type: String },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // This tells Mongoose the 'user' field corresponds to a User model
      required: true,
    },
  },

  { timestamps: true }
);

module.exports = mongoose.model("Feed", feedSchema);
