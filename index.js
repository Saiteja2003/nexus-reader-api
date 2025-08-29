// index.js

// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Parser = require('rss-parser');

// Import the Feed model
const Feed = require('./models/Feed');

const app = express();
const parser = new Parser();

// Middleware
app.use(cors());
app.use(express.json()); // Middleware to parse JSON request bodies

// --- Database Connection ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected successfully.'))
  .catch(err => console.error('MongoDB connection error:', err));


// --- API Endpoints ---

// Original endpoint for fetching articles from a specific URL (still useful)
app.get('/api/fetch-articles', async (req, res) => {
  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ error: 'Feed URL is required.' });
  }
  try {
    const feed = await parser.parseURL(url);
    res.json(feed);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch or parse the RSS feed.' });
  }
});

// NEW: Get all saved feeds from the database
app.get('/api/feeds', async (req, res) => {
  try {
    const feeds = await Feed.find({}).sort({ createdAt: -1 }); // Get newest first
    res.json(feeds);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve feeds.' });
  }
});

// NEW: Add a new feed to the database
app.post('/api/feeds', async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'URL is required.' });
  }

  try {
    // 1. Check if the feed is a valid RSS feed by trying to parse it
    const feedData = await parser.parseURL(url);

    // 2. If it's valid, create a new Feed document
    const newFeed = new Feed({
      title: feedData.title,
      url: url, // Use the original URL provided by the user
    });

    // 3. Save it to the database
    const savedFeed = await newFeed.save();
    res.status(201).json(savedFeed);

  } catch (error) {
    // Handle potential errors: duplicate URL or invalid feed
    if (error.code === 11000) { // MongoDB duplicate key error
      return res.status(409).json({ error: 'This feed URL has already been added.' });
    }
    res.status(400).json({ error: 'Invalid or unreachable RSS feed URL.' });
  }
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});