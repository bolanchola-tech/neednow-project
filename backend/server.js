const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

// 1. THE BRIDGE: Updated with more "permissions" to stop the CORS error
app.use(cors({
  origin: "*", 
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));
app.use(express.json());

// 2. THE KEY: (Keep your actual key here)
const TAVILY_API_KEY = "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";

// 3. THE ENGINE: Explicitly handles the POST search
app.post('/api/needs', async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "No text provided" });

  try {
    const response = await axios.post('https://api.tavily.com/search', {
      api_key: TAVILY_API_KEY,
      query: text,
      search_depth: "basic",
      max_results: 5
    });

    const formattedResults = response.data.results.map(result => ({
      id: Math.random().toString(36).substr(2, 9),
      title: result.title,
      description: result.content,
      link: result.url,
      text: text
    }));

    res.json(formattedResults);
  } catch (error) {
    console.error("Search Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Search failed" });
  }
});

// 4. THE 404 KILLER: Add this so we can test the link in a browser tab!
app.get('/api/needs', (req, res) => {
  res.json({ message: "API is alive and waiting for a POST request!" });
});

// 5. THE POWER
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});