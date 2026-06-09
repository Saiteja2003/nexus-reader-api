require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const Parser = require("rss-parser");

// Import Routers
const authRoutes = require("./routes/auth");
const feedRoutes = require("./routes/feeds");
const articleRoutes = require("./routes/articles");
const curatedRoutes = require("./routes/curated");
const aiRoutes = require("./routes/ai");

const app = express();
const parser = new Parser();

// --- Middleware ---

// CORS Configuration that correctly handles Regex for Vercel previews
const allowedOrigins = [
  "https://nexusreader.org",
  "https://www.nexusreader.org",
  /https:\/\/nexus-reader-client.*\.vercel\.app$/, // Allows all your Vercel preview deployments
  "http://localhost:5173",
  "http://localhost:5174",
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (
      allowedOrigins.some((pattern) =>
        pattern instanceof RegExp ? pattern.test(origin) : pattern === origin
      )
    ) {
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
app.use(cors(corsOptions));
app.use(express.json());

// --- Database Connection ---
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected successfully."))
  .catch((err) => console.error("MongoDB connection error:", err));

// --- API Routers ---
app.use("/api/auth", authRoutes);
app.use("/api/feeds", feedRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/curated", curatedRoutes);
app.use("/api/ai", aiRoutes);

// This is the only public endpoint that doesn't require authentication
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
    res.status(500).json({
      error: `Failed to fetch or parse the RSS feed. The source may be invalid or temporarily down.`,
    });
  }
});

// --- Start the Server ---
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
