import React from 'react';
import { Bus, MapPin, Phone, Mail, Clock } from 'lucide-react';

interface FooterProps {
  onNavClick: (tab: 'home' | 'find' | 'routes' | 'dashboard' | 'about') => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavClick }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-16 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: System info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                <Bus className="w-4 h-4" />
              </div>
              <span className="font-bold text-white text-base">College Bus Portal</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Official student transit & seat management system. Check your route, verify assigned bus bay, and track seat availability before departure.
            </p>
            <div className="text-xs text-slate-400 flex items-center gap-1.5 pt-1">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span>Campus Transport Office: 8:00 AM – 6:00 PM</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => onNavClick('home')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Home & Search
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavClick('find')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Find Bus by Destination
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavClick('routes')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  All Campus Bus Routes
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavClick('dashboard')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Fleet & Seat Dashboard
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavClick('about')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  About the Project
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Key Stops Covered */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Key Stops Covered
            </h4>
            <div className="flex flex-wrap gap-1.5 text-[11px]">
              <span className="px-2 py-1 bg-slate-800 text-slate-300 rounded-md">JP Nagar</span>
              <span className="px-2 py-1 bg-slate-800 text-slate-300 rounded-md">Jayanagar</span>
              <span className="px-2 py-1 bg-slate-800 text-slate-300 rounded-md">Electronic City</span>
              <span className="px-2 py-1 bg-slate-800 text-slate-300 rounded-md">Bommasandra</span>
              <span className="px-2 py-1 bg-slate-800 text-slate-300 rounded-md">Hosur</span>
              <span className="px-2 py-1 bg-slate-800 text-slate-300 rounded-md">Attibele</span>
              <span className="px-2 py-1 bg-slate-800 text-slate-300 rounded-md">Banashankari</span>
              <span className="px-2 py-1 bg-slate-800 text-slate-300 rounded-md">BTM Layout</span>
              <span className="px-2 py-1 bg-slate-800 text-slate-300 rounded-md">Koramangala</span>
              <span className="px-2 py-1 bg-slate-800 text-slate-300 rounded-md">Silk Board</span>
            </div>
          </div>

          {/* Col 4: Transport Help Desk */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Transport Helpdesk
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>Transport Directorate, Gate 2, JGI Global Campus</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>Transport Helpdesk: +91 80 4650 1000 / Ext 441</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>transport@jainuniversity.ac.in</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} JAIN (Deemed-to-be University). Department of Student Transport & Fleet Operations. All rights reserved.</p>
          <p className="text-slate-400">
            JGI Global Campus Transit Services
          </p>
        </div>
      </div>
    </footer>
  );
};
