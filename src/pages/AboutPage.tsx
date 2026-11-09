import React from 'react';
import { Bus, MapPin, Users, CheckCircle, Info, ShieldCheck, HelpCircle, Phone, BookOpen } from 'lucide-react';

interface AboutPageProps {
  onNavigateTab: (tab: 'home' | 'find' | 'routes' | 'dashboard' | 'about') => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigateTab }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200">
          <Info className="w-3.5 h-3.5" />
          <span>Project Information & Documentation</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          About the System
        </h1>
        <p className="text-base text-slate-600 leading-relaxed font-normal">
          A dedicated student-centric transit information and capacity verification platform.
        </p>
      </div>

      {/* Primary Mandate Banner (Prompt Requirement) */}
      <div className="bg-blue-600 text-white rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="max-w-3xl mx-auto text-center space-y-3">
          <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mx-auto text-white">
            <Bus className="w-6 h-6" />
          </div>
          <blockquote className="text-lg sm:text-xl font-medium leading-relaxed italic text-blue-50">
            &ldquo;The College Bus Route &amp; Seat Management System helps students identify the correct college bus based on their destination and check seat availability before travelling.&rdquo;
          </blockquote>
          <p className="text-xs text-blue-200 font-medium">
            Campus Student Transportation &amp; Fleet Management Initiative
          </p>
        </div>
      </div>

      {/* Problem & Solution Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-3">
          <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
            <span className="font-bold text-sm">❗</span>
          </div>
          <h3 className="text-base font-bold text-slate-900">The Problem Students Face</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            In large institutions, hundreds of students commute daily across scattered city corridors. Students often do not know which assigned college bus goes to their destination, leading to confusion at boarding bays. Furthermore, they face difficulty knowing whether seats are available before walking to the terminal.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Jain University Transit Platform</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Students enter or select their destination stop. The portal queries the live university bus fleet, identifies the exact coach serving that corridor, presents the bus registration and route timeline, and highlights real-time seat availability to ensure safe, comfortable commuting.
          </p>
        </div>
      </div>

      {/* How It Works (3 Steps) */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
        <h3 className="text-lg font-bold text-slate-900 text-center">
          How To Use the System in 3 Easy Steps
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-2 text-center">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center mx-auto">
              1
            </div>
            <h4 className="font-semibold text-sm text-slate-900">Enter Your Destination</h4>
            <p className="text-xs text-slate-500">
              Type or select your drop point (e.g. JP Nagar, Electronic City) from the predefined list.
            </p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-2 text-center">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center mx-auto">
              2
            </div>
            <h4 className="font-semibold text-sm text-slate-900">Inspect Matched Bus</h4>
            <p className="text-xs text-slate-500">
              Review the assigned bus number, route name, departure bay, and driver contact number.
            </p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-2 text-center">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center mx-auto">
              3
            </div>
            <h4 className="font-semibold text-sm text-slate-900">Verify Available Seats</h4>
            <p className="text-xs text-slate-500">
              Check the live vacant seat indicator or view the 40-seater seat diagram before heading to the bus.
            </p>
          </div>
        </div>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => onNavigateTab('home')}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            Try Finding Your Bus Now
          </button>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-blue-600" />
          <span>Frequently Asked Questions</span>
        </h3>

        <div className="space-y-3">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h4 className="font-semibold text-sm text-slate-900">What time do college buses depart in the evening?</h4>
            <p className="text-xs text-slate-600 mt-1">
              All evening return buses depart at exactly <strong>04:45 PM</strong> from College Gate 2 Parking Bays 1 through 4.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h4 className="font-semibold text-sm text-slate-900">What happens if a bus is marked &ldquo;Low Availability&rdquo; or full?</h4>
            <p className="text-xs text-slate-600 mt-1">
              When a bus reaches maximum 40 capacity, students are requested to inform the Transport Coordinator at Gate 2 so an auxiliary shuttle can be deployed.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h4 className="font-semibold text-sm text-slate-900">Can I request a new destination stop?</h4>
            <p className="text-xs text-slate-600 mt-1">
              Yes, destination additions can be submitted to the college transport office with a minimum petition of 8 students residing in the requested vicinity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
