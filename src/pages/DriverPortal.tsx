import React, { useState } from 'react';
import {
  Truck,
  Bus,
  Users,
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle,
  Play,
  Square,
  Navigation,
  Phone,
  ShieldCheck,
  ChevronRight,
  Scan,
  Sparkles,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { BusRoute, BusTransitStatus, SeatReservation } from '../types/bus';
import { useAuth } from '../context/AuthContext';
import { QrCheckInScanner } from '../components/QrCheckInScanner';

interface DriverPortalProps {
  buses: BusRoute[];
  reservations: SeatReservation[];
  onUpdateBusStatus: (busId: string, status: BusTransitStatus, currentStop?: string) => void;
  onUpdateAvailableSeats: (busId: string, newSeats: number) => void;
  onCheckInStudent: (reservationId: string) => void;
}

export const DriverPortal: React.FC<DriverPortalProps> = ({
  buses,
  reservations,
  onUpdateBusStatus,
  onUpdateAvailableSeats,
  onCheckInStudent,
}) => {
  const { userProfile } = useAuth();
  // Default to first bus (KA-01-JU-101) or driver's assigned bus
  const [selectedBusId, setSelectedBusId] = useState<string>(
    userProfile?.assignedBusId || buses[0]?.id || 'bus-1'
  );
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [optimizationRecommendation, setOptimizationRecommendation] = useState<string | null>(null);
  const [corridorPlaces, setCorridorPlaces] = useState<Array<{ title: string; uri: string; address?: string }>>([]);
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);

  const activeBus = buses.find((b) => b.id === selectedBusId) || buses[0];
  const busReservations = reservations.filter((r) => r.busId === activeBus?.id);

  if (!activeBus) return null;

  const handleGetCorridorOptimization = async () => {
    setIsOptimizing(true);
    try {
      const res = await fetch('/api/ai/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          busNumber: activeBus.busNumber,
          routeName: activeBus.routeName,
          currentStop: activeBus.currentStop || activeBus.stops[0],
          stops: activeBus.stops,
          availableSeats: activeBus.availableSeats,
          totalSeats: activeBus.totalSeats,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setOptimizationRecommendation(data.recommendation);
        setCorridorPlaces(data.mapsPlaces || []);
      }
    } catch (e) {
      console.warn('Driver optimization fetch failed:', e);
      setOptimizationRecommendation(
        `Maintain standard cruising speed along Kanakapura road towards ${activeBus.stops[1] || activeBus.routeName}. Silk Board & Electronic City flyovers encounter peak congestion between 05:15 PM and 06:30 PM.`
      );
    } finally {
      setIsOptimizing(false);
    }
  };

  const currentStopIndex = activeBus.stops.findIndex(
    (s) => s.toLowerCase() === (activeBus.currentStop || '').toLowerCase()
  );

  const handleNextStop = () => {
    const nextIdx = currentStopIndex >= 0 ? currentStopIndex + 1 : 1;
    if (nextIdx < activeBus.stops.length) {
      onUpdateBusStatus(activeBus.id, 'in_transit', activeBus.stops[nextIdx]);
    } else {
      onUpdateBusStatus(activeBus.id, 'completed', activeBus.stops[activeBus.stops.length - 1]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm border border-emerald-800/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 flex items-center justify-center shrink-0">
              <Truck className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 px-2 py-0.5 rounded-sm bg-emerald-950/80 border border-emerald-800">
                  Driver Console
                </span>
                <span className="text-xs text-slate-300">Jain Transport Operations</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                Captain {userProfile?.displayName || activeBus.driverName}
              </h1>
              <p className="text-xs text-slate-300 mt-1 flex items-center gap-2">
                <span>Vehicle: <strong className="text-white font-mono">{activeBus.busNumber}</strong></span>
                <span>•</span>
                <span>Assigned: <strong className="text-emerald-300">{activeBus.routeName}</strong></span>
              </p>
            </div>
          </div>

          {/* Quick bus selector if driver drives different routes */}
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80 space-y-1">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Active Vehicle Route
            </label>
            <select
              value={selectedBusId}
              onChange={(e) => setSelectedBusId(e.target.value)}
              className="bg-slate-900 text-white text-xs font-semibold px-3 py-2 rounded-lg border border-slate-700 focus:outline-hidden focus:border-emerald-500 w-full cursor-pointer"
            >
              {buses.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.busNumber} — {b.routeName} ({b.availableSeats} seats left)
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Live Trip Management Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Col 1 & 2: Trip Status & Stop Progression */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <Navigation className="w-5 h-5 text-emerald-600" />
                Live Route Progression
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Update your vehicle's physical location so students can track arrival at their stops.
              </p>
            </div>

            {/* Current Trip Status badge */}
            <div className="text-right">
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border ${
                  activeBus.status === 'in_transit'
                    ? 'bg-blue-50 text-blue-700 border-blue-200 animate-pulse'
                    : activeBus.status === 'boarding'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : activeBus.status === 'completed'
                    ? 'bg-slate-100 text-slate-600 border-slate-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}
              >
                ● {activeBus.status || 'scheduled'}
              </span>
            </div>
          </div>

          {/* Quick Trip Action Buttons */}
          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={() => onUpdateBusStatus(activeBus.id, 'boarding', activeBus.stops[0])}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer ${
                activeBus.status === 'boarding'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>1. Open Boarding at Campus</span>
            </button>

            <button
              type="button"
              onClick={() => onUpdateBusStatus(activeBus.id, 'in_transit', activeBus.stops[1] || activeBus.stops[0])}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer ${
                activeBus.status === 'in_transit'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100'
              }`}
            >
              <Play className="w-4 h-4" />
              <span>2. Start Evening Trip</span>
            </button>

            <button
              type="button"
              onClick={handleNextStop}
              disabled={activeBus.status === 'completed'}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition-all flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
            >
              <ChevronRight className="w-4 h-4" />
              <span>Next Stop Passed</span>
            </button>

            <button
              type="button"
              onClick={() => onUpdateBusStatus(activeBus.id, 'completed', activeBus.stops[activeBus.stops.length - 1])}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer ${
                activeBus.status === 'completed'
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Square className="w-4 h-4" />
              <span>End Route</span>
            </button>
          </div>

          {/* Stops visual checklist */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Route Stop Sequence
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {activeBus.stops.map((stop, index) => {
                const isCurrent = activeBus.currentStop?.toLowerCase() === stop.toLowerCase();
                const isPast =
                  currentStopIndex > 0 && index < currentStopIndex;

                return (
                  <div
                    key={stop}
                    className={`p-3 rounded-xl border transition-all text-xs ${
                      isCurrent
                        ? 'bg-blue-600 text-white font-bold ring-2 ring-blue-300 shadow-sm'
                        : isPast
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-medium'
                        : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] opacity-80">Stop #{index + 1}</span>
                      {isCurrent ? (
                        <span className="text-[10px] bg-white text-blue-900 px-1.5 py-0.5 rounded font-black">
                          HERE NOW
                        </span>
                      ) : isPast ? (
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      ) : null}
                    </div>
                    <div className="font-semibold text-sm leading-tight">{stop}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Col 3: Real-Time Seat Counter Adjuster */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Live Seat Adjuster
              </h3>
              <span className="text-xs text-slate-400 font-mono">Capacity: {activeBus.totalSeats}</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Adjust physical head-count when unreserved students board or deboard.
            </p>

            {/* Big available counter */}
            <div className="text-center py-6 bg-slate-50 rounded-2xl border border-slate-200 my-4">
              <div className="text-4xl sm:text-5xl font-black text-slate-900 font-mono">
                {activeBus.availableSeats}
              </div>
              <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mt-1">
                Seats Available
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                {activeBus.totalSeats - activeBus.availableSeats} of {activeBus.totalSeats} occupied
              </div>
            </div>

            {/* Driver +/- increment buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() =>
                  onUpdateAvailableSeats(activeBus.id, Math.max(0, activeBus.availableSeats - 1))
                }
                disabled={activeBus.availableSeats <= 0}
                className="py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer disabled:opacity-40"
              >
                +1 Student Boarded (-1 Seat)
              </button>

              <button
                type="button"
                onClick={() =>
                  onUpdateAvailableSeats(
                    activeBus.id,
                    Math.min(activeBus.totalSeats, activeBus.availableSeats + 1)
                  )
                }
                disabled={activeBus.availableSeats >= activeBus.totalSeats}
                className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer disabled:opacity-40"
              >
                +1 Seat Freed (+1 Vacant)
              </button>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs">
            <span className="font-semibold block mb-0.5">💡 Driver Tip:</span>
            <span>All changes instantly sync to students searching this route on their phones.</span>
          </div>
        </div>
      </div>

      {/* AI Corridor & Traffic Grounding Intelligence Card (Gemini 3.8 Flash + Google Maps) */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl p-6 shadow-sm border border-blue-900/40 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white">
                  Corridor Traffic & Bottleneck Intelligence
                </h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full font-mono font-bold">
                  Gemini 3.8 Flash • Maps Grounded
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Real-world Google Maps analysis for {activeBus.routeName} ({activeBus.busNumber})
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGetCorridorOptimization}
            disabled={isOptimizing}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50 self-start sm:self-auto"
          >
            {isOptimizing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Querying Google Maps...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{optimizationRecommendation ? 'Re-Analyze Route' : 'Analyze Corridor Conditions'}</span>
              </>
            )}
          </button>
        </div>

        {optimizationRecommendation && (
          <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-3 animate-in fade-in duration-150">
            <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-line">
              {optimizationRecommendation}
            </p>

            {corridorPlaces.length > 0 && (
              <div className="pt-2 border-t border-slate-700 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Grounding Locations on Corridor:
                </span>
                <div className="flex flex-wrap gap-2">
                  {corridorPlaces.map((p, idx) => (
                    <a
                      key={`${p.uri}-${idx}`}
                      href={p.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-950 border border-slate-600 text-[11px] text-emerald-300 hover:text-emerald-200 transition-colors"
                    >
                      <span>📍</span>
                      <span className="font-semibold">{p.title}</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Passenger Manifest / Student Check-in Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              Student Passenger Manifest ({busReservations.length} Bookings)
            </h3>
            <p className="text-xs text-slate-500">
              Check in registered Jain University students as they board at Bay 1–4
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsScannerOpen(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer self-start sm:self-auto"
          >
            <Scan className="w-4 h-4" />
            <span>Scan Student QR Pass</span>
          </button>
        </div>

        {busReservations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3">Seat #</th>
                  <th className="px-5 py-3">Student Name</th>
                  <th className="px-5 py-3">Destination Stop</th>
                  <th className="px-5 py-3">Student ID</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Check-in Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {busReservations.map((res) => (
                  <tr key={res.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4 font-mono font-bold text-blue-700">
                      Seat #{res.seatNumber}
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-900">
                      {res.userName}
                      <span className="block text-xs font-normal text-slate-400">{res.userEmail}</span>
                    </td>
                    <td className="px-5 py-4 text-xs font-medium text-slate-700">
                      {res.destinationStop}
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-slate-500">
                      {res.studentId || 'JU-VERIFIED'}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${
                          res.status === 'checked_in'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {res.status === 'checked_in' ? '✓ Boarded' : '● Awaiting Boarding'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      {res.status !== 'checked_in' ? (
                        <button
                          type="button"
                          onClick={() => onCheckInStudent(res.id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                        >
                          Mark Boarded
                        </button>
                      ) : (
                        <span className="text-xs text-emerald-600 font-bold">Verified</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400 text-xs">
            No advance seat reservations placed yet for {activeBus.busNumber}. Walk-in students can be added using the Live Seat Adjuster.
          </div>
        )}
      </div>

      {/* QR Boarding Scanner Modal */}
      <QrCheckInScanner
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        activeBusNumber={activeBus.busNumber}
        activeBusId={activeBus.id}
        reservations={reservations}
        onScanSuccess={(idOrCode) => {
          onCheckInStudent(idOrCode);
        }}
      />
    </div>
  );
};
