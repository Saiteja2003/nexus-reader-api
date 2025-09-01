// routes/feeds.js
const express = require("express");
const { URL } = require("url");
const Parser = require("rss-parser");
const Feed = require("../models/Feed");
const authMiddleware = require("../middleware/auth"); // Import our security guard

const router = express.Router();
const parser = new Parser();

// === GET ALL FEEDS FOR THE LOGGED-IN USER ===
router.get("/", authMiddleware, async (req, res) => {
  try {
    // Thanks to the middleware, we know who the user is from req.user.userId
    const feeds = await Feed.find({ user: req.user.userId }).sort({
      createdAt: -1,
    });
    res.json(feeds);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve feeds." });
  }
});

// === ADD A NEW FEED FOR THE LOGGED-IN USER ===
router.post("/", authMiddleware, async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: "URL is required." });
  }

  try {
    const feedData = await parser.parseURL(url);
    const domain = new URL(feedData.link || url).hostname;
    const favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

    const newFeed = new Feed({
      title: feedData.title,
      url: url,
      favicon: favicon,
      user: req.user.userId, // Associate the feed with the logged-in user
    });

    const savedFeed = await newFeed.save();
    res.status(201).json(savedFeed);
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(409)
        .json({ error: "This feed URL has already been added." });
    }
    res.status(400).json({ error: "Invalid or unreachable RSS feed URL." });
  }
});

// === DELETE A FEED OWNED BY THE LOGGED-IN USER ===
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const feed = await Feed.findById(req.params.id);

    if (!feed) {
      return res.status(404).json({ error: "Feed not found." });
    }

    // Security check: Make sure the person deleting the feed is the one who owns it
    if (feed.user.toString() !== req.user.userId) {
      return res.status(401).json({ error: "User not authorized" });
    }

    await Feed.findByIdAndDelete(req.params.id);
    res.json({ message: "Feed deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete feed." });
  }
});

router.get("/articles/all", authMiddleware, async (req, res) => {
  try {
    // 1. Find all feeds that belong to the current user
    const userFeeds = await Feed.find({ user: req.user.userId });
    if (!userFeeds.length) {
      return res.json([]); // Return an empty array if they have no feeds
    }

    // 2. Fetch articles from all feed URLs in parallel for speed
    const articlePromises = userFeeds.map((feed) => parser.parseURL(feed.url));
    const feedResults = await Promise.allSettled(articlePromises); // Use allSettled to prevent one bad feed from failing the whole request

    // 3. Combine all articles into one big array and add the source feed's title
    const allArticles = feedResults
      .filter((result) => result.status === "fulfilled") // Only use successfully fetched feeds
      .flatMap((result) => {
        // Add the feed's title to each article for display purposes
        const feedTitle = result.value.title;
        return result.value.items.map((item) => ({ ...item, feedTitle }));
      });

    // 4. Sort the final combined array by publication date, newest first
    allArticles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

    res.json(allArticles);
  } catch (error) {
    console.error("Failed to fetch all articles:", error);
    res.status(500).json({ error: "Failed to retrieve all articles." });
  }
});

module.exports = router;
