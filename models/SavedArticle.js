// models/SavedArticle.js
const mongoose = require("mongoose");

const savedArticleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    link: { type: String, required: true },
    pubDate: { type: Date },
    content: { type: String },
    feedTitle: { type: String },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Create a compound index to prevent a user from saving the same article twice
savedArticleSchema.index({ user: 1, link: 1 }, { unique: true });

module.exports = mongoose.model("SavedArticle", savedArticleSchema);
