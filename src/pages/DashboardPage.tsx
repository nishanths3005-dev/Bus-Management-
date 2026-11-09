import React from 'react';
import { BarChart3, Bus, ShieldAlert, CheckCircle2, Route as RouteIcon, Users, ArrowUpRight } from 'lucide-react';
import { BusRoute } from '../types/bus';
import { DashboardStats } from '../components/DashboardStats';

interface DashboardPageProps {
  buses: BusRoute[];
  onViewRoute: (bus: BusRoute) => void;
  onViewSeatMap: (bus: BusRoute) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  buses,
  onViewRoute,
  onViewSeatMap,
}) => {
  const totalSeats = buses.reduce((acc, b) => acc + b.totalSeats, 0);
  const totalAvailable = buses.reduce((acc, b) => acc + b.availableSeats, 0);
  const totalOccupied = totalSeats - totalAvailable;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>Operational Analytics</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Campus Transit & Fleet Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Dynamic statistics, seat availability status, and fleet metrics calculated from live route data.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto bg-emerald-50 text-emerald-800 border border-emerald-200 px-3.5 py-1.5 rounded-lg text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Live Campus Feed Connected</span>
        </div>
      </div>

      {/* Main Calculated Stats & Summary Table */}
      <DashboardStats buses={buses} onSelectBus={onViewRoute} />

      {/* Visual Capacity Distribution Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overall Seat Capacity Bar */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">Total Campus Seat Allocation</h3>
            <span className="text-xs font-semibold text-slate-500">{totalSeats} Total Seats</span>
          </div>

          <div className="space-y-2">
            <div className="h-6 w-full bg-slate-100 rounded-lg overflow-hidden flex border border-slate-200">
              <div
                className="bg-blue-600 text-[10px] text-white flex items-center justify-center font-bold transition-all duration-500"
                style={{ width: `${(totalOccupied / totalSeats) * 100}%` }}
                title={`Occupied: ${totalOccupied} seats`}
              >
                {Math.round((totalOccupied / totalSeats) * 100)}% Booked
              </div>
              <div
                className="bg-emerald-500 text-[10px] text-white flex items-center justify-center font-bold transition-all duration-500"
                style={{ width: `${(totalAvailable / totalSeats) * 100}%` }}
                title={`Available: ${totalAvailable} seats`}
              >
                {Math.round((totalAvailable / totalSeats) * 100)}% Free
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-blue-600"></span>
                <span>Occupied Seats: <strong>{totalOccupied}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-emerald-500"></span>
                <span>Vacant Available: <strong>{totalAvailable}</strong></span>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-500 pt-2 border-t border-slate-100">
            Real-time verification: When students arrive at bus bays, drivers cross-check digital manifests with physical seats.
          </p>
        </div>

        {/* Bus Occupancy Comparison */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">Seat Availability By Bus</h3>
            <span className="text-xs text-slate-400">40 seats per coach</span>
          </div>

          <div className="space-y-3">
            {buses.map((b) => {
              const freePercent = Math.round((b.availableSeats / b.totalSeats) * 100);
              return (
                <div key={b.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">
                      {b.busNumber} ({b.routeName})
                    </span>
                    <span className="font-medium text-slate-600">
                      {b.availableSeats} seats left ({freePercent}% vacant)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        freePercent > 50
                          ? 'bg-emerald-500'
                          : freePercent >= 20
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${freePercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Route B has highest vacancies</span>
            <span>Route C filling fastest (8 seats)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
