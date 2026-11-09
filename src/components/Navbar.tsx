import React, { useState } from 'react';
import {
  Bus,
  MapPin,
  BarChart3,
  Info,
  Menu,
  X,
  Route as RouteIcon,
  LogIn,
  LogOut,
  User,
  Shield,
  Truck,
  GraduationCap,
  Sparkles,
  Ticket,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types/bus';

interface NavbarProps {
  activeTab: 'home' | 'find' | 'routes' | 'dashboard' | 'about' | 'driver' | 'admin';
  setActiveTab: (tab: 'home' | 'find' | 'routes' | 'dashboard' | 'about' | 'driver' | 'admin') => void;
  onQuickFindClick?: () => void;
  onOpenLogin: () => void;
  activePassCount?: number;
  onOpenActivePass?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onQuickFindClick,
  onOpenLogin,
  activePassCount = 0,
  onOpenActivePass,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const { currentUser, userProfile, logout, updateRole, isDemoUser } = useAuth();

  const handleNavClick = (
    tab: 'home' | 'find' | 'routes' | 'dashboard' | 'about' | 'driver' | 'admin'
  ) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    if (tab === 'find' && onQuickFindClick) {
      onQuickFindClick();
    }
  };

  const currentRole = userProfile?.role || 'student';

  const roleBadgeConfig = {
    student: {
      label: 'Student',
      bg: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: <GraduationCap className="w-3.5 h-3.5" />,
    },
    driver: {
      label: 'Driver',
      bg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      icon: <Truck className="w-3.5 h-3.5" />,
    },
    admin: {
      label: 'Admin',
      bg: 'bg-purple-100 text-purple-800 border-purple-200',
      icon: <Shield className="w-3.5 h-3.5" />,
    },
  }[currentRole];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & College Title */}
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 text-left group focus:outline-hidden"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs group-hover:bg-blue-700 transition-colors">
              <Bus className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-slate-900 text-base sm:text-lg leading-tight flex items-center gap-1.5">
                <span>Jain University Bus</span>
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 bg-amber-100 text-amber-900 rounded border border-amber-300">
                  JU TRANSIT
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Route & Seat Management</p>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => handleNavClick('home')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'home'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => handleNavClick('find')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'find'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              Find Bus
            </button>
            <button
              onClick={() => handleNavClick('routes')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'routes'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <RouteIcon className="w-3.5 h-3.5 text-blue-600" />
              Routes
            </button>
            <button
              onClick={() => handleNavClick('dashboard')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'dashboard'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
              Dashboard
            </button>

            {/* Role-Specific Portal Links */}
            {(currentRole === 'driver' || currentRole === 'admin') && (
              <button
                onClick={() => handleNavClick('driver')}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  activeTab === 'driver'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-emerald-700 hover:bg-emerald-50'
                }`}
              >
                <Truck className="w-3.5 h-3.5" />
                Driver Console
              </button>
            )}

            {currentRole === 'admin' && (
              <button
                onClick={() => handleNavClick('admin')}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  activeTab === 'admin'
                    ? 'bg-purple-50 text-purple-700'
                    : 'text-purple-700 hover:bg-purple-50'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                Admin Panel
              </button>
            )}

            <button
              onClick={() => handleNavClick('about')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'about'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Info className="w-3.5 h-3.5 text-blue-600" />
              About
            </button>
          </nav>

          {/* User Auth Section */}
          <div className="hidden md:flex items-center gap-2 relative">
            {/* Active Boarding Pass Quick Shortcut Button */}
            {activePassCount > 0 && onOpenActivePass && (
              <button
                type="button"
                onClick={onOpenActivePass}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer ring-2 ring-emerald-300/60"
              >
                <Ticket className="w-3.5 h-3.5 text-amber-300" />
                <span>My Pass ({activePassCount})</span>
              </button>
            )}

            {currentUser ? (
              <div className="flex items-center gap-2">
                {/* Active Role Selector Pill */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${roleBadgeConfig.bg}`}
                  >
                    {roleBadgeConfig.icon}
                    <span>{roleBadgeConfig.label}</span>
                    <span className="text-[10px] text-slate-400">▾</span>
                  </button>

                  {/* Role Switcher Menu */}
                  {userDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl p-2 z-50 text-xs">
                      <div className="px-2 py-1.5 border-b border-slate-100 text-slate-500 text-[11px]">
                        Switch Jain Portal Role:
                      </div>
                      <button
                        onClick={() => {
                          updateRole('student');
                          setUserDropdownOpen(false);
                          setActiveTab('home');
                        }}
                        className="w-full text-left px-2 py-2 rounded-lg hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium"
                      >
                        <GraduationCap className="w-4 h-4 text-blue-600" />
                        <span>Student View</span>
                      </button>
                      <button
                        onClick={() => {
                          updateRole('driver');
                          setUserDropdownOpen(false);
                          setActiveTab('driver');
                        }}
                        className="w-full text-left px-2 py-2 rounded-lg hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium"
                      >
                        <Truck className="w-4 h-4 text-emerald-600" />
                        <span>Driver Console</span>
                      </button>
                      <button
                        onClick={() => {
                          updateRole('admin');
                          setUserDropdownOpen(false);
                          setActiveTab('admin');
                        }}
                        className="w-full text-left px-2 py-2 rounded-lg hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium"
                      >
                        <Shield className="w-4 h-4 text-purple-600" />
                        <span>Admin Panel</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* User Name & Photo */}
                <div className="flex items-center gap-2 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200">
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || 'User'}
                      className="w-6 h-6 rounded-full"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">
                      {(currentUser.displayName || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <span className="text-xs font-semibold text-slate-800 max-w-[120px] truncate">
                    {currentUser.displayName?.split(' ')[0] || 'User'}
                  </span>
                  <button
                    onClick={() => logout()}
                    className="text-slate-400 hover:text-rose-600 p-1 rounded-md hover:bg-slate-100 cursor-pointer"
                    title="Log Out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenLogin}
                className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Login / Select Role</span>
              </button>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="flex md:hidden items-center gap-2">
            {!currentUser && (
              <button
                type="button"
                onClick={onOpenLogin}
                className="px-2.5 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg"
              >
                Login
              </button>
            )}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-hidden"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2 shadow-lg">
          {currentUser && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${roleBadgeConfig.bg}`}>
                  {roleBadgeConfig.label}
                </span>
                <span className="font-semibold text-xs text-slate-800">
                  {currentUser.displayName || currentUser.email}
                </span>
              </div>
              <button
                onClick={() => logout()}
                className="text-xs text-rose-600 font-semibold"
              >
                Sign Out
              </button>
            </div>
          )}

          {activePassCount > 0 && onOpenActivePass && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenActivePass();
              }}
              className="w-full text-left px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold flex items-center justify-between shadow-xs mb-2 cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Ticket className="w-4 h-4 text-amber-300" />
                <span>View My Boarding Pass & QR</span>
              </span>
              <span className="bg-emerald-900/50 px-2 py-0.5 rounded text-[11px] font-mono">
                {activePassCount} Pass
              </span>
            </button>
          )}

          <button
            onClick={() => handleNavClick('home')}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 ${
              activeTab === 'home' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700'
            }`}
          >
            <Bus className="w-4 h-4 text-blue-600" />
            Home
          </button>
          <button
            onClick={() => handleNavClick('find')}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 ${
              activeTab === 'find' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700'
            }`}
          >
            <MapPin className="w-4 h-4 text-blue-600" />
            Find Bus
          </button>
          <button
            onClick={() => handleNavClick('routes')}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 ${
              activeTab === 'routes' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700'
            }`}
          >
            <RouteIcon className="w-4 h-4 text-blue-600" />
            Routes
          </button>
          <button
            onClick={() => handleNavClick('dashboard')}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 ${
              activeTab === 'dashboard' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-blue-600" />
            Dashboard
          </button>

          {(currentRole === 'driver' || currentRole === 'admin') && (
            <button
              onClick={() => handleNavClick('driver')}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 ${
                activeTab === 'driver' ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-emerald-700'
              }`}
            >
              <Truck className="w-4 h-4 text-emerald-600" />
              Driver Console
            </button>
          )}

          {currentRole === 'admin' && (
            <button
              onClick={() => handleNavClick('admin')}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 ${
                activeTab === 'admin' ? 'bg-purple-50 text-purple-800 font-bold' : 'text-purple-700'
              }`}
            >
              <Shield className="w-4 h-4 text-purple-600" />
              Admin Fleet Panel
            </button>
          )}

          <button
            onClick={() => handleNavClick('about')}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 ${
              activeTab === 'about' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700'
            }`}
          >
            <Info className="w-4 h-4 text-blue-600" />
            About
          </button>
        </div>
      )}
    </header>
  );
};
