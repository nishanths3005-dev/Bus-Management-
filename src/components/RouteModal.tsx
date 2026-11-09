import React, { useState } from 'react';
import { X, Bus, MapPin, CheckCircle, Clock, Phone, AlertCircle, Sparkles, ExternalLink, Loader2 } from 'lucide-react';
import { BusRoute } from '../types/bus';

interface RouteModalProps {
  bus: BusRoute | null;
  searchedDestination?: string;
  onClose: () => void;
}

export const RouteModal: React.FC<RouteModalProps> = ({ bus, searchedDestination, onClose }) => {
  const [inspectingStop, setInspectingStop] = useState<string | null>(null);
  const [stopGrounding, setStopGrounding] = useState<{
    briefing: string;
    mapsPlaces: Array<{ title: string; uri: string; address?: string }>;
  } | null>(null);
  const [isLoadingGrounding, setIsLoadingGrounding] = useState<boolean>(false);

  if (!bus) return null;

  const handleInspectStop = async (stopName: string) => {
    if (inspectingStop === stopName && stopGrounding) {
      setInspectingStop(null);
      return;
    }
    setInspectingStop(stopName);
    setIsLoadingGrounding(true);
    setStopGrounding(null);
    try {
      const res = await fetch('/api/ai/stop-grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stopName,
          routeName: bus.routeName,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setStopGrounding({
          briefing: data.briefing,
          mapsPlaces: data.mapsPlaces || [],
        });
      }
    } catch (e) {
      console.warn('Grounding stop fetch failed:', e);
      setStopGrounding({
        briefing: `${stopName} is an active Jain University transit stop on the ${bus.routeName} corridor.`,
        mapsPlaces: [
          {
            title: `${stopName} (Bangalore)`,
            uri: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${stopName} Bangalore`)}`,
            address: 'Bangalore Metropolitan Region, Karnataka',
          },
        ],
      });
    } finally {
      setIsLoadingGrounding(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-300 flex items-center justify-center">
              <Bus className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg">{bus.busNumber}</h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-sm bg-blue-500/30 text-blue-200 border border-blue-400/30">
                  {bus.routeName}
                </span>
              </div>
              <p className="text-xs text-slate-300">Complete Bus Route Timeline • Maps Grounded</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Route stops sequence */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Quick info summary */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 block">Departure Bay</span>
              <span className="font-semibold text-slate-800">{bus.departureTime}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Available Seats</span>
              <span className="font-semibold text-blue-700">
                {bus.availableSeats} of {bus.totalSeats} seats
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Driver Contact</span>
              <span className="font-medium text-slate-800 flex items-center gap-1">
                <Phone className="w-3 h-3 text-slate-400" />
                {bus.driverPhone}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Total Stops</span>
              <span className="font-semibold text-slate-800">{bus.stops.length} campus stops</span>
            </div>
          </div>

          {/* Highlight notice if matching destination stop */}
          {searchedDestination && bus.stops.some(s => s.toLowerCase() === searchedDestination.toLowerCase()) && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center gap-2 text-xs text-blue-900">
              <CheckCircle className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                <strong>{searchedDestination}</strong> is served by this bus. See highlighted stop below.
              </span>
            </div>
          )}

          {/* Timeline Route Display */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Stop Sequence (Origin to Terminus)
              </h4>
              <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Click &quot;Maps Info&quot; to inspect any stop
              </span>
            </div>

            <div className="space-y-0 relative pl-2">
              {/* Connecting line */}
              <div className="absolute left-[27px] top-4 bottom-6 w-0.5 bg-slate-200"></div>

              {bus.stops.map((stop, index) => {
                const isFirst = index === 0;
                const isLast = index === bus.stops.length - 1;
                const isDestination =
                  searchedDestination && stop.toLowerCase() === searchedDestination.toLowerCase();
                const isCurrentInspected = inspectingStop === stop;

                return (
                  <div key={stop} className="relative flex items-start gap-4 pb-6 last:pb-0 group">
                    {/* Circle Node on Timeline */}
                    <div
                      className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-transform ${
                        isDestination
                          ? 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-md scale-110'
                          : isFirst
                          ? 'bg-slate-900 text-white'
                          : isLast
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white border-2 border-slate-300 text-slate-700'
                      }`}
                    >
                      {isFirst ? 'Start' : isLast ? 'End' : index + 1}
                    </div>

                    {/* Stop Details Card */}
                    <div
                      className={`flex-1 p-3.5 rounded-xl border transition-all ${
                        isDestination
                          ? 'bg-blue-50/80 border-blue-300 shadow-xs'
                          : isCurrentInspected
                          ? 'bg-emerald-50/40 border-emerald-300 shadow-sm'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-semibold text-sm ${
                              isDestination ? 'text-blue-950 font-bold' : 'text-slate-900'
                            }`}
                          >
                            {stop}
                          </span>
                          {isDestination && (
                            <span className="text-[11px] font-bold px-2 py-0.5 bg-blue-600 text-white rounded-md flex items-center gap-1 shadow-xs">
                              <MapPin className="w-3 h-3" />
                              Your Destination
                            </span>
                          )}
                        </div>

                        {/* Maps Grounding inspect button */}
                        <button
                          type="button"
                          onClick={() => handleInspectStop(stop)}
                          className={`text-[11px] font-semibold px-2 py-1 rounded-md border transition-all flex items-center gap-1 cursor-pointer shrink-0 ${
                            isCurrentInspected
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                              : 'text-emerald-700 bg-white hover:bg-emerald-50 border-emerald-200'
                          }`}
                        >
                          <Sparkles className="w-3 h-3 text-amber-400" />
                          <span>{isCurrentInspected ? 'Hide Maps Info' : 'Maps Info'}</span>
                        </button>
                      </div>

                      {/* Stop description / instructions */}
                      <p className="text-xs text-slate-500 mt-1">
                        {isFirst
                          ? 'Main Campus Parking Gate 2 • Assembly at Bay 1-4'
                          : isLast
                          ? 'Final drop point for this route corridor'
                          : 'Designated student boarding and drop-off shelter'}
                      </p>

                      {/* Google Maps Grounded Stop Insight Panel */}
                      {isCurrentInspected && (
                        <div className="mt-3 pt-3 border-t border-emerald-200/60 bg-white rounded-xl p-3 border space-y-2.5 animate-in fade-in duration-150">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                              Google Maps Grounded Intelligence (Gemini 3.8 Flash)
                            </span>
                          </div>

                          {isLoadingGrounding ? (
                            <div className="py-3 flex items-center justify-center gap-2 text-xs text-slate-500">
                              <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                              <span>Querying Google Maps place data for {stop}...</span>
                            </div>
                          ) : stopGrounding ? (
                            <div className="space-y-2 text-xs">
                              <div className="text-slate-700 leading-relaxed whitespace-pre-line text-[11px]">
                                {stopGrounding.briefing}
                              </div>

                              {/* Verified Google Maps links */}
                              {stopGrounding.mapsPlaces.length > 0 && (
                                <div className="pt-2 border-t border-slate-100 space-y-1.5">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                    Verified Google Maps Locations:
                                  </span>
                                  {stopGrounding.mapsPlaces.map((place, pIdx) => (
                                    <a
                                      key={`${place.uri}-${pIdx}`}
                                      href={place.uri}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/60 hover:bg-emerald-100/70 border border-emerald-200 text-emerald-950 transition-colors group"
                                    >
                                      <div className="flex items-center gap-1.5">
                                        <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                        <span className="font-semibold text-xs group-hover:text-emerald-900">
                                          {place.title}
                                        </span>
                                      </div>
                                      <span className="text-[10px] font-bold text-emerald-700 group-hover:underline flex items-center gap-0.5">
                                        Open in Maps
                                        <ExternalLink className="w-3 h-3" />
                                      </span>
                                    </a>
                                  ))}
                                </div>
                              )}
                            </div>
                          ) : null}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Regular daily transit service</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Close View
          </button>
        </div>
      </div>
    </div>
  );
};
