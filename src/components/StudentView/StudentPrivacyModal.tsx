import React, { useState } from 'react';
import { X, ShieldCheck, Lock, Eye, Download, AlertCircle, Check } from 'lucide-react';
import { StudentProfile } from '../../types';

interface StudentPrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentProfile;
  onUpdateConsent: (newConsent: StudentProfile['consent']) => void;
}

export const StudentPrivacyModal: React.FC<StudentPrivacyModalProps> = ({
  isOpen,
  onClose,
  student,
  onUpdateConsent,
}) => {
  const [consent, setConsent] = useState(student.consent);
  const [savedMessage, setSavedMessage] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onUpdateConsent(consent);
    setSavedMessage(true);
    setTimeout(() => {
      setSavedMessage(false);
      onClose();
    }, 800);
  };

  const handleExportData = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(student, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `mannmitra-data-${student.anonymousCode}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-6">
        {/* Header */}
        <div className="bg-slate-900 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Privacy Vault & Consent Control</span>
          </div>
          <h2 className="text-xl font-bold mt-1 text-white">MannMitra is NOT Surveillance</h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-1">
            You own 100% of your wellbeing data. We segregate access to prevent administrative overreach.
          </p>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Data Segregation Matrix */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-emerald-600" />
              Who Sees What? (Role-Based Data Partitioning)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="font-bold text-emerald-700 block mb-1">🎓 Student (You)</span>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Full access to raw personal notes, all weekly scores, timeline graphs, and full consent revocation.
                </p>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="font-bold text-teal-700 block mb-1">🧑‍⚕️ Campus Counselor</span>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Only sees computed trend indicators (e.g. "Academic stress ↑, Sleep ↓") to offer supportive 1-on-1 check-ins.
                </p>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="font-bold text-slate-700 block mb-1">🏛️ College Administration</span>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Only sees anonymized campus aggregates (e.g., "28% of 1st years reported heavy workload"). Zero individual identity.
                </p>
              </div>
            </div>
          </div>

          {/* Granular Consent Checkboxes */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Your Granular Preferences
            </h3>

            <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={consent.optedIn}
                onChange={(e) => setConsent({ ...consent, optedIn: e.target.checked })}
                className="mt-1 h-4 w-4 rounded-sm text-emerald-600 focus:ring-emerald-500 border-slate-300"
              />
              <div>
                <span className="text-xs sm:text-sm font-semibold text-slate-800 block">
                  Participate in MannMitra Wellbeing Check-ins
                </span>
                <span className="text-xs text-slate-500 block">
                  Enables weekly check-ins and personal wellbeing trend tracking.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={consent.shareIndicatorsWithCounselor}
                onChange={(e) =>
                  setConsent({ ...consent, shareIndicatorsWithCounselor: e.target.checked })
                }
                className="mt-1 h-4 w-4 rounded-sm text-emerald-600 focus:ring-emerald-500 border-slate-300"
              />
              <div>
                <span className="text-xs sm:text-sm font-semibold text-slate-800 block">
                  Share early-warning pattern shifts with Campus Counselor
                </span>
                <span className="text-xs text-slate-500 block">
                  Allows Dr. Ananya Sharma to reach out with gentle check-ins when sustained stress is detected.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={consent.allowAggregatedAdminStats}
                onChange={(e) =>
                  setConsent({ ...consent, allowAggregatedAdminStats: e.target.checked })
                }
                className="mt-1 h-4 w-4 rounded-sm text-emerald-600 focus:ring-emerald-500 border-slate-300"
              />
              <div>
                <span className="text-xs sm:text-sm font-semibold text-slate-800 block">
                  Contribute anonymized cohort statistics for institutional policy improvements
                </span>
                <span className="text-xs text-slate-500 block">
                  Used by academic council to evaluate exam schedules and reduce overall academic burnout.
                </span>
              </div>
            </label>
          </div>

          {/* Export & Audit */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200">
            <button
              type="button"
              onClick={handleExportData}
              className="text-xs font-semibold text-slate-700 hover:text-emerald-700 flex items-center gap-1.5 p-2 rounded-lg hover:bg-slate-100"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Export My Complete Data (JSON)</span>
            </button>

            <span className="text-[11px] text-slate-400">
              Last consent update: {student.consent.consentDate}
            </span>
          </div>

          {/* Save Action */}
          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2.5 text-xs sm:text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              {savedMessage ? <Check className="w-4 h-4 text-emerald-400" /> : <Lock className="w-4 h-4" />}
              <span>{savedMessage ? 'Preferences Updated!' : 'Save Privacy Preferences'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
