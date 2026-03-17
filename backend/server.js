const TAVILY_API_KEY = "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"
const express = require('express');
const cors = require('cors');
const axios = require('axios'); // We use axios because it's more stable on Render

const app = express();

// 1. THE BRIDGE: Allows your Vercel app to talk to this server
app.use(cors());
app.use(express.json());

// 2. THE KEY: Put your real Tavily API Key between the quotes below


// 3. THE ENGINE: This handles the search
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

    // This turns internet results into the Orange Cards for your app
    const formattedResults = response.data.results.map(result => ({
      id: Math.random().toString(36).substr(2, 9),
      title: result.title,
      description: result.content,
      link: result.url,
      text: text
    }));

    res.json(formattedResults);
  } catch (error) {
    console.error("Search Error:", error);
    res.status(500).json({ error: "Search failed" });
  }
});

// 4. THE POWER: Tells Render which port to use
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});