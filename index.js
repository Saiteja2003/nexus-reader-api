// index.js

// Load environment variables from .env file
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const Parser = require("rss-parser");

// Import the Feed model
const Feed = require("./models/Feed");

const app = express();
const parser = new Parser();

const authRoutes = require("./routes/auth");
// Middleware
const allowedOrigins = [
  "https://nexus-reader-client-livid.vercel.app",
  "http://localhost:5173", // Also allow your local dev environment
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg =
        "The CORS policy for this site does not allow access from the specified Origin.";
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
};

// Use the new cors options
app.use(cors(corsOptions));
app.use(express.json()); // Middleware to parse JSON request bodies
app.use("/api/auth", authRoutes);
// --- Database Connection ---
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected successfully."))
  .catch((err) => console.error("MongoDB connection error:", err));

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
    res.status(500).json({ error: "Failed to fetch or parse the RSS feed." });
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
