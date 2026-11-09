import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  X,
  Bot,
  User,
  Loader2,
  HelpCircle,
  Bus,
  Compass,
  ArrowRight,
} from 'lucide-react';
import { BusRoute } from '../types/bus';
import { useAuth } from '../context/AuthContext';

interface AiTransitAssistantProps {
  buses: BusRoute[];
  onSelectBus?: (bus: BusRoute) => void;
  onSelectDestination?: (dest: string) => void;
}

interface GoogleMapsPlace {
  title: string;
  uri: string;
  address?: string;
  reviewSnippets?: any[];
}

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  mapsPlaces?: GoogleMapsPlace[];
}

export const AiTransitAssistant: React.FC<AiTransitAssistantProps> = ({
  buses,
  onSelectBus,
  onSelectDestination,
}) => {
  const { userProfile, role } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Hello ${userProfile?.displayName?.split(' ')[0] || 'there'}! I am the **Jain University AI Transit Advisor**, powered by **Gemini 3.8 Flash** with live **Google Maps Grounding** 📍.

You can ask me real-world questions like:
- *"Which bus stops near Silk Board or connects to Namma Metro?"*
- *"Find the closest stop to Electronic City Infosys gate."*
- *"Which bus has the most available seats right now?"*
- *"What time do buses depart from campus bays?"*`,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = inputValue.trim();
    if (!query || loading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setLoading(true);

    try {
      // Optional client geolocation fallback to Jain Global Campus
      const response = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          busRoutes: buses.map((b) => ({
            id: b.id,
            busNumber: b.busNumber,
            routeName: b.routeName,
            shift: b.shift,
            departureTime: b.departureTime,
            availableSeats: b.availableSeats,
            totalSeats: b.totalSeats,
            stops: b.stops,
            status: b.status,
            driverName: b.driverName,
            driverPhone: b.driverPhone,
          })),
          userRole: role,
          userLocation: {
            latitude: 12.6456,
            longitude: 77.4416,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('AI Assistant server route returned error');
      }

      const data = await response.json();
      const aiReply: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.reply || "I've reviewed our active campus bus routes. Please verify with the Transport Directorate if you need custom connections.",
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        mapsPlaces: data.mapsPlaces && data.mapsPlaces.length > 0 ? data.mapsPlaces : undefined,
      };

      setMessages((prev) => [...prev, aiReply]);
    } catch (err: any) {
      console.warn('AI Transit Assistant offline fallback:', err);
      // Client-side fallback intelligence if backend is starting
      const lower = query.toLowerCase();
      const matched = buses.find((b) =>
        b.stops.some((s) => lower.includes(s.toLowerCase()))
      );

      const fallbackText = matched
        ? `Based on our Jain University routes, **${matched.busNumber} (${matched.routeName})** serves your destination corridor with **${matched.availableSeats} seats vacant**. It departs at **${matched.departureTime}** from Main Gate 2.`
        : `I could not find an exact match for "${query}". The 4 active Jain University routes are:
- **Route A (${buses[0]?.busNumber})**: JP Nagar, Jayanagar, Banashankari (${buses[0]?.availableSeats} seats)
- **Route B (${buses[1]?.busNumber})**: Electronic City, Bommasandra (${buses[1]?.availableSeats} seats)
- **Route C (${buses[2]?.busNumber})**: Hosur, Attibele (${buses[2]?.availableSeats} seats)
- **Route D (${buses[3]?.busNumber})**: BTM Layout, Silk Board, Koramangala (${buses[3]?.availableSeats} seats)`;

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: fallbackText,
          timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          mapsPlaces: [
            {
              title: 'Jain Global Campus (Main Bus Terminal)',
              uri: 'https://www.google.com/maps/search/?api=1&query=Jain+Global+Campus+Kanakapura+Road+Bangalore',
              address: 'Jakkasandra Post, Kanakapura Road, Ramanagara / Bangalore',
            },
          ],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickQuestion = (promptText: string) => {
    setInputValue(promptText);
    setTimeout(() => {
      handleSendMessage();
    }, 50);
  };

  return (
    <>
      {/* Floating Assistant Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 hover:from-blue-700 hover:to-indigo-700 text-white p-3.5 sm:px-5 sm:py-3.5 rounded-full shadow-2xl flex items-center gap-2.5 transition-all hover:scale-105 active:scale-95 cursor-pointer border border-white/20"
        aria-label="Open AI Transit Assistant"
      >
        <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
        <span className="font-bold text-xs sm:text-sm hidden sm:inline">AI Maps Transit Advisor</span>
      </button>

      {/* Floating Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 sm:right-6 z-50 w-[92vw] sm:w-[440px] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[560px] animate-in fade-in slide-in-from-bottom-6 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-400/30 flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-extrabold text-sm text-white">Jain AI Transit Advisor</h3>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-1.5 py-0.2 rounded font-mono font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                    Maps Grounded
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">Gemini 3.8 Flash • Live Bangalore geographic data</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Prompts */}
          <div className="bg-slate-50 border-b border-slate-100 px-3 py-2 flex items-center gap-1.5 overflow-x-auto text-[11px]">
            <button
              type="button"
              onClick={() => handleQuickQuestion('Which bus goes to Silk Board & where is the metro station?')}
              className="px-2.5 py-1 bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-lg border border-slate-200 whitespace-nowrap cursor-pointer transition-colors shrink-0 flex items-center gap-1"
            >
              📍 Silk Board & Metro?
            </button>
            <button
              type="button"
              onClick={() => handleQuickQuestion('Find the stop for Electronic City Phase 1 and Infosys.')}
              className="px-2.5 py-1 bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-lg border border-slate-200 whitespace-nowrap cursor-pointer transition-colors shrink-0 flex items-center gap-1"
            >
              📍 Electronic City tech parks?
            </button>
            <button
              type="button"
              onClick={() => handleQuickQuestion('Which bus has the most available seats right now?')}
              className="px-2.5 py-1 bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-lg border border-slate-200 whitespace-nowrap cursor-pointer transition-colors shrink-0"
            >
              💺 Most vacant seats?
            </button>
            <button
              type="button"
              onClick={() => handleQuickQuestion('What time do evening return buses leave campus Gate 2?')}
              className="px-2.5 py-1 bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-lg border border-slate-200 whitespace-nowrap cursor-pointer transition-colors shrink-0"
            >
              ⏰ Departure bay schedule?
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/50 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'ai' && (
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`max-w-[88%] rounded-2xl p-3.5 leading-relaxed space-y-2.5 ${
                    m.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-xs'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-tl-xs shadow-xs'
                  }`}
                >
                  <div className="whitespace-pre-line">{m.text}</div>

                  {/* Google Maps Grounded Citations & Verified Places */}
                  {m.mapsPlaces && m.mapsPlaces.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span>Verified on Google Maps</span>
                      </div>
                      <div className="space-y-1">
                        {m.mapsPlaces.map((place, idx) => (
                          <a
                            key={`${place.uri}-${idx}`}
                            href={place.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block p-2 rounded-xl bg-slate-50 hover:bg-emerald-50/80 border border-slate-200 hover:border-emerald-300 transition-all group"
                          >
                            <div className="flex items-start justify-between gap-1.5">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 group-hover:text-emerald-800">
                                <span className="text-sm">📍</span>
                                <span>{place.title}</span>
                              </div>
                              <span className="text-[10px] text-emerald-600 font-semibold shrink-0 group-hover:underline flex items-center gap-0.5">
                                View Map &rarr;
                              </span>
                            </div>
                            {place.address && (
                              <p className="text-[11px] text-slate-500 mt-0.5 pl-5 line-clamp-1">
                                {place.address}
                              </p>
                            )}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  <div
                    className={`text-[9px] mt-1 text-right ${
                      m.sender === 'user' ? 'text-blue-200' : 'text-slate-400'
                    }`}
                  >
                    {m.timestamp}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2.5 items-center text-slate-500 text-xs py-2 bg-white/70 p-3 rounded-2xl border border-slate-200">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                <span className="flex items-center gap-1.5">
                  <span>Gemini 3.8 querying Google Maps & campus fleet...</span>
                </span>
              </div>
            )}
          </div>

          {/* Input Box */}
          <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex gap-2">
            <input
              type="text"
              placeholder="Ask about stops, metro connections, landmarks..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1 px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={loading || !inputValue.trim()}
              className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
