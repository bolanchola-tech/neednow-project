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

// This is where your "Needs" are stored temporarily
let needs = [];
// 1. GET ALL NEEDS (The "Viewer")
app.get('/api/needs', (req, res) => {
  res.json(needs);
});

// 2. POST A NEW NEED (The "Creator")
app.post('/api/needs', (req, res) => {
  const newNeed = { 
    id: Date.now(), 
    text: req.body.text, 
    date: new Date() 
  };
  needs.push(newNeed);
  console.log("New Signal Broadcast:", newNeed.text);
  res.status(201).json(newNeed);
});

// 3. DELETE A NEED (The "Cleaner")
app.delete('/api/needs/:id', (req, res) => {
  const { id } = req.params;
  needs = needs.filter(n => n.id !== parseInt(id));
  console.log(`Decommissioned Signal: ${id}`);
  res.status(204).send();
});

// 4. GET MATCHES (The "AI Engine")
app.get('/api/matches/:id', (req, res) => {
  const needId = req.params.id;
  const need = needs.find(n => n.id === parseInt(needId));
  
  if (!need) return res.json([]);

  // Mock AI matching logic for your Film/Media projects
  const allPossibleMatches = [
    { id: 101, text: "Grant: African AI Filmmaker Fund ($50k)", score: 95 },
    { id: 102, text: "Crew: Senior Camera Operator in Lusaka", score: 88 },
    { id: 103, text: "Space: Post-Production Suite available in Roma", score: 72 }
  ];
  
  res.json(allPossibleMatches);
});

// KEEP THIS AT THE VERY BOTTOM
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));