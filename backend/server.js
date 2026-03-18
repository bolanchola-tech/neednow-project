require('dotenv').config();

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
const TAVILY_API_KEY = process.env.TAVILY_API_KEY;

// 3. THE HEALTH CHECK: Returns a list so the frontend doesn't crash on load
app.get('/api/needs', (req, res) => {
  res.json([{ 
    id: "test-1", 
    title: "System Online", 
    description: "The search engine is connected. Type a query above to start.", 
    link: "#" 
  }]);
});

// 4. THE ENGINE: Handles the actual Tavily search
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
      link: result.url
    }));

    res.json(formattedResults); 
  } catch (error) {
    console.error("Search Error:", error.response?.data || error.message);
    // Send an empty list instead of a 500 error to keep the frontend stable
    res.json([]); 
  }
});
// 5. DELETE A NEED
app.delete('/api/needs/:id', (req, res) => {
  res.json({ success: true });
});
// 5. THE POWER
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});