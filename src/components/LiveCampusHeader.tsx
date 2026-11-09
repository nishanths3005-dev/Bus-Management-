import React, { useState, useEffect } from 'react';
import { Clock, Calendar, MapPin, Building2, Wifi } from 'lucide-react';

export const LiveCampusHeader: React.FC = () => {
  const [time, setTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = time.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const formattedTime = time.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  // Current shift status based on actual time
  const currentHour = time.getHours();
  const shiftText =
    currentHour < 9
      ? 'Morning Arrival Shift (Reporting Bay 1-4)'
      : currentHour < 16
      ? 'Inter-Campus Transit & Day Classes'
      : currentHour <= 18
      ? 'Evening Dispersal Shift (04:45 PM Departures)'
      : 'Night Shuttle Standby Service';

  return (
    <div className="bg-slate-900 text-slate-200 border-b border-slate-800 text-xs py-2 px-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
        {/* University branding banner */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-bold text-white tracking-wide">
            <Building2 className="w-4 h-4 text-amber-400" />
            <span className="text-amber-400 uppercase font-black tracking-wider text-[11px]">
              JAIN (Deemed-to-be University)
            </span>
          </div>
          <span className="text-slate-500 hidden sm:inline">•</span>
          <span className="text-slate-300 hidden sm:inline flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-blue-400" />
            <span>Center for Management Studies & JGI Global Campus</span>
          </span>
        </div>

        {/* Real-time date, live clock, and active shift */}
        <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 text-[11px]">
          <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700/60">
            <Calendar className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-medium text-slate-200">{formattedDate}</span>
          </div>

          <div className="flex items-center gap-1.5 bg-blue-950/80 text-blue-200 px-2.5 py-1 rounded-md border border-blue-800/50 font-mono font-semibold">
            <Clock className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
            <span>{formattedTime} IST</span>
          </div>

          <div className="flex items-center gap-1.5 bg-emerald-950/60 text-emerald-300 px-2.5 py-1 rounded-md border border-emerald-800/40">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="font-medium truncate max-w-[200px] sm:max-w-none">{shiftText}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
