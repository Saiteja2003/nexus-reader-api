// seed.js
require("dotenv").config();
const mongoose = require("mongoose");
const CuratedFeed = require("./models/CuratedFeed");

const curatedFeeds = [
  // Tech
  {
    title: "The Verge",
    url: "https://www.theverge.com/rss/index.xml",
    category: "Tech",
  },
  {
    title: "TechCrunch",
    url: "https://techcrunch.com/feed/",
    category: "Tech",
  },
  {
    title: "Hacker News",
    url: "https://news.ycombinator.com/rss",
    category: "Tech",
  },
  {
    title: "MIT Technology Review",
    url: "https://www.technologyreview.com/feed/",
    category: "Tech",
  },
  // Global News
  {
    title: "Reuters World News",
    url: "https://www.reuters.com/tools/rss/reuters-share-of-the-news-wire.xml",
    category: "Global News",
  },
  {
    title: "The Guardian World",
    url: "https://www.theguardian.com/world/rss",
    category: "Global News",
  },
  {
    title: "NPR News",
    url: "https://feeds.npr.org/1001/rss.xml",
    category: "Global News",
  },
  // Sports
  {
    title: "ESPN",
    url: "https://www.espn.com/espn/rss/news",
    category: "Sports",
  },
  {
    title: "Yahoo Sports",
    url: "https://sports.yahoo.com/rss/",
    category: "Sports",
  },
  // Design
  {
    title: "Smashing Magazine",
    url: "https://www.smashingmagazine.com/feed/",
    category: "Design",
  },
  {
    title: "A List Apart",
    url: "https://alistapart.com/main/feed/",
    category: "Design",
  },
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected for seeding...");

    await CuratedFeed.deleteMany({}); // Clear the collection before seeding
    console.log("Existing curated feeds cleared.");

    await CuratedFeed.insertMany(curatedFeeds);
    console.log("Database seeded successfully with new curated feeds!");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    mongoose.connection.close();
    console.log("MongoDB connection closed.");
  }
};

seedDatabase();
