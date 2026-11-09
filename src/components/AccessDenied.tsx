import React from 'react';
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AccessDeniedProps {
  requiredRole: 'driver' | 'admin';
  onNavigateHome: () => void;
}

export const AccessDenied: React.FC<AccessDeniedProps> = ({ requiredRole, onNavigateHome }) => {
  const { role, userProfile } = useAuth();

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
      <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 border border-rose-200 mx-auto flex items-center justify-center shadow-xs">
        <Lock className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold uppercase tracking-wider">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Access Restricted</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          {requiredRole === 'admin' ? 'Administrator Clearance Required' : 'Driver Console Clearance Required'}
        </h2>
        <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
          Your current account is logged in with the{' '}
          <strong className="text-slate-900 uppercase font-bold">{role}</strong> role. Only authorized{' '}
          <strong className="text-slate-900">{requiredRole === 'admin' ? 'Fleet Administrators' : 'Assigned Drivers & Administrators'}</strong>{' '}
          can access this management portal.
        </p>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-500 max-w-md mx-auto space-y-1 text-left">
        <div><strong>Logged in as:</strong> {userProfile?.displayName || userProfile?.email}</div>
        <div><strong>Campus:</strong> {userProfile?.campus || 'Jain University Global Campus'}</div>
        <div><strong>Active Role:</strong> {role.toUpperCase()}</div>
      </div>

      <div className="pt-2">
        <button
          type="button"
          onClick={onNavigateHome}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Student Home & Routes</span>
        </button>
      </div>
    </div>
  );
};
