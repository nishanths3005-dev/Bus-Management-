import React, { useState } from 'react';
import { Bus, MapPin, Search, Route as RouteIcon, Users, CheckCircle2 } from 'lucide-react';
import { BusRoute } from '../types/bus';
import { BusCard } from '../components/BusCard';

interface RoutesPageProps {
  buses: BusRoute[];
  onViewRoute: (bus: BusRoute) => void;
  onViewSeatMap: (bus: BusRoute) => void;
  bookedBuses: string[];
  onToggleBookSeat: (busId: string) => void;
  onViewBoardingPass?: (busId: string) => void;
}

export const RoutesPage: React.FC<RoutesPageProps> = ({
  buses,
  onViewRoute,
  onViewSeatMap,
  bookedBuses,
  onToggleBookSeat,
  onViewBoardingPass,
}) => {
  const [filterRoute, setFilterRoute] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState<string>('');

  const filteredBuses = buses.filter((bus) => {
    const matchesRoute =
      filterRoute === 'all' || bus.routeName.toLowerCase() === filterRoute.toLowerCase();
    const matchesText =
      !searchFilter.trim() ||
      bus.busNumber.toLowerCase().includes(searchFilter.toLowerCase()) ||
      bus.routeName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      bus.stops.some((s) => s.toLowerCase().includes(searchFilter.toLowerCase()));

    return matchesRoute && matchesText;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-6">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
          <RouteIcon className="w-4 h-4" />
          <span>Campus Transport Network</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          College Bus Routes Directory
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          View all 4 operational routes, complete stop chains, and real-time available seat counts.
        </p>
      </div>

      {/* Filter and search controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
        {/* Route Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setFilterRoute('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              filterRoute === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            All Routes ({buses.length})
          </button>
          {['Route A', 'Route B', 'Route C', 'Route D'].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setFilterRoute(r)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                filterRoute === r
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Search input inside routes */}
        <div className="relative sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Filter by stop or bus no..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-blue-500"
          />
        </div>
      </div>

      {/* Bus Cards Grid */}
      {filteredBuses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredBuses.map((bus) => (
            <BusCard
              key={bus.id}
              bus={bus}
              searchedDestination={searchFilter}
              onViewRoute={onViewRoute}
              onViewSeatMap={onViewSeatMap}
              onBookSeat={onToggleBookSeat}
              onViewBoardingPass={onViewBoardingPass}
              isBookedByStudent={bookedBuses.includes(bus.id)}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
          <p className="text-slate-500 text-sm">No bus routes match your current filter.</p>
          <button
            type="button"
            onClick={() => {
              setFilterRoute('all');
              setSearchFilter('');
            }}
            className="mt-3 text-xs text-blue-600 font-semibold hover:underline"
          >
            Reset filters
          </button>
        </div>
      )}
    </div>
  );
};
