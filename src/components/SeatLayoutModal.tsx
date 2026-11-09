import React, { useState } from 'react';
import { X, Bus, Users, CheckCircle, ShieldCheck } from 'lucide-react';
import { BusRoute } from '../types/bus';

interface SeatLayoutModalProps {
  bus: BusRoute | null;
  onClose: () => void;
  onBookSeat?: (busId: string, seatNumber: number) => void;
}

export const SeatLayoutModal: React.FC<SeatLayoutModalProps> = ({
  bus,
  onClose,
  onBookSeat,
}) => {
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  if (!bus) return null;

  const totalSeats = bus.totalSeats || 40;
  const occupancy = bus.seatOccupancy || [];

  const handleConfirmSeat = () => {
    if (selectedSeat !== null && onBookSeat) {
      onBookSeat(bus.id, selectedSeat);
      setBookingSuccess(true);
      setTimeout(() => {
        setBookingSuccess(false);
        onClose();
      }, 600);
    }
  };

  // Bus seat configuration: 10 rows, 4 seats per row (2 + 2 layout)
  const rows = Math.ceil(totalSeats / 4);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-300 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg">{bus.busNumber}</h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-sm bg-blue-500/30 text-blue-200">
                  {bus.routeName}
                </span>
              </div>
              <p className="text-xs text-slate-300">40-Seater Campus Coach Seat Map</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Legend */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-around text-xs font-medium text-slate-700">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-sm border border-emerald-400 bg-emerald-100"></div>
            <span>Available ({bus.availableSeats})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-sm border border-slate-300 bg-slate-300"></div>
            <span>Occupied ({totalSeats - bus.availableSeats})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-sm bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
              ✓
            </div>
            <span>Selected</span>
          </div>
        </div>

        {/* Bus Cabin Visual Layout */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-100/60">
          {bookingSuccess && (
            <div className="mb-4 bg-emerald-50 border border-emerald-300 rounded-xl p-3 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Seat #{selectedSeat} selected successfully for your college transit pass!</span>
            </div>
          )}

          <div className="max-w-xs mx-auto bg-white rounded-2xl border-2 border-slate-300 shadow-md p-4 relative">
            {/* Front of bus windshield & driver cabin */}
            <div className="border-b-2 border-dashed border-slate-300 pb-3 mb-4 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-md text-slate-600 font-medium">
                <Bus className="w-3.5 h-3.5" />
                <span>Front Entry Door</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-800 text-white px-2.5 py-1 rounded-md font-semibold text-[11px]">
                <span>Driver Cabin 👨‍✈️</span>
              </div>
            </div>

            {/* Seat Grid: 10 rows of 4 seats (A B - aisle - C D) */}
            <div className="space-y-2">
              {Array.from({ length: rows }).map((_, rowIndex) => {
                const seat1 = rowIndex * 4 + 1;
                const seat2 = rowIndex * 4 + 2;
                const seat3 = rowIndex * 4 + 3;
                const seat4 = rowIndex * 4 + 4;

                const isOccupied1 = occupancy[seat1 - 1] ?? false;
                const isOccupied2 = occupancy[seat2 - 1] ?? false;
                const isOccupied3 = occupancy[seat3 - 1] ?? false;
                const isOccupied4 = occupancy[seat4 - 1] ?? false;

                const renderSeat = (seatNum: number, isOccupied: boolean, label: string) => {
                  const isSelected = selectedSeat === seatNum;

                  return (
                    <button
                      key={seatNum}
                      type="button"
                      disabled={isOccupied}
                      onClick={() => setSelectedSeat(seatNum)}
                      title={`Seat ${seatNum} (${label}) - ${isOccupied ? 'Occupied' : 'Available'}`}
                      className={`w-9 h-9 rounded-lg text-xs font-semibold flex flex-col items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-300 scale-105'
                          : isOccupied
                          ? 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed opacity-80'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 cursor-pointer hover:border-emerald-500'
                      }`}
                    >
                      <span>{seatNum}</span>
                    </button>
                  );
                };

                return (
                  <div key={rowIndex} className="flex items-center justify-between text-xs">
                    {/* Row index indicator */}
                    <span className="text-[10px] text-slate-400 font-mono w-4">R{rowIndex + 1}</span>

                    {/* Left pair (Window A, Aisle B) */}
                    <div className="flex items-center gap-1.5">
                      {renderSeat(seat1, isOccupied1, 'Window')}
                      {renderSeat(seat2, isOccupied2, 'Aisle')}
                    </div>

                    {/* Central walking aisle */}
                    <div className="w-6 text-center text-[10px] text-slate-300 select-none">|</div>

                    {/* Right pair (Aisle C, Window D) */}
                    <div className="flex items-center gap-1.5">
                      {renderSeat(seat3, isOccupied3, 'Aisle')}
                      {renderSeat(seat4, isOccupied4, 'Window')}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Rear of bus */}
            <div className="mt-4 pt-3 border-t border-slate-200 text-center text-[11px] text-slate-400 font-medium">
              Rear Emergency Exit
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between">
          <div>
            {selectedSeat ? (
              <span className="text-xs text-slate-700">
                Selected Seat: <strong className="text-blue-600 font-bold">#{selectedSeat}</strong>
              </span>
            ) : (
              <span className="text-xs text-slate-500">Tap an available green seat</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              Close
            </button>
            {selectedSeat && (
              <button
                type="button"
                onClick={handleConfirmSeat}
                className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Select Seat #{selectedSeat}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
