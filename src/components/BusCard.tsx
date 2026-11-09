import React from 'react';
import { Bus, MapPin, Users, ArrowRight, Clock, Phone, CheckCircle2, Ticket } from 'lucide-react';
import { BusRoute, getAvailabilityStatus } from '../types/bus';

interface BusCardProps {
  bus: BusRoute;
  searchedDestination?: string;
  onViewRoute: (bus: BusRoute) => void;
  onViewSeatMap?: (bus: BusRoute) => void;
  onBookSeat?: (busId: string) => void;
  onViewBoardingPass?: (busId: string) => void;
  isBookedByStudent?: boolean;
}

export const BusCard: React.FC<BusCardProps> = ({
  bus,
  searchedDestination,
  onViewRoute,
  onViewSeatMap,
  onBookSeat,
  onViewBoardingPass,
  isBookedByStudent = false,
}) => {
  const status = getAvailabilityStatus(bus.availableSeats, bus.totalSeats);
  const occupancyPercentage = Math.round(((bus.totalSeats - bus.availableSeats) / bus.totalSeats) * 100);
  const availablePercentage = Math.round((bus.availableSeats / bus.totalSeats) * 100);

  // Status-specific styling
  const statusConfig = {
    high: {
      label: 'High Availability',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      barColor: 'bg-emerald-500',
      dotColor: 'bg-emerald-500',
      textColor: 'text-emerald-700',
    },
    medium: {
      label: 'Medium Availability',
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
      barColor: 'bg-amber-500',
      dotColor: 'bg-amber-500',
      textColor: 'text-amber-700',
    },
    low: {
      label: 'Low Availability',
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
      barColor: 'bg-rose-500',
      dotColor: 'bg-rose-500',
      textColor: 'text-rose-700',
    },
  }[status];

  // Destination stop match check
  const hasMatchedDestination = searchedDestination
    ? bus.stops.some((s) => s.toLowerCase() === searchedDestination.toLowerCase())
    : false;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between group">
      <div>
        {/* Card Header: Bus Number & Route Badge */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-blue-600/10 text-blue-600 flex items-center justify-center shrink-0 border border-blue-600/20 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Bus className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-900 text-lg tracking-tight">
                    {bus.busNumber}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-sm bg-blue-100 text-blue-800">
                    {bus.routeName}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Departs: {bus.departureTime}</span>
                </p>
              </div>
            </div>

            {/* Availability Status Badge */}
            <div
              className={`text-xs font-semibold px-2.5 py-1 rounded-md border flex items-center gap-1.5 shrink-0 ${statusConfig.badgeClass}`}
            >
              <span className={`w-2 h-2 rounded-full ${statusConfig.dotColor}`}></span>
              <span>{statusConfig.label}</span>
            </div>
          </div>

          {/* Searched Destination Notice if relevant */}
          {hasMatchedDestination && searchedDestination && (
            <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-blue-900 font-medium">
                <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  Matches your destination stop:{' '}
                  <strong className="font-semibold underline decoration-blue-400">{searchedDestination}</strong>
                </span>
              </div>
              <span className="bg-blue-600 text-white font-bold px-2 py-0.5 rounded-sm text-[11px]">
                Direct Bus
              </span>
            </div>
          )}
        </div>

        {/* Route Stops Preview */}
        <div className="p-5 space-y-4">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              <span>Bus Route ({bus.stops.length} Stops)</span>
              <span>College Transit</span>
            </div>

            {/* Horizontal stop chain */}
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                {bus.stops.map((stop, index) => {
                  const isDestination =
                    searchedDestination && stop.toLowerCase() === searchedDestination.toLowerCase();
                  const isFirst = index === 0;

                  return (
                    <React.Fragment key={stop}>
                      <span
                        className={`px-2 py-1 rounded-md font-medium transition-all ${
                          isDestination
                            ? 'bg-blue-600 text-white font-bold shadow-xs'
                            : isFirst
                            ? 'bg-slate-200 text-slate-800 font-semibold'
                            : 'bg-white text-slate-700 border border-slate-200'
                        }`}
                      >
                        {isDestination && '🎯 '}
                        {stop}
                      </span>
                      {index < bus.stops.length - 1 && (
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Seat Availability Section */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
                <Users className="w-4 h-4 text-slate-500" />
                <span>Available Seats</span>
              </div>
              <div className="text-right">
                <span className={`text-base font-bold ${statusConfig.textColor}`}>
                  {bus.availableSeats}
                </span>
                <span className="text-slate-400 text-sm font-medium"> / {bus.totalSeats} seats</span>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
              <div
                className={`h-full transition-all duration-500 ${statusConfig.barColor}`}
                style={{ width: `${availablePercentage}%` }}
                title={`${bus.availableSeats} of ${bus.totalSeats} seats available`}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
              <span>{occupancyPercentage}% occupied</span>
              <span className="font-medium text-slate-700">{bus.availableSeats} seats vacant</span>
            </div>
          </div>

          {/* Driver & Bay Info */}
          <div className="grid grid-cols-2 gap-2 text-xs pt-1 text-slate-600 border-t border-slate-100">
            <div>
              <span className="text-slate-400 block text-[11px]">Assigned Driver</span>
              <span className="font-medium text-slate-800">{bus.driverName}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Helpline Contact</span>
              <span className="font-medium text-slate-800 flex items-center gap-1">
                <Phone className="w-3 h-3 text-slate-400" />
                {bus.driverPhone}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Actions */}
      <div className="p-4 pt-0 bg-white">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onViewRoute(bus)}
            className="w-full py-2.5 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            <span>View Route</span>
          </button>

          {onViewSeatMap && (
            <button
              type="button"
              onClick={() => onViewSeatMap(bus)}
              className="w-full py-2.5 px-3 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs border border-blue-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Users className="w-3.5 h-3.5 text-blue-600" />
              <span>Seat Layout</span>
            </button>
          )}
        </div>

        {/* Quick seat reservation simulator toggle */}
        {onBookSeat && (
          <div className="mt-2 pt-2 border-t border-slate-100">
            {isBookedByStudent ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 text-xs text-emerald-800">
                  <span className="flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Your seat is reserved!</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => onBookSeat(bus.id)}
                    className="text-xs text-rose-600 hover:text-rose-800 cursor-pointer font-medium ml-2 hover:underline"
                  >
                    Cancel
                  </button>
                </div>

                {onViewBoardingPass && (
                  <button
                    type="button"
                    onClick={() => onViewBoardingPass(bus.id)}
                    className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Ticket className="w-4 h-4" />
                    <span>View QR Boarding Pass</span>
                  </button>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onBookSeat(bus.id)}
                disabled={bus.availableSeats <= 0}
                className={`w-full py-2 px-3 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                  bus.availableSeats > 0
                    ? 'bg-slate-900 hover:bg-slate-800 text-white'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                <span>{bus.availableSeats > 0 ? 'Quick Reserve 1 Seat' : 'Bus Full (No Seats)'}</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
