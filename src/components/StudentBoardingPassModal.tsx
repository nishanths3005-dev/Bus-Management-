import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Ticket,
  X,
  Bus,
  CheckCircle2,
  Clock,
  MapPin,
  User,
  ShieldCheck,
  Copy,
  Check,
  Download,
  Share2,
  AlertTriangle,
  ArrowRight,
  Truck,
} from 'lucide-react';
import { SeatReservation } from '../types/bus';

interface StudentBoardingPassModalProps {
  reservation: SeatReservation | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenDriverScanner?: () => void;
}

export const StudentBoardingPassModal: React.FC<StudentBoardingPassModalProps> = ({
  reservation,
  isOpen,
  onClose,
  onOpenDriverScanner,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !reservation) return null;

  // Standardized structured JSON payload for camera scanning
  const qrPayload = JSON.stringify({
    type: 'JU_BUS_PASS',
    reservationId: reservation.id,
    busId: reservation.busId,
    busNumber: reservation.busNumber,
    routeName: reservation.routeName,
    seatNumber: reservation.seatNumber,
    studentName: reservation.userName,
    studentId: reservation.studentId || 'JU24CS089',
    destinationStop: reservation.destinationStop,
    bookingDate: reservation.bookingDate,
  });

  const isCheckedIn = reservation.status === 'checked_in';

  const handleCopyId = () => {
    navigator.clipboard?.writeText(`JU-PASS:${reservation.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-white">Student Boarding Pass</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-700">
                  e-Ticket
                </span>
              </div>
              <p className="text-xs text-slate-400">Jain University Campus Transit Pass</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Digital Ticket */}
        <div className="p-6 space-y-5 overflow-y-auto bg-slate-50/50">
          {/* Status Banner */}
          {isCheckedIn ? (
            <div className="bg-emerald-50 border-2 border-emerald-400 rounded-2xl p-4 text-emerald-900 flex items-center gap-3 animate-in fade-in">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 block">
                  Status: Boarded & Verified
                </span>
                <div className="font-bold text-sm text-emerald-950">
                  Scanned & Confirmed by Driver
                </div>
                {reservation.checkedInAt && (
                  <span className="text-[11px] text-emerald-700 block">
                    Verified at {reservation.checkedInAt}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3.5 text-blue-900 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block">
                  Active Transit Reservation
                </span>
                <p className="text-xs text-blue-950 font-medium leading-tight">
                  Show this QR code to the driver upon boarding at the coach door.
                </p>
              </div>
            </div>
          )}

          {/* Ticket Card Container */}
          <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-sm overflow-hidden relative">
            {/* Top decorative stripe */}
            <div className="h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500" />

            {/* Coach & Seat Highlight */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
                  Bus Coach
                </span>
                <div className="font-mono font-black text-lg text-slate-900">
                  {reservation.busNumber}
                </div>
                <div className="text-xs text-slate-600 font-medium">
                  {reservation.routeName}
                </div>
              </div>

              {/* Big Seat Badge */}
              <div className="bg-blue-600 text-white px-4 py-2 rounded-xl text-center shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-80 block">
                  Seat
                </span>
                <span className="font-mono font-black text-2xl leading-none">
                  #{reservation.seatNumber}
                </span>
              </div>
            </div>

            {/* QR Code Presentation Box */}
            <div className="p-5 flex flex-col items-center justify-center bg-white border-b border-dashed border-slate-200">
              <div className="p-3 bg-white rounded-2xl border-2 border-slate-900 shadow-md flex items-center justify-center">
                <QRCodeSVG
                  value={qrPayload}
                  size={190}
                  level="H"
                  includeMargin={true}
                />
              </div>

              <div className="mt-3 text-center space-y-1">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-700 font-mono bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                  <span>PASS ID:</span>
                  <span className="text-blue-700">{reservation.id}</span>
                </span>
                <p className="text-[11px] text-slate-400">
                  Keep screen brightness high for optimal scanning by driver
                </p>
              </div>
            </div>

            {/* Ticket Journey Details */}
            <div className="p-4 grid grid-cols-2 gap-3 text-xs bg-slate-50/40">
              <div>
                <span className="text-slate-400 block text-[10px]">Passenger</span>
                <span className="font-bold text-slate-900">{reservation.userName}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px]">Student ID / Roll</span>
                <span className="font-mono font-bold text-slate-900">
                  {reservation.studentId || 'JU24CS089'}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px]">Destination Stop</span>
                <span className="font-bold text-blue-700 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="truncate">{reservation.destinationStop}</span>
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px]">Campus Departure</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>04:45 PM • Bay 1–4</span>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={handleCopyId}
              className="py-2.5 px-3 bg-white hover:bg-slate-100 text-slate-700 font-semibold rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copy Pass ID</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="py-2.5 px-3 bg-white hover:bg-slate-100 text-slate-700 font-semibold rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Print / Save Pass</span>
            </button>
          </div>

          {/* Interactive Driver Scanner Simulator Link */}
          {onOpenDriverScanner && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenDriverScanner();
                }}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs group"
              >
                <Truck className="w-4 h-4 text-emerald-400" />
                <span>Switch to Driver Console to Scan & Verify</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Valid for today&apos;s evening shift</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg cursor-pointer transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
