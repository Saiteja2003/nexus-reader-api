// src/index.js

// 1. Import required packages
const express = require('express');
const cors = require('cors');
const Parser = require('rss-parser');

// 2. Create an instance of Express and the RSS Parser
const app = express();
const parser = new Parser();

// 3. Middleware
// The cors middleware allows requests from other origins (our React frontend)
app.use(cors());

// 4. Define the API endpoint
// This is an async function because fetching data over the internet takes time.
app.get('/api/feed', async (req, res) => {
  // Get the 'url' of the RSS feed from the query parameters
  // Example: http://localhost:4000/api/feed?url=https://example.com/rss
  const feedUrl = req.query.url;

  // Basic validation: If no URL is provided, send an error
  if (!feedUrl) {
    return res.status(400).json({ error: 'Feed URL is required.' });
  }

  try {
    // Use the rss-parser library to fetch and parse the feed
    const feed = await parser.parseURL(feedUrl);
    // If successful, send the parsed feed back as JSON
    res.json(feed);
  } catch (error) {
    // If there's an error (e.g., invalid URL, network issue), send a server error
    console.error('Failed to fetch or parse feed:', error);
    res.status(500).json({ error: 'Failed to fetch or parse the RSS feed.' });
  }
});

// 5. Start the server
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});