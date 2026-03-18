require('dotenv').config();

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
let storedNeeds = [];

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));
app.use(express.json());

const TAVILY_API_KEY = process.env.TAVILY_API_KEY;
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
async function scoreResult(searchText, result) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Score how relevant this search result is to the search query.
Search query: "${searchText}"
Result title: "${result.title}"
Result description: "${result.description}"

Reply with ONLY a number between 0 and 100. No explanation. Just the number.`;
    const response = await model.generateContent(prompt);
    const score = parseInt(response.response.text().trim());
    return isNaN(score) ? 50 : Math.min(100, Math.max(0, score));
  } catch (e) {
    return 50;
  }
}

app.get('/api/needs', (req, res) => {
  res.json(storedNeeds);
});

app.post('/api/needs', async (req, res) => {
  const { text } = req.body;
  if (!text?.trim()) return res.status(400).json({ error: "No text provided" });

  try {
    const response = await axios.post('https://api.tavily.com/search', {
      api_key: TAVILY_API_KEY,
      query: text,
      search_depth: "basic",
      max_results: 5
    });

    const scoredResults = await Promise.all(
      response.data.results.map(async (result) => {
        const relevance = await scoreResult(text, result);
        return {
          id: Math.random().toString(36).substr(2, 9),
          title: result.title,
          description: result.content,
          link: result.url,
          relevance
        };
      })
    );

    const formattedResults = scoredResults.sort((a, b) => b.relevance - a.relevance);

    const need = {
      id: Math.random().toString(36).substr(2, 9),
      searchText: text,
      results: formattedResults
    };

    storedNeeds = [need, ...storedNeeds];
    res.json(need);

  } catch (error) {
    console.error("Search Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Search failed. Try again." });
  }
});

app.delete('/api/needs/:id', (req, res) => {
  storedNeeds = storedNeeds.filter(n => n.id !== req.params.id);
  res.json({ success: true });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));