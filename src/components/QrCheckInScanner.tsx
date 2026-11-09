import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import {
  Scan,
  X,
  Camera,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Ticket,
  Volume2,
  RefreshCw,
  User,
  MapPin,
  Bus,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { SeatReservation } from '../types/bus';

interface QrCheckInScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (reservationId: string) => void;
  activeBusNumber?: string;
  activeBusId?: string;
  reservations: SeatReservation[];
}

export const QrCheckInScanner: React.FC<QrCheckInScannerProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
  activeBusNumber,
  activeBusId,
  reservations,
}) => {
  const [scanMessage, setScanMessage] = useState<{
    type: 'success' | 'warning' | 'error' | 'info';
    title: string;
    description: string;
    reservation?: SeatReservation;
  } | null>(null);

  const [verifiedReservation, setVerifiedReservation] = useState<SeatReservation | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState('');
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  // Play a synthesized audio chime via Web Audio API
  const playAudioBeep = (isSuccess = true) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (isSuccess) {
        // High pleasant double-beep for valid check-in
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1); // A5
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.25);
      } else {
        // Low buzzy warning beep
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.3);
      }
    } catch (e) {
      // Audio context might be restricted before user gesture
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setScanMessage(null);
      setVerifiedReservation(null);
      return;
    }

    const timer = setTimeout(() => {
      try {
        const container = document.getElementById('driver-qr-reader-container');
        if (!container) return;

        const scanner = new Html5QrcodeScanner(
          'driver-qr-reader-container',
          {
            fps: 10,
            qrbox: { width: 220, height: 220 },
            supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
          },
          false
        );

        scanner.render(
          (decodedText) => {
            handleDecodedText(decodedText);
          },
          (_error) => {
            // Frame misses are normal during continuous camera scanning
          }
        );

        scannerRef.current = scanner;
      } catch (e: any) {
        console.warn('Camera scanner initialization notice:', e);
        setCameraError(
          'Camera access may be restricted or unsupported in this browser frame. You can test live verification using the test boarding passes or manual pass code input below.'
        );
      }
    }, 200);

    return () => {
      clearTimeout(timer);
      if (scannerRef.current) {
        try {
          scannerRef.current.clear().catch(() => {});
        } catch (e) {}
      }
    };
  }, [isOpen]);

  // Comprehensive QR code parser and verification engine
  const handleDecodedText = (decodedText: string) => {
    if (!decodedText) return;
    const trimmed = decodedText.trim();

    let targetReservationId: string | null = null;
    let parsedJson: any = null;

    // 1. Try parsing structured JSON
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        parsedJson = JSON.parse(trimmed);
        if (parsedJson.reservationId) {
          targetReservationId = parsedJson.reservationId;
        }
      } catch (e) {
        // Not valid JSON, continue with text fallbacks
      }
    }

    // 2. Try prefix "JU-PASS:..."
    if (!targetReservationId) {
      if (trimmed.startsWith('JU-PASS:')) {
        targetReservationId = trimmed.replace('JU-PASS:', '').trim();
      } else {
        targetReservationId = trimmed;
      }
    }

    // 3. Find matching reservation in current reservations list
    const matched = reservations.find(
      (r) =>
        r.id === targetReservationId ||
        (parsedJson?.reservationId && r.id === parsedJson.reservationId) ||
        r.studentId?.toLowerCase() === trimmed.toLowerCase() ||
        r.userName.toLowerCase() === trimmed.toLowerCase()
    );

    if (matched) {
      // Check for Route / Bus mismatch
      const isBusMismatch =
        activeBusNumber &&
        matched.busNumber &&
        matched.busNumber.toLowerCase() !== activeBusNumber.toLowerCase();

      // Check if already checked in
      const isAlreadyCheckedIn = matched.status === 'checked_in';

      if (isAlreadyCheckedIn) {
        playAudioBeep(false);
        setScanMessage({
          type: 'warning',
          title: 'Already Checked In',
          description: `Student ${matched.userName} (Seat #${matched.seatNumber}) was already scanned and checked in for ${matched.busNumber}.`,
          reservation: matched,
        });
        setVerifiedReservation(matched);
        return;
      }

      if (isBusMismatch) {
        playAudioBeep(false);
        setScanMessage({
          type: 'warning',
          title: 'Coach / Route Mismatch Warning',
          description: `This pass is issued for ${matched.busNumber} (${matched.routeName}), but current vehicle is ${activeBusNumber}.`,
          reservation: matched,
        });
        setVerifiedReservation(matched);
        // Allow driver to confirm if cross-boarding is permitted
        return;
      }

      // Valid and pending check-in!
      playAudioBeep(true);
      setVerifiedReservation({ ...matched, status: 'checked_in' });
      setScanMessage({
        type: 'success',
        title: 'Boarding Pass Verified!',
        description: `Seat #${matched.seatNumber} verified for ${matched.userName} (${matched.studentId || 'JU-STUDENT'}). Checked into ${matched.busNumber}.`,
        reservation: matched,
      });

      // Trigger update in Firestore via parent handler
      onScanSuccess(matched.id);
    } else {
      playAudioBeep(false);
      setScanMessage({
        type: 'error',
        title: 'Pass Not Found / Unregistered',
        description: `Scanned code "${trimmed}". No active seat reservation found with this ticket ID. Please verify manual manifest.`,
      });
      setVerifiedReservation(null);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    handleDecodedText(manualCode.trim());
    setManualCode('');
  };

  const handleResetForNextStudent = () => {
    setScanMessage(null);
    setVerifiedReservation(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Scan className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-white">Driver Boarding QR Scanner</h3>
                {activeBusNumber && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700 font-mono">
                    {activeBusNumber}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Scan student digital QR code upon boarding to verify seat booking
              </p>
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

        {/* Modal Content */}
        <div className="p-6 space-y-4 overflow-y-auto">
          {/* Verification Status Overlay Card */}
          {scanMessage && (
            <div
              className={`p-4 rounded-2xl border transition-all animate-in zoom-in-95 ${
                scanMessage.type === 'success'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                  : scanMessage.type === 'warning'
                  ? 'bg-amber-50 border-amber-300 text-amber-950'
                  : 'bg-rose-50 border-rose-300 text-rose-950'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    scanMessage.type === 'success'
                      ? 'bg-emerald-200 text-emerald-800'
                      : scanMessage.type === 'warning'
                      ? 'bg-amber-200 text-amber-800'
                      : 'bg-rose-200 text-rose-800'
                  }`}
                >
                  {scanMessage.type === 'success' ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm leading-tight">{scanMessage.title}</h4>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/70">
                      {scanMessage.type === 'success' ? 'VALID' : 'NOTICE'}
                    </span>
                  </div>
                  <p className="text-xs mt-1 leading-snug opacity-90">{scanMessage.description}</p>

                  {/* If reservation details available, render summary pill */}
                  {scanMessage.reservation && (
                    <div className="mt-3 p-3 bg-white rounded-xl border border-slate-200/60 shadow-2xs text-xs grid grid-cols-2 gap-2 text-slate-700">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Student</span>
                        <span className="font-bold text-slate-900">
                          {scanMessage.reservation.userName}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Seat Assigned</span>
                        <span className="font-mono font-bold text-blue-700 text-sm">
                          Seat #{scanMessage.reservation.seatNumber}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Destination</span>
                        <span className="font-medium text-slate-800">
                          {scanMessage.reservation.destinationStop}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Coach / Bus</span>
                        <span className="font-mono font-semibold text-slate-800">
                          {scanMessage.reservation.busNumber}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="mt-3 flex gap-2">
                    {scanMessage.type === 'warning' && scanMessage.reservation && (
                      <button
                        type="button"
                        onClick={() => {
                          onScanSuccess(scanMessage.reservation!.id);
                          setScanMessage({
                            type: 'success',
                            title: 'Boarding Overridden & Verified',
                            description: `Student ${scanMessage.reservation!.userName} checked in by driver override.`,
                            reservation: scanMessage.reservation,
                          });
                        }}
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      >
                        Override & Check In
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleResetForNextStudent}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Ready for Next Student</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {cameraError && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{cameraError}</span>
            </div>
          )}

          {/* Camera Viewfinder Box */}
          <div className="bg-slate-900 rounded-2xl p-3 border border-slate-700 text-center relative overflow-hidden shadow-inner">
            <div id="driver-qr-reader-container" className="overflow-hidden rounded-xl bg-black" />
            <p className="text-[11px] text-slate-400 mt-2 flex items-center justify-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-emerald-400" />
              <span>Aim camera at student&apos;s phone displaying the Boarding Pass QR code</span>
            </p>
          </div>

          {/* Manual Code / Test Code Input Form */}
          <form onSubmit={handleManualSubmit} className="pt-2 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1.5">
                <Ticket className="w-3.5 h-3.5 text-emerald-600" />
                <span>Manual Pass Verification</span>
              </span>
              <span className="text-[10px] text-slate-400">If student phone has low battery/glare</span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Enter Pass ID (e.g. res-17311...) or Student Roll"
                className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 font-mono"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Verify
              </button>
            </div>
          </form>

          {/* Active Reservations Quick Test / Simulation Buttons */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Quick Test: Tap to Simulate QR Scan ({reservations.length} Bookings)</span>
              </span>
              <span className="text-[10px] text-slate-400">1-Tap Verification</span>
            </div>

            {reservations.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                {reservations.map((res) => {
                  const isDone = res.status === 'checked_in';
                  return (
                    <button
                      key={res.id}
                      type="button"
                      onClick={() => handleDecodedText(`JU-PASS:${res.id}`)}
                      className={`p-2.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between cursor-pointer group ${
                        isDone
                          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                          : 'bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 border-slate-200 text-slate-800'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="font-bold flex items-center gap-1.5 truncate">
                          <span>{res.userName}</span>
                          {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono truncate">
                          Seat #{res.seatNumber} • {res.destinationStop}
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded whitespace-nowrap ${
                          isDone
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-200 text-slate-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors'
                        }`}
                      >
                        {isDone ? 'Checked In' : 'Scan Pass'}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-500">
                No active reservations placed yet today. Reserve a seat as student to test scanner verification.
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
            <Volume2 className="w-3.5 h-3.5" />
            <span>Audio & visual scan confirmation enabled</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg cursor-pointer transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
