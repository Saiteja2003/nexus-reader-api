// routes/articles.js
const express = require("express");
const SavedArticle = require("../models/SavedArticle");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// === GET ALL SAVED ARTICLES FOR THE LOGGED-IN USER ===
router.get("/saved", authMiddleware, async (req, res) => {
  try {
    const articles = await SavedArticle.find({ user: req.user.userId }).sort({
      createdAt: -1,
    });
    res.json(articles);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve saved articles." });
  }
});

// === SAVE A NEW ARTICLE ===
router.post("/save", authMiddleware, async (req, res) => {
  try {
    const { title, link, pubDate, content, feedTitle } = req.body;
    const newArticle = new SavedArticle({
      title,
      link,
      pubDate,
      content,
      feedTitle,
      user: req.user.userId,
    });
    const savedArticle = await newArticle.save();
    res.status(201).json(savedArticle);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: "Article already saved." });
    }
    res.status(500).json({ error: "Failed to save article." });
  }
});

// === UNSAVE (DELETE) AN ARTICLE ===
router.delete("/unsave/:articleLink", authMiddleware, async (req, res) => {
  try {
    const articleLink = decodeURIComponent(req.params.articleLink);
    const article = await SavedArticle.findOne({
      link: articleLink,
      user: req.user.userId,
    });

    if (!article) {
      return res.status(404).json({ error: "Saved article not found." });
    }

    await SavedArticle.findByIdAndDelete(article._id);
    res.json({ message: "Article unsaved successfully." });
  } catch (error) {
    res.status(500).json({ error: "Failed to unsave article." });
  }
});

module.exports = router;
