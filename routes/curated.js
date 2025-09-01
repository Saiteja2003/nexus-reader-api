// routes/curated.js
const express = require("express");
const CuratedFeed = require("../models/CuratedFeed");

const router = express.Router();

// GET all curated feeds, grouped by category
router.get("/", async (req, res) => {
  try {
    const feeds = await CuratedFeed.find({});

    // Group the flat list of feeds into a structured object by category
    const groupedFeeds = feeds.reduce((acc, feed) => {
      const { category } = feed;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(feed);
      return acc;
    }, {});

    res.json(groupedFeeds);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve curated feeds." });
  }
});

module.exports = router;
