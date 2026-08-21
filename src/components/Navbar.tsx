import React from 'react';
import {
  HeartHandshake,
  LogIn,
  LogOut,
  ShieldCheck,
  GraduationCap,
  Stethoscope,
  Building2,
  PhoneCall,
  Lock,
} from 'lucide-react';
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
  const isStudentSession = currentSession?.role === 'student';
  const isCounselorSession = currentSession?.role === 'counselor';
  const isAdminSession = currentSession?.role === 'admin';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Logo */}
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
                  मनमित्र
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Consent-based student wellbeing early-warning system
              </p>
            </div>
          </div>

          {/* Center Navigation */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => onSelectRole('landing')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 ${
                currentRole === 'landing'
                  ? 'bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>🏠</span>
              <span>Home</span>
            </button>

            {/* If authenticated as student */}
            {isStudentSession && (
              <button
                onClick={() => onSelectRole('student')}
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 ${
                  currentRole === 'student'
                    ? 'bg-emerald-500 text-white font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>My Check-in Portal</span>
              </button>
            )}

            {/* If authenticated as counselor */}
            {isCounselorSession && (
              <button
                onClick={() => onSelectRole('counselor')}
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 ${
                  currentRole === 'counselor'
                    ? 'bg-teal-600 text-white font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Stethoscope className="w-4 h-4" />
                <span>Counselor Triage</span>
                {unreadAlertCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white font-bold animate-pulse">
                    {unreadAlertCount}
                  </span>
                )}
              </button>
            )}

            {/* If authenticated as admin */}
            {isAdminSession && (
              <button
                onClick={() => onSelectRole('admin')}
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 ${
                  currentRole === 'admin'
                    ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Institutional Analytics</span>
              </button>
            )}
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2">
            {/* When Logged In */}
            {currentSession ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 py-1 px-2.5 rounded-xl bg-slate-100 border border-slate-200 text-xs">
                  {currentSession.role === 'student' && (
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-[10px]">
                        🎓
                      </div>
                      <div className="text-left leading-tight">
                        <div className="font-semibold text-slate-800 text-[11px]">
                          {(currentSession.profile as StudentProfile).name}
                        </div>
                        <div className="text-[10px] text-emerald-700 font-mono">
                          {(currentSession.profile as StudentProfile).anonymousCode}
                        </div>
                      </div>
                    </div>
                  )}

                  {currentSession.role === 'counselor' && (
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-teal-700 text-white flex items-center justify-center font-bold text-[10px]">
                        🧑‍⚕️
                      </div>
                      <div className="text-left leading-tight">
                        <div className="font-semibold text-slate-800 text-[11px]">
                          {(currentSession.profile as StaffProfile).name}
                        </div>
                        <div className="text-[10px] text-teal-700 font-medium">Counselor</div>
                      </div>
                    </div>
                  )}

                  {currentSession.role === 'admin' && (
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-indigo-700 text-white flex items-center justify-center font-bold text-[10px]">
                        🏛️
                      </div>
                      <div className="text-left leading-tight">
                        <div className="font-semibold text-slate-800 text-[11px]">
                          {(currentSession.profile as StaffProfile).name}
                        </div>
                        <div className="text-[10px] text-indigo-700 font-medium">Administrator</div>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={onLogout}
                    title="Log Out"
                    className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-slate-200 transition-colors ml-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>

                {currentSession.role === 'student' && (
                  <button
                    onClick={onOpenCheckIn}
                    className="hidden sm:flex px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-all items-center gap-1"
                  >
                    <span>+ Check-in</span>
                  </button>
                )}
              </div>
            ) : (
              /* When Not Logged In */
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const el = document.getElementById('login-portals');
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth' });
                    } else {
                      onSelectRole('landing');
                    }
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-sm shadow-emerald-600/20 transition-all flex items-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In / Portals</span>
                </button>
              </div>
            )}

            {/* Ethics Modal Button */}
            <button
              onClick={onOpenEthicsModal}
              className="p-2 sm:px-2.5 sm:py-1.5 text-xs rounded-xl text-slate-700 hover:text-emerald-800 hover:bg-emerald-50 border border-slate-200 transition-colors flex items-center gap-1.5 font-medium"
              title="WHO Ethics, Privacy Safeguards & Judge Q&A"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="hidden lg:inline">Ethics Safeguards</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
