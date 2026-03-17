const TAVILY_API_KEY = "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"
const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "DELETE"],
  allowedHeaders: ["Content-Type"]
}));
app.use(express.json());
app.use(express.json());

app.post('/api/needs', async (req, res) => {
  const { text } = req.body;
  
  try {
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: TAVILY_API_KEY,
        query: text,
        search_depth: "basic",
        max_results: 5
      })
    });

    const data = await response.json();
    
    // This turns internet results into the Orange Cards for your app
    const formattedResults = data.results.map(result => ({
      id: Math.random(),
      title: result.title,
      description: result.content,
      link: result.url
    }));

    res.json(formattedResults);
  } catch (error) {
    console.error("Search Error:", error);
    res.status(500).json({ error: "Search failed" });
  }
});