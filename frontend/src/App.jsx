import React, { useState, useEffect } from 'react';
import axios from 'axios';

// ⚠️ UPDATE THIS to your Computer's Network IP
const API = "https://neednow-project.onrender.com/api";

export default function App() {
  const [needs, setNeeds] = useState([]);
  const [input, setInput] = useState("");
  const [selectedNeed, setSelectedNeed] = useState(null);
  const [matches, setMatches] = useState([]);
  const [seenMatchIds, setSeenMatchIds] = useState(new Set());

  const getSignalColor = (text) => {
    const t = text.toLowerCase();
    if (t.includes('film') || t.includes('video')) return 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]';
    if (t.includes('fund') || t.includes('money') || t.includes('grant')) return 'border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.2)]';
    if (t.includes('ai') || t.includes('tech')) return 'border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.2)]';
    return 'border-white/5';
  };

  const playPing = () => {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audio.volume = 0.4;
    audio.play().catch(() => console.log("Waiting for user tap for sound"));
  };

  useEffect(() => {
    const syncData = async () => {
      try {
        const res = await axios.get(`${API}/needs`);
        const currentNeeds = res.data || [];
        setNeeds(currentNeeds);

        let foundNew = false;
        const updatedSeenIds = new Set(seenMatchIds);

        for (const need of currentNeeds) {
          const mRes = await axios.get(`${API}/matches/${need.id}`);
          mRes.data.forEach(match => {
            if (!updatedSeenIds.has(match.id)) {
              updatedSeenIds.add(match.id);
              foundNew = true;
            }
          });
        }

        if (foundNew) {
          setSeenMatchIds(updatedSeenIds);
          if (seenMatchIds.size > 0) playPing();
        }
      } catch (e) { console.log("Signal lost..."); }
    };

    syncData();
    const interval = setInterval(syncData, 5000);
    return () => clearInterval(interval);
  }, [seenMatchIds]);

  const addNeed = async () => {
    if (!input) return;
    try {
      // 1. Send the search term to your Render backend
      const response = await axios.post(`${API}/needs`, { text: input });
      
      // 2. Take the real results from the internet and put them in your cards
      setNeeds(response.data); 
      
      // 3. Clear the search box so you can type something else
      setInput("");
    } catch (e) { 
      console.error("Search failed:", e); 
    }
  };

  const deleteNeed = async (id, e) => {
    e.stopPropagation();
    try {
      await axios.delete(`${API}/needs/${id}`);
      setNeeds(prev => prev.filter(n => n.id !== id));
    } catch (err) { console.error("Delete failed"); }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#0a0a0c] text-white pb-20 font-sans">
      <header className="pt-12 pb-8 flex flex-col items-center sticky top-0 z-10 bg-[#0a0a0c]/90 backdrop-blur-xl border-b border-white/5">
        <div className="relative">
          <div className="absolute inset-0 bg-orange-500/10 blur-2xl rounded-full"></div>
          <img src="/Logo2.jpg" className="relative w-32 h-32 object-contain rounded-2xl shadow-2xl" 
               onError={(e) => e.target.src = "https://placehold.co/150x150/111/fff?text=NeedNow"} />
        </div>
      </header>

      <main className="p-6">
        {!selectedNeed ? (
          <div className="animate-in fade-in duration-500">
            <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10 mb-8 backdrop-blur-md">
              <textarea 
                className="w-full bg-transparent border-none focus:ring-0 text-lg placeholder:text-gray-800 text-gray-200"
                placeholder="Broadcast your intent..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button onClick={addNeed} className="w-full mt-4 bg-orange-500 text-black py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all">
                Initialize Tracker
              </button>
            </div>

            <div className="space-y-3">
              <h3 className="text-[10px] font-bold text-gray-600 uppercase tracking-widest ml-2">Active Signals</h3>
              {needs.map((n) => (
  <div key={n.id} className="bg-orange-500 p-6 rounded-3xl text-black mb-4 shadow-xl border-none">
    {/* The Headline from the Website */}
    <h3 className="font-black text-xl uppercase leading-tight mb-2 tracking-tighter">
      {n.title}
    </h3>
    
    {/* The Summary of the result */}
    <p className="text-[10px] font-bold uppercase mb-4 opacity-80 leading-relaxed italic line-clamp-3">
      {n.description}
    </p>

    <div className="flex gap-2">
      {/* Button to Visit the Website */}
      <button 
        onClick={() => window.open(n.link, '_blank')}
        className="flex-1 bg-black/20 hover:bg-black/30 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
      >
        View Full Source
      </button>

      {/* Delete button to remove this specific search result */}
      <button 
        onClick={(e) => { e.stopPropagation(); deleteNeed(n.id, e); }}
        className="px-5 bg-black/10 hover:bg-red-500/20 rounded-xl font-black text-[10px] transition-all"
      >
        ✕
      </button>
    </div>
  </div>
))}
            </div>
          </div>
        ) : (
          <div className="animate-in slide-in-from-right duration-300">
            <button onClick={() => setSelectedNeed(null)} className="mb-8 text-orange-500 font-bold text-[10px] tracking-widest uppercase">← Back to Hub</button>
            <div className="space-y-4">
              {matches.map((m) => (
                <div key={m.id} className="bg-gradient-to-br from-orange-600 to-orange-400 text-black p-6 rounded-3xl shadow-lg">
                  <p className="font-black text-xl leading-tight mb-2">{m.text}</p>
                  <p className="text-[10px] font-bold uppercase opacity-80 italic">Verified Match Found</p>
                  <button 
                    onClick={() => {
                      const text = `NeedNow Found a Match: ${m.text}`;
                      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                    }}
                    className="mt-4 w-full bg-black/20 text-black py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-black/40 transition-all border border-black/10"
                  >
                    Share to WhatsApp
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}