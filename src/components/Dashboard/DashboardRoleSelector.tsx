import React from 'react';
import {
  GraduationCap,
  Stethoscope,
  Building2,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Lock,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { Role, AuthSessionUser } from '../../types';

interface DashboardRoleSelectorProps {
  currentRole: Role;
  onSelectRole: (role: Role) => void;
  currentSession: AuthSessionUser | null;
  onQuickAuth: (role: 'counselor' | 'admin') => void;
  unreadAlertCount: number;
}

export const DashboardRoleSelector: React.FC<DashboardRoleSelectorProps> = ({
  currentRole,
  onSelectRole,
  currentSession,
  onQuickAuth,
  unreadAlertCount,
}) => {
  const isCounselor = authSessionIs(currentSession, 'counselor');
  const isAdmin = authSessionIs(currentSession, 'admin');

  function authSessionIs(session: AuthSessionUser | null, role: 'counselor' | 'admin') {
    return session?.role === role;
  }

  return (
    <div className="bg-white border-b border-slate-200/80 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Section Title / Explainer */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100/80 text-emerald-800 flex items-center justify-center font-bold text-sm shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 tracking-tight">
                  MannMitra Role Hub
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium border border-slate-200">
                  Select Dashboard View
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Choose a role perspective below to test Student, Counselor, or Institutional Admin features
              </p>
            </div>
          </div>

          {/* Interactive Role Cards / Selector Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {/* 0. Front Page Overview */}
            <button
              onClick={() => onSelectRole('landing')}
              className={`p-2.5 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                currentRole === 'landing'
                  ? 'bg-emerald-50/90 border-emerald-600 ring-2 ring-emerald-500/20 shadow-sm'
                  : 'bg-slate-50/70 hover:bg-slate-100 border-slate-200 text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center ${
                      currentRole === 'landing'
                        ? 'bg-emerald-700 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    <span>🏠</span>
                  </div>
                  <span>Overview</span>
                </div>
                {currentRole === 'landing' && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                )}
              </div>
              <div className="text-[10px] text-slate-500 mt-1 leading-tight">
                Front Page & Portals
              </div>
            </button>

            {/* 1. Student Option */}
            <button
              onClick={() => onSelectRole('student')}
              className={`p-2.5 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                currentRole === 'student'
                  ? 'bg-emerald-50/90 border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm'
                  : 'bg-slate-50/70 hover:bg-slate-100 border-slate-200 text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center ${
                      currentRole === 'student'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    <GraduationCap className="w-3.5 h-3.5" />
                  </div>
                  <span>Student View</span>
                </div>
                {currentRole === 'student' && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                )}
              </div>
              <div className="text-[10px] text-slate-500 mt-1 leading-tight">
                Check-ins, Voice & Trends
              </div>
            </button>

            {/* 2. Counselor Option */}
            <button
              onClick={() => {
                if (!isCounselor) {
                  onQuickAuth('counselor');
                }
                onSelectRole('counselor');
              }}
              className={`p-2.5 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                currentRole === 'counselor'
                  ? 'bg-teal-50/90 border-teal-500 ring-2 ring-teal-500/20 shadow-sm'
                  : 'bg-slate-50/70 hover:bg-slate-100 border-slate-200 text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center ${
                      currentRole === 'counselor'
                        ? 'bg-teal-600 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    <Stethoscope className="w-3.5 h-3.5" />
                  </div>
                  <span>Counselor</span>
                </div>
                {currentRole === 'counselor' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                ) : unreadAlertCount > 0 ? (
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-rose-500 text-white font-bold animate-pulse">
                    {unreadAlertCount}
                  </span>
                ) : null}
              </div>
              <div className="text-[10px] text-slate-500 mt-1 leading-tight">
                Longitudinal Triage & AI
              </div>
            </button>

            {/* 3. Admin Option */}
            <button
              onClick={() => {
                if (!isAdmin) {
                  onQuickAuth('admin');
                }
                onSelectRole('admin');
              }}
              className={`p-2.5 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                currentRole === 'admin'
                  ? 'bg-indigo-50/90 border-indigo-600 ring-2 ring-indigo-500/20 shadow-sm'
                  : 'bg-slate-50/70 hover:bg-slate-100 border-slate-200 text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center ${
                      currentRole === 'admin'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                  </div>
                  <span>Admin</span>
                </div>
                {currentRole === 'admin' && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                )}
              </div>
              <div className="text-[10px] text-slate-500 mt-1 leading-tight">
                Campus Heatmaps & Stats
              </div>
            </button>

            {/* 4. Story Walkthrough Demo */}
            <button
              onClick={() => onSelectRole('story_mode')}
              className={`p-2.5 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                currentRole === 'story_mode'
                  ? 'bg-amber-50/90 border-amber-500 ring-2 ring-amber-500/20 shadow-sm'
                  : 'bg-slate-50/70 hover:bg-slate-100 border-slate-200 text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center ${
                      currentRole === 'story_mode'
                        ? 'bg-amber-500 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <span>Aarav's Story</span>
                </div>
                {currentRole === 'story_mode' && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                )}
              </div>
              <div className="text-[10px] text-slate-500 mt-1 leading-tight">
                4-Week Interactive Case
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
