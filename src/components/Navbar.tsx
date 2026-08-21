import React from 'react';
import { ShieldCheck, HeartHandshake, Sparkles, LogIn, UserCircle, LogOut, Lock, Stethoscope, Building2, GraduationCap } from 'lucide-react';
import { Role, StudentProfile, StaffProfile, AuthSessionUser } from '../types';

interface NavbarProps {
  currentRole: Role;
  onSelectRole: (role: Role) => void;
  onOpenCheckIn: () => void;
  onOpenEthicsModal: () => void;
  unreadAlertCount: number;
  currentStudent?: StudentProfile;
  currentSession: AuthSessionUser | null;
  onOpenAuthModal: (targetRole?: 'student' | 'counselor' | 'admin') => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onSelectRole,
  onOpenCheckIn,
  onOpenEthicsModal,
  unreadAlertCount,
  currentStudent,
  currentSession,
  onOpenAuthModal,
  onLogout,
}) => {
  const isStudentSession = !currentSession || currentSession.role === 'student';
  const isCounselorSession = currentSession?.role === 'counselor';
  const isAdminSession = currentSession?.role === 'admin';

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-emerald-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div
            onClick={() => onSelectRole('landing')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
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
              onClick={() => onSelectRole('landing')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                currentRole === 'landing'
                  ? 'bg-white text-emerald-800 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🏠</span>
              <span className="hidden sm:inline">Overview</span>
              <span className="sm:hidden">Home</span>
            </button>

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
              {isStudentSession && (
                <Lock className="w-3 h-3 text-slate-400" title="Requires Counselor Login" />
              )}
              {unreadAlertCount > 0 && isCounselorSession && (
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
              {isStudentSession && (
                <Lock className="w-3 h-3 text-slate-400" title="Requires Administrator Login" />
              )}
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

          {/* Right Action Buttons & Active Profile */}
          <div className="flex items-center gap-2">
            {/* Active User Badge */}
            {currentSession && (
              <div className="hidden sm:flex items-center gap-1.5 p-1 pr-2 rounded-xl bg-slate-100 border border-slate-200 text-xs">
                {currentSession.role === 'student' && (
                  <button
                    onClick={() => onOpenAuthModal('student')}
                    className="flex items-center gap-2 text-slate-700 hover:text-emerald-800 transition-colors"
                  >
                    <img
                      src={(currentSession.profile as StudentProfile).avatar}
                      alt={(currentSession.profile as StudentProfile).name}
                      className="w-6 h-6 rounded-full object-cover border border-emerald-300"
                    />
                    <div className="text-left">
                      <div className="font-semibold text-[11px] leading-tight">
                        {(currentSession.profile as StudentProfile).name.split(' ')[0]}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {(currentSession.profile as StudentProfile).anonymousCode}
                      </div>
                    </div>
                  </button>
                )}

                {currentSession.role === 'counselor' && (
                  <button
                    onClick={() => onOpenAuthModal('counselor')}
                    className="flex items-center gap-2 text-teal-900 hover:text-teal-950 transition-colors"
                  >
                    <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-[10px]">
                      DR
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-[11px] leading-tight">
                        {(currentSession.profile as StaffProfile).name}
                      </div>
                      <div className="text-[10px] text-teal-700 font-medium">Counselor</div>
                    </div>
                  </button>
                )}

                {currentSession.role === 'admin' && (
                  <button
                    onClick={() => onOpenAuthModal('admin')}
                    className="flex items-center gap-2 text-slate-900 hover:text-slate-950 transition-colors"
                  >
                    <div className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-[10px]">
                      AD
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-[11px] leading-tight">
                        {(currentSession.profile as StaffProfile).name}
                      </div>
                      <div className="text-[10px] text-slate-600 font-medium">Administrator</div>
                    </div>
                  </button>
                )}

                <button
                  onClick={onLogout}
                  title="Sign out / Switch account"
                  className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-200/60 transition-colors ml-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* If no session or mobile button */}
            <button
              onClick={() => onOpenAuthModal(currentRole === 'counselor' ? 'counselor' : currentRole === 'admin' ? 'admin' : 'student')}
              className="px-2.5 py-1.5 text-xs rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-medium flex items-center gap-1.5 transition-colors sm:hidden"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Login</span>
            </button>

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
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-medium shadow-sm shadow-emerald-600/30 transition-all flex items-center gap-1.5"
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

