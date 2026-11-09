import React, { useState } from 'react';
import { Bus, MapPin, AlertCircle, RefreshCw, CheckCircle2, ArrowRight, ShieldCheck, Clock, Users, Sparkles, ExternalLink, Loader2, Ticket, QrCode } from 'lucide-react';
import { BusRoute, SeatReservation } from '../types/bus';
import { PREDEFINED_BUS_ROUTES } from '../data/busRoutes';
import { SearchBox } from '../components/SearchBox';
import { BusCard } from '../components/BusCard';

interface HomeProps {
  onViewRoute: (bus: BusRoute, destination?: string) => void;
  onViewSeatMap: (bus: BusRoute) => void;
  onNavigateTab: (tab: 'home' | 'find' | 'routes' | 'dashboard' | 'about') => void;
  buses: BusRoute[];
  bookedBuses: string[];
  onToggleBookSeat: (busId: string) => void;
  initialQuery?: string;
  onUpdateSearchedTerm?: (term: string) => void;
  onOpenCheckIn?: () => void;
  userReservations?: SeatReservation[];
  onOpenBoardingPass?: (reservation: SeatReservation) => void;
  onViewBoardingPassForBus?: (busId: string) => void;
}

export const Home: React.FC<HomeProps> = ({
  onViewRoute,
  onViewSeatMap,
  onNavigateTab,
  buses,
  bookedBuses,
  onToggleBookSeat,
  initialQuery = '',
  onUpdateSearchedTerm,
  onOpenCheckIn,
  userReservations = [],
  onOpenBoardingPass,
  onViewBoardingPassForBus,
}) => {
  const [searchedTerm, setSearchedTerm] = useState<string>(initialQuery);
  const [matchingBuses, setMatchingBuses] = useState<BusRoute[]>(() => {
    if (!initialQuery) return [];
    return buses.filter((bus) =>
      bus.stops.some((stop) => stop.toLowerCase().includes(initialQuery.trim().toLowerCase()))
    );
  });
  const [hasSearched, setHasSearched] = useState<boolean>(Boolean(initialQuery));
  const [destGrounding, setDestGrounding] = useState<{
    briefing: string;
    mapsPlaces: Array<{ title: string; uri: string; address?: string }>;
  } | null>(null);
  const [isLoadingDestGrounding, setIsLoadingDestGrounding] = useState<boolean>(false);
  const [showDestGrounding, setShowDestGrounding] = useState<boolean>(false);

  const handleFetchDestGrounding = async (destination: string) => {
    setShowDestGrounding(true);
    setIsLoadingDestGrounding(true);
    setDestGrounding(null);
    try {
      const res = await fetch('/api/ai/stop-grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stopName: destination,
          routeName: 'Bangalore Transit Corridor',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setDestGrounding({
          briefing: data.briefing,
          mapsPlaces: data.mapsPlaces || [],
        });
      }
    } catch (e) {
      console.warn('Dest grounding failed:', e);
      setDestGrounding({
        briefing: `${destination} is connected to Jain University campus transit routes.`,
        mapsPlaces: [
          {
            title: `${destination} (Bangalore)`,
            uri: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${destination} Bangalore`)}`,
            address: 'Bangalore Metropolitan Region, Karnataka',
          },
        ],
      });
    } finally {
      setIsLoadingDestGrounding(false);
    }
  };

  const handleSearch = (destination: string) => {
    const trimmed = destination.trim();
    setSearchedTerm(trimmed);
    setHasSearched(true);
    setShowDestGrounding(false);
    setDestGrounding(null);
    if (onUpdateSearchedTerm) {
      onUpdateSearchedTerm(trimmed);
    }

    if (!trimmed) {
      setMatchingBuses([]);
      return;
    }

    // Check whether destination exists in stops of each bus (case-insensitive)
    const matches = buses.filter((bus) =>
      bus.stops.some((stop) => stop.toLowerCase() === trimmed.toLowerCase() ||
        stop.toLowerCase().includes(trimmed.toLowerCase())
      )
    );

    setMatchingBuses(matches);
  };

  const handleResetSearch = () => {
    setSearchedTerm('');
    setHasSearched(false);
    setMatchingBuses([]);
    setShowDestGrounding(false);
    setDestGrounding(null);
    if (onUpdateSearchedTerm) {
      onUpdateSearchedTerm('');
    }
  };

  return (
    <div className="space-y-12">
      {/* Hero Banner with Search Section */}
      <section className="relative bg-gradient-to-b from-blue-50/70 via-white to-white py-12 px-4 sm:px-6 lg:px-8 border-b border-slate-100">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/80 text-blue-800 text-xs font-semibold tracking-wide border border-blue-200">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
            Official Campus Transportation Portal
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            College Bus Route & Seat Management
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto font-normal">
            Find your bus, check your route, and view available seats.
          </p>

          {/* Search Box Component */}
          <div className="pt-6">
            <SearchBox onSearch={handleSearch} initialValue={searchedTerm} />
          </div>

          {/* Quick QR Check-in Banner for Boarding Students */}
          {onOpenCheckIn && (
            <div className="pt-3 flex justify-center">
              <button
                type="button"
                onClick={onOpenCheckIn}
                className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer group"
              >
                <div className="w-5 h-5 rounded-md bg-blue-500/30 text-blue-300 flex items-center justify-center">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <span>Boarding Coach Now? Scan Bus QR Code to Check In</span>
                <span className="text-[11px] text-amber-400 font-mono font-bold group-hover:translate-x-0.5 transition-transform">
                  Scan &rarr;
                </span>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Active Boarding Pass Quick Access Card */}
      {userReservations.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-blue-800/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 flex items-center justify-center shrink-0">
                <Ticket className="w-6 h-6 text-emerald-300" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                      userReservations[0].status === 'checked_in'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                        : 'bg-blue-500/20 text-blue-300 border-blue-400/30'
                    }`}
                  >
                    {userReservations[0].status === 'checked_in' ? '✓ Boarded & Verified' : 'Active Pass Ready'}
                  </span>
                  <span className="text-xs text-slate-400">
                    Pass #{userReservations[0].id.slice(-6)}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-extrabold text-white mt-1">
                  Seat #{userReservations[0].seatNumber} Reserved on {userReservations[0].busNumber}
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Route: <strong className="text-emerald-300">{userReservations[0].routeName}</strong> • Destination: <strong className="text-white">{userReservations[0].destinationStop}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-start md:self-auto">
              <button
                type="button"
                onClick={() => onOpenBoardingPass && onOpenBoardingPass(userReservations[0])}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer ring-2 ring-emerald-400/40"
              >
                <QrCode className="w-4 h-4 text-white" />
                <span>Show QR Pass to Driver</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Search Results Area */}
      {hasSearched && (
        <section id="search-results" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20">
          {matchingBuses.length > 0 ? (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <span className="text-2xl">🚌</span> Matching College Bus Found
                  </h2>
                  <p className="text-xs text-slate-500">
                    Showing buses serving destination:{' '}
                    <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-sm border border-blue-200">
                      {searchedTerm}
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (showDestGrounding) {
                        setShowDestGrounding(false);
                      } else {
                        handleFetchDestGrounding(searchedTerm);
                      }
                    }}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
                      showDestGrounding
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>{showDestGrounding ? 'Hide Maps Intel' : 'Google Maps Intel'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleResetSearch}
                    className="text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                </div>
              </div>

              {/* Google Maps Destination Grounding Card */}
              {showDestGrounding && (
                <div className="bg-gradient-to-r from-emerald-50/70 via-white to-emerald-50/40 rounded-2xl border border-emerald-200 p-5 shadow-xs space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                          <span>Google Maps Grounded Destination Intelligence:</span>
                          <span className="text-emerald-700">{searchedTerm}</span>
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Powered by Gemini 3.8 Flash • Real-world Bangalore geography & transit hubs
                        </p>
                      </div>
                    </div>
                  </div>

                  {isLoadingDestGrounding ? (
                    <div className="py-4 flex items-center justify-center gap-2 text-xs text-slate-500">
                      <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                      <span>Querying Google Maps place data for {searchedTerm}...</span>
                    </div>
                  ) : destGrounding ? (
                    <div className="space-y-3">
                      <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-white/80 p-3 rounded-xl border border-slate-100">
                        {destGrounding.briefing}
                      </p>

                      {/* Verified Google Maps Links */}
                      {destGrounding.mapsPlaces.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Verified Google Maps Locations & Links:
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {destGrounding.mapsPlaces.map((place, idx) => (
                              <a
                                key={`${place.uri}-${idx}`}
                                href={place.uri}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between p-2.5 rounded-xl bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 transition-colors group shadow-2xs"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="text-sm">📍</span>
                                  <div className="min-w-0">
                                    <span className="block text-xs font-bold text-slate-900 group-hover:text-emerald-800 truncate">
                                      {place.title}
                                    </span>
                                    {place.address && (
                                      <span className="block text-[10px] text-slate-400 truncate">
                                        {place.address}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <span className="text-[11px] font-bold text-emerald-600 group-hover:underline flex items-center gap-0.5 shrink-0 ml-2">
                                  Open
                                  <ExternalLink className="w-3 h-3" />
                                </span>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              )}

              {/* Exact Matching Bus Display Callout matching prompt sample */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {matchingBuses.map((bus) => (
                  <BusCard
                    key={bus.id}
                    bus={bus}
                    searchedDestination={searchedTerm}
                    onViewRoute={(b) => onViewRoute(b, searchedTerm)}
                    onViewSeatMap={onViewSeatMap}
                    onBookSeat={onToggleBookSeat}
                    onViewBoardingPass={onViewBoardingPassForBus}
                    isBookedByStudent={bookedBuses.includes(bus.id)}
                  />
                ))}
              </div>
            </div>
          ) : (
            /* No Bus Available - Exact Requirements Section */
            <div className="max-w-2xl mx-auto bg-white rounded-2xl border-2 border-dashed border-slate-200 p-8 sm:p-10 text-center space-y-4 shadow-xs">
              <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 mx-auto flex items-center justify-center">
                <AlertCircle className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h3 className="text-2xl font-bold text-slate-900">
                  Bus/Route Not Available
                </h3>
                <p className="text-sm text-slate-600 max-w-md mx-auto">
                  We couldn&apos;t find a college bus serving this destination. Please try another destination.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleResetSearch}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition-colors shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Search Again</span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigateTab('routes')}
                  className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-sm transition-colors cursor-pointer"
                >
                  <span>View All 4 College Routes</span>
                </button>
              </div>

              {/* Helpful suggestions */}
              <div className="pt-4 border-t border-slate-100 text-xs text-slate-500">
                <span className="font-semibold text-slate-700 block mb-2">Available College Stops:</span>
                <div className="flex flex-wrap justify-center gap-1.5">
                  {[
                    'JP Nagar',
                    'Jayanagar',
                    'Electronic City',
                    'Bommasandra',
                    'Hosur',
                    'Attibele',
                    'Banashankari',
                    'BTM Layout',
                    'Silk Board',
                    'Koramangala',
                  ].map((stop) => (
                    <button
                      key={stop}
                      type="button"
                      onClick={() => handleSearch(stop)}
                      className="px-2.5 py-1 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-md border border-slate-200 transition-colors cursor-pointer text-xs"
                    >
                      {stop}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* All Available College Routes Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-slate-200 gap-2">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Active College Bus Routes (Today&apos;s Schedule)
            </h2>
            <p className="text-xs text-slate-500">
              Departure time: 04:45 PM from Main Campus Gate 2 Bay 1–4
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('routes')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer self-start sm:self-auto"
          >
            <span>Explore all route stops</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {buses.map((bus) => (
            <BusCard
              key={bus.id}
              bus={bus}
              searchedDestination={searchedTerm}
              onViewRoute={onViewRoute}
              onViewSeatMap={onViewSeatMap}
              onBookSeat={onToggleBookSeat}
              onViewBoardingPass={onViewBoardingPassForBus}
              isBookedByStudent={bookedBuses.includes(bus.id)}
            />
          ))}
        </div>
      </section>

      {/* College Project Notice & Quick Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-slate-900">Fixed Shift Departures</h4>
                <p className="text-xs text-slate-600 mt-1">
                  All buses depart from campus bays promptly at 04:45 PM. Students are advised to be seated 10 minutes prior.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-slate-900">Guaranteed Seat Capacity</h4>
                <p className="text-xs text-slate-600 mt-1">
                  Each college coach has 40 seats. Real-time availability indicator prevents overcrowding and safety hazards.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-slate-900">Identity & Safety First</h4>
                <p className="text-xs text-slate-600 mt-1">
                  Keep your digital or physical college bus pass ready for verification by the driver during boarding.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
