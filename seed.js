// seed.js
require("dotenv").config();
const mongoose = require("mongoose");
const CuratedFeed = require("./models/CuratedFeed");

const curatedFeeds = [
  // --- Tech ---
  {
    title: "The Verge",
    url: "http://www.theverge.com/rss/index.xml",
    category: "Tech",
  },
  {
    title: "TechCrunch",
    url: "http://feeds.feedburner.com/TechCrunch/",
    category: "Tech",
  },
  { title: "Wired", url: "https://www.wired.com/feed/rss", category: "Tech" },
  {
    title: "Ars Technica",
    url: "http://feeds.arstechnica.com/arstechnica/index",
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
  {
    title: "CNET News",
    url: "https://www.cnet.com/rss/news/",
    category: "Tech",
  },
  {
    title: "Engadget",
    url: "https://www.engadget.com/rss.xml",
    category: "Tech",
  },

  // --- World News ---
  {
    title: "Reuters World News",
    url: "http://feeds.reuters.com/Reuters/worldNews",
    category: "World News",
  },
  {
    title: "BBC News - World",
    url: "http://feeds.bbci.co.uk/news/world/rss.xml",
    category: "World News",
  },
  {
    title: "The Guardian World",
    url: "https://www.theguardian.com/world/rss",
    category: "World News",
  },
  {
    title: "New York Times - World",
    url: "http://www.nytimes.com/services/xml/rss/nyt/World.xml",
    category: "World News",
  },
  {
    title: "Associated Press - World",
    url: "http://hosted.ap.org/lineups/WORLDHEADS.rss",
    category: "World News",
  },
  {
    title: "NPR News",
    url: "https://feeds.npr.org/1001/rss.xml",
    category: "World News",
  },
  {
    title: "The Economist",
    url: "https://www.economist.com/sections/international/rss.xml",
    category: "World News",
  },

  // --- Business & Finance ---
  {
    title: "Wall Street Journal - World News",
    url: "http://online.wsj.com/xml/rss/3_7085.xml",
    category: "Business",
  },
  {
    title: "Bloomberg",
    url: "https://www.bloomberg.com/feed/podcast/law.xml",
    category: "Business",
  },
  {
    title: "Harvard Business Review",
    url: "http://feeds.harvardbusiness.org/harvardbusiness?format=xml",
    category: "Business",
  },
  {
    title: "Forbes",
    url: "https://www.forbes.com/business/feed/",
    category: "Business",
  },
  {
    title: "Financial Times - US",
    url: "http://www.ft.com/rss/home/us",
    category: "Business",
  },

  // --- Politics ---
  {
    title: "Politico",
    url: "http://www.politico.com/rss/politicopicks.xml",
    category: "Politics",
  },
  {
    title: "FiveThirtyEight",
    url: "http://fivethirtyeight.com/politics/feed/",
    category: "Politics",
  },
  {
    title: "The Hill",
    url: "https://thehill.com/rss/syndicator/19109",
    category: "Politics",
  },
  {
    title: "RealClearPolitics",
    url: "http://feeds.feedburner.com/realclearpolitics/qlMj",
    category: "Politics",
  },
  {
    title: "NPR Politics",
    url: "https://www.npr.org/rss/rss.php?id=1014",
    category: "Politics",
  },

  // --- Science ---
  {
    title: "NASA Breaking News",
    url: "http://www.nasa.gov/rss/dyn/breaking_news.rss",
    category: "Science",
  },
  {
    title: "ScienceDaily",
    url: "http://feeds.sciencedaily.com/sciencedaily",
    category: "Science",
  },
  {
    title: "Nature",
    url: "http://feeds.nature.com/nbt/rss/current",
    category: "Science",
  },
  {
    title: "Scientific American",
    url: "http://rss.sciam.com/ScientificAmerican-Global",
    category: "Science",
  },
  {
    title: "National Geographic",
    url: "http://news.nationalgeographic.com/rss/index.rss",
    category: "Science",
  },
  {
    title: "New Scientist",
    url: "http://feeds.newscientist.com/science-news",
    category: "Science",
  },

  // --- Health ---
  {
    title: "Mayo Clinic",
    url: "http://www.mayoclinic.org/rss/all-health-information-topics",
    category: "Health",
  },
  {
    title: "Reuters Health News",
    url: "http://feeds.reuters.com/reuters/healthNews",
    category: "Health",
  },
  {
    title: "New York Times - Health",
    url: "http://www.nytimes.com/services/xml/rss/nyt/Health.xml",
    category: "Health",
  },
  {
    title: "NPR Health",
    url: "https://www.npr.org/rss/rss.php?id=1128",
    category: "Health",
  },
  {
    title: "Medical News Today",
    url: "http://rss.medicalnewstoday.com/featurednews.xml",
    category: "Health",
  },

  // --- Sports ---
  {
    title: "ESPN",
    url: "http://sports.espn.go.com/espn/rss/news",
    category: "Sports",
  },
  {
    title: "Yahoo Sports",
    url: "https://sports.yahoo.com/rss/",
    category: "Sports",
  },
  {
    title: "Sports Illustrated",
    url: "http://www.si.com/rss/si_topstories.rss",
    category: "Sports",
  },
  {
    title: "SB Nation",
    url: "http://feeds.sbnation.com/rss/streams",
    category: "Sports",
  },

  // --- Entertainment ---
  {
    title: "Variety",
    url: "http://variety.com/feed/",
    category: "Entertainment",
  },
  {
    title: "The Hollywood Reporter",
    url: "http://www.hollywoodreporter.com/blogs/live-feed/rss",
    category: "Entertainment",
  },
  {
    title: "Rolling Stone",
    url: "http://www.rollingstone.com/news.rss",
    category: "Entertainment",
  },
  {
    title: "Vulture",
    url: "http://feeds.feedburner.com/nymag/vulture",
    category: "Entertainment",
  },
  {
    title: "TMZ",
    url: "http://www.tmz.com/rss.xml",
    category: "Entertainment",
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
