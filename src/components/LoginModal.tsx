import React, { useState } from 'react';
import {
  X,
  Shield,
  GraduationCap,
  Truck,
  Building2,
  LogIn,
  CheckCircle,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types/bus';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { loginWithGoogle, setDemoRole, userProfile, updateRole } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      await loginWithGoogle();
      // Apply the user's selected role upon first login
      await updateRole(selectedRole);
      onClose();
    } catch (err: any) {
      console.error('Google Sign In failed:', err);
      // If popup was blocked or closed, give friendly message
      if (err?.code === 'auth/popup-closed-by-user') {
        setError('Login cancelled. Please try clicking Google Login again.');
      } else {
        setError(
          'Google authentication could not complete. You can also use the Instant Role Login buttons below.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInstantDemoLogin = (role: UserRole) => {
    setDemoRole(role);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden relative">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-black text-sm">
              JU
            </div>
            <span className="text-xs font-bold text-amber-400 tracking-wider uppercase">
              Jain (Deemed-to-be University)
            </span>
          </div>

          <h3 className="text-xl font-extrabold text-white">Campus Transit Portal</h3>
          <p className="text-xs text-slate-300 mt-1">
            Sign in with your university account or choose your role to access your dedicated portal.
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Role Selector tabs before Google Login */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              1. Select Your University Role
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedRole('student')}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  selectedRole === 'student'
                    ? 'border-blue-600 bg-blue-50/80 text-blue-900 ring-2 ring-blue-500/30'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <GraduationCap
                  className={`w-5 h-5 mx-auto mb-1 ${
                    selectedRole === 'student' ? 'text-blue-600' : 'text-slate-400'
                  }`}
                />
                <div className="text-xs font-bold">Student</div>
                <div className="text-[10px] text-slate-500">Book & Ride</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('driver')}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  selectedRole === 'driver'
                    ? 'border-emerald-600 bg-emerald-50/80 text-emerald-900 ring-2 ring-emerald-500/30'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Truck
                  className={`w-5 h-5 mx-auto mb-1 ${
                    selectedRole === 'driver' ? 'text-emerald-600' : 'text-slate-400'
                  }`}
                />
                <div className="text-xs font-bold">Driver</div>
                <div className="text-[10px] text-slate-500">Trip & Seats</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('admin')}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  selectedRole === 'admin'
                    ? 'border-purple-600 bg-purple-50/80 text-purple-900 ring-2 ring-purple-500/30'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Shield
                  className={`w-5 h-5 mx-auto mb-1 ${
                    selectedRole === 'admin' ? 'text-purple-600' : 'text-slate-400'
                  }`}
                />
                <div className="text-xs font-bold">Admin</div>
                <div className="text-[10px] text-slate-500">Fleet Control</div>
              </button>
            </div>
          </div>

          {/* Real Google OAuth Button */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              2. Sign In with Google
            </label>
            <button
              type="button"
              disabled={loading}
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-slate-200 hover:border-blue-600 bg-white hover:bg-blue-50/30 text-slate-800 font-semibold text-sm rounded-xl transition-all shadow-xs cursor-pointer active:scale-98 disabled:opacity-50"
            >
              {/* Google colored G SVG */}
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{loading ? 'Connecting to Google...' : `Sign In with Google as ${selectedRole}`}</span>
            </button>
            <p className="text-[11px] text-slate-400 text-center mt-1.5">
              Supports any Google account or official Jain University domain (@jainuniversity.ac.in)
            </p>
          </div>

          {/* Quick Demo Switcher for presentations */}
          <div className="pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Quick Role Demo (1-Click Switch)</span>
              </span>
              <span className="text-[10px] text-slate-400">No login required</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleInstantDemoLogin('student')}
                className="py-2 px-2 bg-slate-100 hover:bg-blue-100 hover:text-blue-800 text-slate-700 text-xs font-medium rounded-lg transition-colors cursor-pointer text-center"
              >
                Demo Student
              </button>
              <button
                type="button"
                onClick={() => handleInstantDemoLogin('driver')}
                className="py-2 px-2 bg-slate-100 hover:bg-emerald-100 hover:text-emerald-800 text-slate-700 text-xs font-medium rounded-lg transition-colors cursor-pointer text-center"
              >
                Demo Driver
              </button>
              <button
                type="button"
                onClick={() => handleInstantDemoLogin('admin')}
                className="py-2 px-2 bg-slate-100 hover:bg-purple-100 hover:text-purple-800 text-slate-700 text-xs font-medium rounded-lg transition-colors cursor-pointer text-center"
              >
                Demo Admin
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
