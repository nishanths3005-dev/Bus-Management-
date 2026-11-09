import React from 'react';
import { Bus, Route, Users, CheckCircle2, TrendingUp, AlertTriangle } from 'lucide-react';
import { BusRoute, getAvailabilityStatus } from '../types/bus';

interface DashboardStatsProps {
  buses: BusRoute[];
  onSelectBus?: (bus: BusRoute) => void;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ buses, onSelectBus }) => {
  const totalBuses = buses.length;
  const totalRoutes = new Set(buses.map((b) => b.routeName)).size;
  const totalSeats = buses.reduce((acc, b) => acc + b.totalSeats, 0);
  const availableSeats = buses.reduce((acc, b) => acc + b.availableSeats, 0);
  const occupiedSeats = totalSeats - availableSeats;
  const occupancyRate = totalSeats > 0 ? Math.round((occupiedSeats / totalSeats) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* 4 Main Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Buses */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Buses
            </span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Bus className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{totalBuses}</span>
            <span className="text-xs text-slate-500 ml-2 font-medium">Active fleet vehicles</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center text-xs text-emerald-600 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
            100% Operational Today
          </div>
        </div>

        {/* Total Routes */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Routes
            </span>
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Route className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{totalRoutes}</span>
            <span className="text-xs text-slate-500 ml-2 font-medium">Routes (A, B, C, D)</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center text-xs text-slate-500 font-medium">
            <span>Covers all major city zones</span>
          </div>
        </div>

        {/* Total Seats */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Seats
            </span>
            <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{totalSeats}</span>
            <span className="text-xs text-slate-500 ml-2 font-medium">Capacity</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>40 seats per coach</span>
            <span className="font-semibold text-slate-700">{occupancyRate}% filled</span>
          </div>
        </div>

        {/* Available Seats */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Available Seats
            </span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline">
            <span className="text-3xl font-extrabold text-emerald-600 tracking-tight">
              {availableSeats}
            </span>
            <span className="text-sm font-semibold text-slate-400 ml-1.5">/ {totalSeats}</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center text-xs text-emerald-700 font-medium">
            <span>{Math.round((availableSeats / totalSeats) * 100)}% seats vacant right now</span>
          </div>
        </div>
      </div>

      {/* Route-by-Route Fleet Status Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900">Campus Fleet & Seat Availability Summary</h3>
            <p className="text-xs text-slate-500">Live seat inventory per assigned route bus</p>
          </div>
          <div className="text-xs bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 font-medium">
            Shift: Evening Departures (04:45 PM)
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Bus Number</th>
                <th className="px-5 py-3">Route</th>
                <th className="px-5 py-3">Stops Covered</th>
                <th className="px-5 py-3 text-center">Available / Total</th>
                <th className="px-5 py-3">Availability Status</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {buses.map((bus) => {
                const status = getAvailabilityStatus(bus.availableSeats, bus.totalSeats);
                const percent = Math.round((bus.availableSeats / bus.totalSeats) * 100);

                return (
                  <tr key={bus.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4 font-mono font-semibold text-slate-900">
                      {bus.busNumber}
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-semibold text-blue-700">{bus.routeName}</span>
                      <span className="block text-xs text-slate-400">{bus.shift}</span>
                    </td>
                    <td className="px-5 py-4 text-xs">
                      <span className="text-slate-600 font-medium">{bus.stops.join(' → ')}</span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="inline-block text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{bus.availableSeats}</span>
                          <span className="text-slate-400 text-xs">/ {bus.totalSeats}</span>
                        </div>
                        <div className="w-20 bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                          <div
                            className={`h-full ${
                              status === 'high'
                                ? 'bg-emerald-500'
                                : status === 'medium'
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${
                          status === 'high'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : status === 'medium'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            status === 'high'
                              ? 'bg-emerald-500'
                              : status === 'medium'
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                          }`}
                        />
                        {status === 'high'
                          ? 'High (Vacant)'
                          : status === 'medium'
                          ? 'Medium'
                          : 'Low (Filling Fast)'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      {onSelectBus && (
                        <button
                          type="button"
                          onClick={() => onSelectBus(bus)}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 transition-colors cursor-pointer"
                        >
                          View Route
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
