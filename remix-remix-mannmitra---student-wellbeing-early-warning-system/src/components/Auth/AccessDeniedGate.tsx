import React from 'react';
import { Lock, ShieldAlert, ArrowLeft, KeyRound, UserCheck, Stethoscope, Building2 } from 'lucide-react';
import { Role, AuthSessionUser } from '../../types';

interface AccessDeniedGateProps {
  attemptedRole: 'counselor' | 'admin';
  currentSession: AuthSessionUser | null;
  onOpenLoginModal: (targetRole: 'counselor' | 'admin') => void;
  onQuickAuthenticate?: (role: 'counselor' | 'admin', email: string, pass: string) => void;
  onReturnToStudent: () => void;
}

export const AccessDeniedGate: React.FC<AccessDeniedGateProps> = ({
  attemptedRole,
  currentSession,
  onOpenLoginModal,
  onQuickAuthenticate,
  onReturnToStudent,
}) => {
  const isCounselor = attemptedRole === 'counselor';
  const portalName = isCounselor ? 'Counselor Early-Warning Portal' : 'Institutional Admin Portal';
  const roleName = isCounselor ? 'Campus Counselor / Psychologist' : 'Institutional Administrator';

  const handleQuick = (email: string, pass: string) => {
    if (onQuickAuthenticate) {
      onQuickAuthenticate(attemptedRole, email, pass);
    } else {
      onOpenLoginModal(attemptedRole);
    }
  };

  return (
    <div className="py-12 px-4 max-w-3xl mx-auto">
      <div className="bg-white rounded-3xl border border-rose-200 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 p-8 text-white relative">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-400/40 flex items-center justify-center text-rose-300">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-rose-500/30 text-rose-200 border border-rose-500/40">
                  Access Restricted • RBAC Enforced
                </span>
              </div>
              <h2 className="text-2xl font-bold mt-1 text-white">
                {portalName}
              </h2>
            </div>
          </div>
          <p className="text-slate-300 text-sm mt-3 leading-relaxed">
            This module contains confidential student longitudinal pattern data, clinical outreach logs, and campus-wide policy controls.
          </p>
        </div>

        {/* Body */}
        <div className="p-8 space-y-6">
          <div className="p-4 rounded-2xl bg-rose-50/80 border border-rose-200 flex items-start gap-3.5">
            <ShieldAlert className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-rose-900 space-y-1">
              <p className="font-semibold text-rose-950">
                {currentSession?.role === 'student'
                  ? `Active Session: Student Account (${(currentSession.profile as any).name || 'Student'})`
                  : 'Authentication Required'}
              </p>
              <p className="text-rose-800 leading-relaxed">
                Students are strictly restricted from accessing Counselor or Admin dashboards. Under MannMitra's ethical safeguards and campus privacy guidelines, peer wellbeing records and institutional triage tools are accessible solely by authenticated staff.
              </p>
            </div>
          </div>

          {/* Quick Demo Credentials Box */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-teal-600" />
                Authorized {roleName} Credentials
              </span>
              <span className="text-[11px] text-slate-500">Evaluation Mode</span>
            </div>

            {isCounselor ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <button
                  type="button"
                  onClick={() => handleQuick('counselor.sharma@campus.edu', 'counselor123')}
                  className="p-3 bg-white hover:bg-teal-50/70 hover:border-teal-400 rounded-xl border border-slate-200 shadow-2xs text-left transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-slate-800 flex items-center gap-1.5 group-hover:text-teal-800">
                      <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                      Dr. Ananya Sharma
                    </div>
                    <span className="text-[10px] text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded font-semibold">1-Click Login</span>
                  </div>
                  <div className="text-slate-500 text-[11px] mt-0.5">Lead Campus Psychologist</div>
                  <div className="mt-2 font-mono text-[11px] bg-slate-100 p-1.5 rounded-lg text-slate-700">
                    counselor.sharma@campus.edu
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuick('counselor.verma@campus.edu', 'counselor123')}
                  className="p-3 bg-white hover:bg-teal-50/70 hover:border-teal-400 rounded-xl border border-slate-200 shadow-2xs text-left transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-slate-800 flex items-center gap-1.5 group-hover:text-teal-800">
                      <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                      Dr. Rajesh Verma
                    </div>
                    <span className="text-[10px] text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded font-semibold">1-Click Login</span>
                  </div>
                  <div className="text-slate-500 text-[11px] mt-0.5">Academic Stress Counselor</div>
                  <div className="mt-2 font-mono text-[11px] bg-slate-100 p-1.5 rounded-lg text-slate-700">
                    counselor.verma@campus.edu
                  </div>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <button
                  type="button"
                  onClick={() => handleQuick('admin@campus.edu', 'admin123')}
                  className="p-3 bg-white hover:bg-slate-100 hover:border-slate-400 rounded-xl border border-slate-200 shadow-2xs text-left transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-slate-800 flex items-center gap-1.5 group-hover:text-slate-950">
                      <Building2 className="w-3.5 h-3.5 text-slate-800" />
                      Prof. Meenakshi Sundaram
                    </div>
                    <span className="text-[10px] text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded font-semibold">1-Click Login</span>
                  </div>
                  <div className="text-slate-500 text-[11px] mt-0.5">Dean of Student Affairs</div>
                  <div className="mt-2 font-mono text-[11px] bg-slate-100 p-1.5 rounded-lg text-slate-700">
                    admin@campus.edu
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuick('director@campus.edu', 'admin123')}
                  className="p-3 bg-white hover:bg-slate-100 hover:border-slate-400 rounded-xl border border-slate-200 shadow-2xs text-left transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-slate-800 flex items-center gap-1.5 group-hover:text-slate-950">
                      <Building2 className="w-3.5 h-3.5 text-slate-800" />
                      Dr. Vikram Malhotra
                    </div>
                    <span className="text-[10px] text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded font-semibold">1-Click Login</span>
                  </div>
                  <div className="text-slate-500 text-[11px] mt-0.5">Campus Director</div>
                  <div className="mt-2 font-mono text-[11px] bg-slate-100 p-1.5 rounded-lg text-slate-700">
                    director@campus.edu
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              onClick={() => onOpenLoginModal(attemptedRole)}
              className={`w-full sm:flex-1 py-3 px-4 rounded-xl text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
                isCounselor
                  ? 'bg-teal-700 hover:bg-teal-800 shadow-teal-700/20'
                  : 'bg-slate-900 hover:bg-slate-800 shadow-slate-900/20'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Authenticate as {roleName}</span>
            </button>

            <button
              onClick={onReturnToStudent}
              className="w-full sm:w-auto py-3 px-5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Student View</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
