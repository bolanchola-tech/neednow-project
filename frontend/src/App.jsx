import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = "https://neednow-project.onrender.com/api";

function App() {
  const [input, setInput] = useState("");
  const [needs, setNeeds] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const pingSound = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");

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
    setError("");
    try {
      const response = await axios.post(`${API}/needs`, { text: input });
      setNeeds(prev => [response.data, ...prev]);
      if (response.data.results.some(r => r.relevance >= 80)) {
  pingSound.play().catch(() => {});
}
      setExpandedId(response.data.id);
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
      if (expandedId === id) setExpandedId(null);
    } catch (err) {
      console.error("Delete failed");
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#0a0a0c] text-white pb-20 font-sans">
      <header className="pt-12 pb-8 flex flex-col items-center sticky top-0 z-10 bg-[#0a0a0c]/90 backdrop-blur-xl border-b border-white/5">
        <div className="relative">
          <div className="absolute inset-0 bg-cyan-500/10 blur-2xl rounded-full"></div>
          <img src="/Logo2.jpg" className="relative w-32 h-32 object-contain rounded-2xl shadow-2xl"
               onError={(e) => e.target.src = "https://placehold.co/150x150/111/fff?text=NeedNow"} alt="Logo" />
        </div>
      </header>

      <main className="p-6">
        <div className="animate-in fade-in duration-500">

          {/* Input card */}
          <div className="relative mb-8 rounded-[2rem] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-purple-500/10 to-pink-500/20 rounded-[2rem]"></div>
            <div className="absolute inset-[1px] bg-[#0d0d14] rounded-[2rem]"></div>
            <div className="relative p-6">
              {error && <p className="text-red-400 text-xs text-center mb-4">{error}</p>}
              <textarea
                className="w-full bg-[#13131f] border border-cyan-500/20 focus:border-cyan-400/60 focus:ring-0 text-lg placeholder:text-gray-600 text-gray-100 rounded-xl p-4 resize-none transition-all"
                placeholder="What do you need?"
                rows={3}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); addNeed(); }}}
              />
              <button
                onClick={addNeed}
                className="w-full mt-4 py-4 rounded-2xl font-black uppercase text-[11px] tracking-widest active:scale-95 transition-all relative overflow-hidden"
                style={{background: 'linear-gradient(135deg, #06b6d4, #8b5cf6, #ec4899)'}}
              >
                <span className="relative z-10">{loading ? "Scanning..." : "Start Looking"}</span>
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-3">
            <h2 className="text-[10px] font-black tracking-[0.2em] text-gray-500 uppercase mb-6 ml-1 text-center flex items-center justify-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Currently Finding
            </h2>

            {needs.length === 0 && (
              <p className="text-center text-gray-700 text-sm mt-12">No active signals. Type something above to start.</p>
            )}

            {needs.map((n, index) => {
              const colors = [
                { border: 'from-cyan-500 via-blue-500 to-purple-500', glow: 'cyan-500', tag: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
                { border: 'from-purple-500 via-pink-500 to-red-500', glow: 'purple-500', tag: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
                { border: 'from-green-400 via-teal-500 to-cyan-500', glow: 'green-400', tag: 'bg-green-500/10 text-green-400 border-green-500/20' },
                { border: 'from-orange-500 via-pink-500 to-purple-500', glow: 'orange-500', tag: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
              ];
              const color = colors[index % colors.length];

              return (
                <div key={n.id} className="relative rounded-2xl overflow-hidden mb-4">
                  <div className={`absolute inset-0 bg-gradient-to-br ${color.border} opacity-20 rounded-2xl`}></div>
                  <div className={`absolute inset-[1px] bg-[#0d0d14] rounded-2xl`}></div>
                  <div className="relative">

                    {/* Collapsed row */}
                    <div
                      onClick={() => toggleExpand(n.id)}
                      className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-all"
                    >
                      <p className="text-sm font-bold text-gray-200 truncate flex-1 mr-3">
                        {n.searchText}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 text-xs">{expandedId === n.id ? "▲" : "▼"}</span>
                        <button
                          onClick={(e) => deleteNeed(n.id, e)}
                          className="text-gray-600 hover:text-red-400 px-2 py-1 text-xs transition-all"
                        >
                          ✕
                        </button>
                      </div>
                    </div>

                    {/* Expanded results */}
                    {expandedId === n.id && (
                      <div className="border-t border-white/5 p-4 space-y-3">
                        {n.results && n.results.length > 0 ? (
                          n.results.map((result) => (
                            <div
                              key={result.id}
                              onClick={() => { if (result.link) window.open(result.link, '_blank'); }}
                              className="relative rounded-xl overflow-hidden cursor-pointer group"
                            >
                              <div className="absolute inset-0 bg-white/3 group-hover:bg-white/8 transition-all"></div>
                              <div className="relative p-4 border border-white/5 rounded-xl">
                                <div className="flex items-start justify-between mb-2 gap-2">
                                  <h3 className={`font-bold text-sm leading-tight flex-1 text-cyan-300`}>
                                    {result.title}
                                  </h3>
                                  <span className={`text-xs font-black px-2 py-1 rounded-full border shrink-0 ${
                                    result.relevance >= 80 ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                                    result.relevance >= 50 ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                                    'bg-gray-500/20 text-gray-400 border-gray-500/30'
                                  }`}>
                                    {result.relevance}%
                                  </span>
                                </div>
                                <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">
                                  {result.description}
                                </p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-600 text-xs text-center">No results found.</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
  }

export default App;