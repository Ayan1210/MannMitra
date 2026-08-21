import React from 'react';
import { ShieldCheck, HeartHandshake, Sparkles, BookOpen, AlertCircle } from 'lucide-react';
import { Role } from '../types';

interface NavbarProps {
  currentRole: Role;
  onSelectRole: (role: Role) => void;
  onOpenCheckIn: () => void;
  onOpenEthicsModal: () => void;
  unreadAlertCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onSelectRole,
  onOpenCheckIn,
  onOpenEthicsModal,
  unreadAlertCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-emerald-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-emerald-900 via-teal-800 to-emerald-700 bg-clip-text text-transparent">
                  MannMitra
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100/80 text-emerald-800 font-medium border border-emerald-200">
                  मनमित्र • Early Warning
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Consent-based student wellbeing pattern intelligence
              </p>
            </div>
          </div>

          {/* Role Navigation Pills */}
          <div className="flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200/80 text-xs sm:text-sm font-medium">
            <button
              onClick={() => onSelectRole('student')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                currentRole === 'student'
                  ? 'bg-white text-emerald-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🎓</span>
              <span>Student</span>
            </button>

            <button
              onClick={() => onSelectRole('counselor')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 relative ${
                currentRole === 'counselor'
                  ? 'bg-white text-teal-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🧑‍⚕️</span>
              <span>Counselor</span>
              {unreadAlertCount > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white font-bold animate-pulse">
                  {unreadAlertCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onSelectRole('admin')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                currentRole === 'admin'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🏛️</span>
              <span className="hidden md:inline">Admin</span>
              <span className="md:hidden">Stats</span>
            </button>

            <button
              onClick={() => onSelectRole('story_mode')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                currentRole === 'story_mode'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs font-semibold'
                  : 'text-amber-700 hover:text-amber-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">"Meet Aarav"</span> Demo
            </button>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenEthicsModal}
              className="px-2.5 py-1.5 text-xs rounded-lg text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 border border-slate-200 transition-colors flex items-center gap-1.5 font-medium"
              title="WHO Safeguards & Ethics Rationale"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="hidden lg:inline">Ethics & Safeguards</span>
            </button>

            {currentRole === 'student' && (
              <button
                onClick={onOpenCheckIn}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-medium shadow-sm shadow-emerald-600/30 transition-all flex items-center gap-1.5"
              >
                <span>+ Check-in</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
