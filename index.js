// index.js

// Load environment variables from .env file
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const Parser = require("rss-parser");

// Import the Feed model
const Feed = require("./models/Feed");
const authRoutes = require("./routes/auth");
const feedRoutes = require("./routes/feeds");
const app = express();
const parser = new Parser();
const curatedRoutes = require("./routes/curated");
const articleRoutes = require("./routes/articles");
// Middleware
const allowedOrigins = [
  "https://nexus-reader-client-pi.vercel.app",
  "http://localhost:5173",
  "https://nexusreader.org",
  "https://www.nexusreader.org",
  /https:\/\/nexus-reader-client.*\.vercel\.app$/, // Also allow your local dev environment
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(
        new Error(
          "The CORS policy for this site does not allow access from the specified Origin."
        )
      );
    }
  },
};

// Use the new cors options
app.use(cors(corsOptions));
app.use(express.json()); // Middleware to parse JSON request bodies
app.use("/api/auth", authRoutes);
app.use("/api/curated", curatedRoutes); // Use the new routes
app.use("/api/articles", articleRoutes);
// --- Database Connection ---
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected successfully."))
  .catch((err) => console.error("MongoDB connection error:", err));
app.use("/api/auth", authRoutes);
app.use("/api/feeds", feedRoutes);
// --- API Endpoints ---

// Original endpoint for fetching articles from a specific URL (still useful)
app.get("/api/fetch-articles", async (req, res) => {
  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ error: "Feed URL is required." });
  }
  try {
    const feed = await parser.parseURL(url);
    res.json(feed);
  } catch (error) {
    console.error(`Failed to parse feed at URL: ${url}`, error);
    // Send a specific error response for this single failed request
    res.status(500).json({
      error:
        "Failed to fetch or parse the RSS feed. The source may be invalid or temporarily down.",
    });
  }
});

// NEW: Get all saved feeds from the database
app.get("/api/feeds", async (req, res) => {
  try {
    const feeds = await Feed.find({}).sort({ createdAt: -1 }); // Get newest first
    res.json(feeds);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve feeds." });
  }
});

// NEW: Add a new feed to the database
app.post("/api/feeds", async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: "URL is required." });
  }

  try {
    const feedData = await parser.parseURL(url);

    // ✅ NEW: Logic to get the favicon
    const domain = new URL(feedData.link || url).hostname;
    const favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

    const newFeed = new Feed({
      title: feedData.title,
      url: url,
      favicon: favicon, // ✅ Save the favicon URL
    });

    const savedFeed = await newFeed.save();
    res.status(201).json(savedFeed);
  } catch (error) {
    // ... error handling is unchanged
    if (error.code === 11000) {
      return res
        .status(409)
        .json({ error: "This feed URL has already been added." });
    }
    res.status(400).json({ error: "Invalid or unreachable RSS feed URL." });
  }
});

app.delete("/api/feeds/:id", async (req, res) => {
  try {
    const { id } = req.params; // Get the ID from the URL parameter
    const deletedFeed = await Feed.findByIdAndDelete(id);

    if (!deletedFeed) {
      return res.status(404).json({ error: "Feed not found." });
    }

    res.json({ message: "Feed deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete feed." });
  }
});
// --- Start the Server ---
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
