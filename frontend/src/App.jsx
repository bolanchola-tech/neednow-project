import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = "https://neednow-project.onrender.com/api";

function App() {
  const [input, setInput] = useState("");
  const [needs, setNeeds] = useState([]);
  const [selectedNeed, setSelectedNeed] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchNeeds = async () => {
      try {
        const response = await axios.get(`${API}/needs`);
        setNeeds(response.data);
      } catch (e) {
        console.error("Failed to fetch needs", e);
      }
    };
    fetchNeeds();
  }, []);

  const addNeed = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const response = await axios.post(`${API}/needs`, { text: input });
      setNeeds(response.data);
      setInput("");
    } catch (e) {
      console.error("Search failed:", e);
      setError("Could not connect. The server may be waking up — try again in 30 seconds.");
    } finally {
      setLoading(false);
    }
  };

  const deleteNeed = async (id, e) => {
    e.stopPropagation();
    try {
      await axios.delete(`${API}/needs/${id}`);
      setNeeds(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error("Delete failed");
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#0a0a0c] text-white pb-20 font-sans">
      <header className="pt-12 pb-8 flex flex-col items-center sticky top-0 z-10 bg-[#0a0a0c]/90 backdrop-blur-xl border-b border-white/5">
        <div className="relative">
          <div className="absolute inset-0 bg-orange-500/10 blur-2xl rounded-full"></div>
          <img src="/Logo2.jpg" className="relative w-32 h-32 object-contain rounded-2xl shadow-2xl"
               onError={(e) => e.target.src = "https://placehold.co/150x150/111/fff?text=NeedNow"} alt="Logo" />
        </div>
      </header>

      <main className="p-6">
        {!selectedNeed ? (
          <div className="animate-in fade-in duration-500">
            <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10 mb-8 backdrop-blur-md">
              {error && <p className="text-red-400 text-xs text-center mb-4">{error}</p>}
              <textarea
                className="w-full bg-transparent border-none focus:ring-0 text-lg placeholder:text-gray-600 text-gray-200"
                placeholder="What do you need?"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); addNeed(); }}}
              />
              <button onClick={addNeed} className="w-full mt-4 bg-orange-500 text-black py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all">
                {loading ? "Searching..." : "Start Looking"}
              </button>
            </div>

            <div className="space-y-4">
              <h2 className="text-[10px] font-black tracking-[0.2em] text-gray-500 uppercase mb-6 ml-1 text-center">Currently Finding</h2>
              {needs.length === 0 && (
                <p className="text-center text-gray-600 text-sm mt-12">No active signals. Type something above to start.</p>
              )}
              {needs.map((n) => (
                <div
                  key={n.id}
                  onClick={() => setSelectedNeed(n)}
                  className="bg-orange-500 p-6 rounded-3xl text-black mb-4 shadow-xl cursor-pointer active:scale-95 transition-all"
                >
                  <h3 className="font-black text-xl uppercase leading-tight mb-2 tracking-tighter">
                    {n.title || n.text || "Signal Found"}
                  </h3>
                  <p className="text-[11px] font-bold uppercase mb-4 opacity-80 leading-snug line-clamp-3 italic">
                    {n.description || "Tap to view search details..."}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); if (n.link) window.open(n.link, '_blank'); }}
                      className="flex-1 bg-black/10 hover:bg-black/20 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
                    >
                      View Full Source
                    </button>
                    <button
                      onClick={(e) => deleteNeed(n.id, e)}
                      className="px-5 bg-black/5 hover:bg-black/10 rounded-xl font-black text-[10px]"
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
            <button onClick={() => setSelectedNeed(null)} className="mb-8 text-orange-500 font-bold text-[10px] tracking-widest uppercase flex items-center gap-2">
              <span>←</span> Back to Hub
            </button>
            <div className="bg-orange-500 p-8 rounded-[40px] text-black shadow-2xl">
              <h2 className="font-black text-2xl uppercase leading-tight mb-4">{selectedNeed.title || selectedNeed.text}</h2>
              <p className="text-sm font-bold opacity-90 leading-relaxed mb-6">
                {selectedNeed.description || "Real-time match found via Tavily Search."}
              </p>
              <button
                onClick={() => {
                  const shareText = `NeedNow Found: ${selectedNeed.title || selectedNeed.text} - ${selectedNeed.link || ''}`;
                  window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
                }}
                className="w-full bg-black text-orange-500 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:scale-[1.02] transition-all"
              >
                Share to WhatsApp
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;