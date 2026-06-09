const express = require("express");
const authMiddleware = require("../middleware/auth"); // Correct path to middleware
const axios = require("axios");

const router = express.Router();

// The correct, stable model name for the API
console.log("--- RUNNING LATEST AI ROUTE CODE (v5 - gemini-pro) ---");

const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${process.env.GEMINI_API_KEY}`;
// === SUMMARIZE ARTICLE CONTENT ===
router.post("/summarize", authMiddleware, async (req, res) => {
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ error: "Article content is required." });
  }

  try {
    const prompt = `Summarize the following article content into a few concise paragraphs. Focus on the key points and main takeaways:\n\n---\n\n${content}`;

    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
    };

    const apiResponse = await axios.post(API_URL, payload);

    // This handles cases where the model might refuse to answer due to safety settings.
    if (
      !apiResponse.data.candidates ||
      apiResponse.data.candidates.length === 0
    ) {
      console.error(
        "AI summarization failed: No candidates returned from API."
      );
      return res
        .status(500)
        .json({ error: "The AI model did not provide a response." });
    }

    const summary = apiResponse.data.candidates[0].content.parts[0].text;
    res.json({ summary });
  } catch (error) {
    console.error(
      "AI summarization failed:",
      error.response ? error.response.data : error.message
    );
    res.status(500).json({ error: "Failed to generate summary." });
  }
});

module.exports = router;
