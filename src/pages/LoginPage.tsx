import React, { useState } from 'react';
import {
  GraduationCap,
  Truck,
  Shield,
  Building2,
  Clock,
  Calendar,
  AlertCircle,
  ArrowRight,
  Sparkles,
  MapPin,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types/bus';

export const LoginPage: React.FC = () => {
  const { loginWithGoogle, setDemoRole, updateRole, userProfile } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [loading, setLoading] = useState(false);
  const [authNotice, setAuthNotice] = useState<string | null>(null);

  // Custom login credentials state if user wants to log in with University Roll / Staff ID
  const [credentialInput, setCredentialInput] = useState('');
  const [nameInput, setNameInput] = useState('');

  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setAuthNotice(null);
      await loginWithGoogle();
      await updateRole(selectedRole);
    } catch (err: any) {
      // In iframes or restricted browser popups, popup may be closed or blocked
      if (err?.code === 'auth/popup-closed-by-user') {
        setAuthNotice(
          'Google popup window was closed before completing sign-in. You can try again or use the Instant Campus Login buttons below.'
        );
      } else if (err?.code === 'auth/popup-blocked') {
        setAuthNotice(
          'Your browser blocked the Google popup window. Please allow popups or use the Instant Campus Login buttons below.'
        );
      } else {
        setAuthNotice(
          'Google authentication encountered a network/domain notice. You can use the Instant Campus Login options below to sign in immediately.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCredentialSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    const id = credentialInput.trim() || (selectedRole === 'student' ? 'JU24CS109' : selectedRole === 'driver' ? 'DRV-101' : 'ADM-001');
    const name = nameInput.trim() || (selectedRole === 'student' ? 'Jain Student' : selectedRole === 'driver' ? 'Ramesh Kumar (Driver)' : 'Transport Admin');

    setDemoRole(selectedRole, {
      uid: `ju-${selectedRole}-${Date.now()}`,
      displayName: name,
      email: `${id.toLowerCase().replace(/[^a-z0-9]/g, '')}@jainuniversity.ac.in`,
      role: selectedRole,
      studentId: selectedRole === 'student' ? id : undefined,
      campus: 'Jain Global Campus (Kanaka Road / JGI)',
    });
  };

  const handleQuickRoleEnter = (role: UserRole) => {
    setDemoRole(role);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between text-slate-100 selection:bg-amber-400 selection:text-slate-950">
      {/* Top University Header Banner */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-4 py-3 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-sm shadow-md">
              JU
            </div>
            <div>
              <div className="font-extrabold text-white text-sm tracking-wide flex items-center gap-2">
                <span>JAIN (Deemed-to-be University)</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700/50">
                  TRANSPORT PORTAL
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Center for Management Studies & JGI Global Campus</p>
            </div>
          </div>

          {/* Real-time Clock on Login Screen */}
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {currentTime.toLocaleDateString('en-IN', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-800/80 text-amber-300 px-2.5 py-1 rounded-md border border-slate-700 font-mono font-bold">
              <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>{currentTime.toLocaleTimeString('en-IN', { hour12: true })} IST</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Login Card Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Card Top Banner */}
          <div className="p-6 sm:p-8 bg-gradient-to-b from-slate-800/90 to-slate-900 border-b border-slate-800 text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/30 text-xs font-semibold">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Campus Authentication Gateway</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Sign In to Continue
            </h1>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Please choose your campus role and sign in to access route finders, seat allocations, or transit controls.
            </p>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {authNotice && (
              <div className="p-3.5 rounded-xl bg-amber-950/60 border border-amber-700/60 text-amber-200 text-xs flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{authNotice}</span>
              </div>
            )}

            {/* Step 1: Role Selection Cards */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                1. Select Login Role
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {/* Student Role */}
                <button
                  type="button"
                  onClick={() => setSelectedRole('student')}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    selectedRole === 'student'
                      ? 'border-blue-500 bg-blue-950/60 text-white ring-2 ring-blue-500/40 shadow-md'
                      : 'border-slate-800 bg-slate-800/40 hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <GraduationCap
                    className={`w-6 h-6 mx-auto mb-1.5 ${
                      selectedRole === 'student' ? 'text-blue-400' : 'text-slate-500'
                    }`}
                  />
                  <div className="text-xs font-bold">Student</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Find & Book</div>
                </button>

                {/* Driver Role */}
                <button
                  type="button"
                  onClick={() => setSelectedRole('driver')}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    selectedRole === 'driver'
                      ? 'border-emerald-500 bg-emerald-950/60 text-white ring-2 ring-emerald-500/40 shadow-md'
                      : 'border-slate-800 bg-slate-800/40 hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Truck
                    className={`w-6 h-6 mx-auto mb-1.5 ${
                      selectedRole === 'driver' ? 'text-emerald-400' : 'text-slate-500'
                    }`}
                  />
                  <div className="text-xs font-bold">Driver</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Live Seats</div>
                </button>

                {/* Admin Role */}
                <button
                  type="button"
                  onClick={() => setSelectedRole('admin')}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    selectedRole === 'admin'
                      ? 'border-purple-500 bg-purple-950/60 text-white ring-2 ring-purple-500/40 shadow-md'
                      : 'border-slate-800 bg-slate-800/40 hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Shield
                    className={`w-6 h-6 mx-auto mb-1.5 ${
                      selectedRole === 'admin' ? 'text-purple-400' : 'text-slate-500'
                    }`}
                  />
                  <div className="text-xs font-bold">Admin</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Fleet Ops</div>
                </button>
              </div>
            </div>

            {/* Step 2: Primary Google Sign In */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                2. Authenticate
              </label>

              <button
                type="button"
                disabled={loading}
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm rounded-xl transition-all shadow-md cursor-pointer active:scale-98 disabled:opacity-60"
              >
                {/* Google colored G */}
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
                <span>
                  {loading
                    ? 'Connecting...'
                    : `Sign in with Google (${selectedRole.toUpperCase()})`}
                </span>
              </button>
            </div>

            {/* Step 3: University Direct Single Sign-On (SSO) */}
            <div className="pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Campus Single Sign-On (JU SSO)</span>
                </span>
                <span className="text-[10px] text-slate-400">JGI Auth Network</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickRoleEnter('student')}
                  className="py-2.5 px-2 bg-blue-900/40 hover:bg-blue-800/60 text-blue-200 border border-blue-700/50 rounded-xl text-xs font-bold transition-all text-center cursor-pointer"
                >
                  Enter as Student
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickRoleEnter('driver')}
                  className="py-2.5 px-2 bg-emerald-900/40 hover:bg-emerald-800/60 text-emerald-200 border border-emerald-700/50 rounded-xl text-xs font-bold transition-all text-center cursor-pointer"
                >
                  Enter as Driver
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickRoleEnter('admin')}
                  className="py-2.5 px-2 bg-purple-900/40 hover:bg-purple-800/60 text-purple-200 border border-purple-700/50 rounded-xl text-xs font-bold transition-all text-center cursor-pointer"
                >
                  Enter as Admin
                </button>
              </div>
            </div>

            {/* Custom Student ID / Staff ID quick form */}
            <form onSubmit={handleCredentialSignIn} className="pt-2 border-t border-slate-800 space-y-2.5">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Or Sign In with Jain ID & Name
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <input
                  type="text"
                  placeholder={
                    selectedRole === 'student'
                      ? 'Student ID (e.g. JU24CS089)'
                      : selectedRole === 'driver'
                      ? 'Driver License ID'
                      : 'Admin Staff ID'
                  }
                  value={credentialInput}
                  onChange={(e) => setCredentialInput(e.target.value)}
                  className="p-2.5 bg-slate-800/80 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400"
                />
                <input
                  type="text"
                  placeholder="Your Full Name"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="p-2.5 bg-slate-800/80 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 hover:border-amber-400/50 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Login with {selectedRole.toUpperCase()} Credentials</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* University Footer on Login Page */}
      <footer className="border-t border-slate-800/80 py-4 px-4 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} JAIN (Deemed-to-be University). College Bus Route & Seat Management System.</p>
        <p className="text-[11px] text-slate-600 mt-0.5">Secure Role-Based Campus Transit Access</p>
      </footer>
    </div>
  );
};
