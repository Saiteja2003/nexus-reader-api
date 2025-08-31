// routes/auth.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator"); // Import validation tools
const User = require("../models/User");
const Feed = require("../models/Feed");
const router = express.Router();

const defaultFeeds = [
  { title: "The Verge", url: "https://www.theverge.com/rss/index.xml" },
  {
    title: "MIT Technology Review",
    url: "https://www.technologyreview.com/feed/",
  },
  {
    title: "Reuters: World News",
    url: "https://www.reuters.com/tools/rss/reuters-share-of-the-news-wire.xml",
  },
  { title: "Smashing Magazine", url: "https://www.smashingmagazine.com/feed/" },
  { title: "Hacker News", url: "https://news.ycombinator.com/rss" },
  { title: "ScienceDaily", url: "https://www.sciencedaily.com/rss/top.xml" },
];
// Define our validation rules for registration
const registrationRules = [
  body("email", "Please include a valid email").isEmail().toLowerCase(),
  body("password", "Please enter a password with 8 or more characters")
    .isLength({ min: 8 })
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number")
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage("Password must contain at least one special character"),
];

// === REGISTER A NEW USER (with Validation) ===
router.post("/register", registrationRules, async (req, res) => {
  // First, check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ errors: [{ msg: "User already exists" }] });
    }

    user = new User({ email, password });
    await user.save();
    res.status(201).json({ msg: "User registered successfully" });
    // ✅ NEW, MORE ROBUST METHOD
    (async () => {
      try {
        await Promise.all(
          defaultFeeds.map(async (feed) => {
            const domain = new URL(feed.url).hostname;
            const newFeed = new Feed({
              ...feed,
              favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
              user: user.id,
            });
            await newFeed.save();
          })
        );
      } catch (seedingError) {
        console.error("--- BACKGROUND FEED SEEDING FAILED ---");
        console.error(seedingError);
      }
    })();
  } catch (error) {
    console.error("--- USER CREATION FAILED ---");
    console.error(error);
    res.status(500).json({ error: "Server error during user creation" });
  }
});

// === LOG IN A USER (with Validation) ===
const loginRules = [
  body("email", "Please include a valid email").isEmail().toLowerCase(),
  body("password", "Password is required").exists(),
];

router.post("/login", loginRules, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ errors: [{ msg: "Invalid credentials" }] });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ errors: [{ msg: "Invalid credentials" }] });
    }

    const payload = { userId: user.id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
