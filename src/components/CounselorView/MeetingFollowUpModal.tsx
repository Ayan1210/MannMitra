import React, { useState } from 'react';
import { X, CheckCircle, Clock, Calendar, Shield, FileText, Check, AlertCircle } from 'lucide-react';
import { CounselorMeeting } from '../../types';

interface MeetingFollowUpModalProps {
  meeting: CounselorMeeting;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedMeeting: CounselorMeeting) => void;
}

export const MeetingFollowUpModal: React.FC<MeetingFollowUpModalProps> = ({
  meeting,
  isOpen,
  onClose,
  onSave,
}) => {
  const [status, setStatus] = useState<CounselorMeeting['status']>(meeting.status);
  const [note, setNote] = useState<string>(meeting.note || '');
  const [date, setDate] = useState<string>(meeting.date || '');
  const [time, setTime] = useState<string>(meeting.time || '');
  const [mode, setMode] = useState<'In-person' | 'Online'>(meeting.mode || 'In-person');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMsg(null);

    try {
      const updated: CounselorMeeting = {
        ...meeting,
        status,
        note: note.trim(),
        date,
        time,
        mode,
      };
      await onSave(updated);
      setSuccessMsg('Meeting status & follow-up note saved successfully!');
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err) {
      console.error('Failed to update meeting:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-teal-500/20 text-teal-200 font-mono text-[11px] uppercase tracking-wider font-bold">
                {meeting.studentCode || 'Student'}
              </span>
              <span className="text-xs text-teal-200">
                {meeting.studentName || 'Student Profile'}
              </span>
            </div>
            <h2 className="text-lg font-bold mt-1 text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-teal-300" />
              <span>Meeting Status & Clinical Follow-up</span>
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Appointment Summary Box */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs space-y-1.5">
            <div className="flex items-center justify-between font-semibold text-slate-800">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-teal-600" />
                <span>{meeting.date}</span>
              </span>
              <span className="font-mono text-slate-600 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{meeting.time}</span>
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
              <span>⏱️ {meeting.duration}</span>
              <span>📍 {meeting.mode === 'Online' ? 'Online Session' : 'In-person Office'}</span>
              <span>👤 {meeting.counselorName || 'Dr. Ananya Sharma'}</span>
            </div>
          </div>

          {/* Status Selection Buttons */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2">
              Update Meeting Status
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(
                [
                  { value: 'Scheduled', label: 'Scheduled', color: 'border-emerald-300 text-emerald-800 bg-emerald-50' },
                  { value: 'Completed', label: 'Completed', color: 'border-blue-300 text-blue-800 bg-blue-50' },
                  { value: 'Rescheduled', label: 'Rescheduled', color: 'border-amber-300 text-amber-800 bg-amber-50' },
                  { value: 'Cancelled', label: 'Cancelled', color: 'border-rose-300 text-rose-800 bg-rose-50' },
                ] as const
              ).map((st) => (
                <button
                  key={st.value}
                  type="button"
                  onClick={() => setStatus(st.value)}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                    status === st.value
                      ? `${st.color} ring-2 ring-teal-500 font-black shadow-xs`
                      : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50'
                  }`}
                >
                  {status === st.value && <Check className="w-3 h-3 inline-block mr-1" />}
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Rescheduled Date & Time Editor (if status is Rescheduled) */}
          {status === 'Rescheduled' && (
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
              <span className="text-xs font-bold text-amber-900 block">
                Adjust Rescheduled Date & Time
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-amber-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Time</label>
                  <input
                    type="text"
                    value={time}
                    placeholder="e.g. 02:30 PM"
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-amber-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Mode</label>
                  <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value as 'In-person' | 'Online')}
                    className="w-full text-xs p-2 rounded-lg border border-amber-300 bg-white"
                  >
                    <option value="In-person">In-person</option>
                    <option value="Online">Online</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Follow-up Note Section */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-800">
                {status === 'Completed'
                  ? 'Clinical Follow-up Note (Completed Meeting)'
                  : 'Counselor Follow-up / Action Note'}
              </label>
              <span className="text-[10px] font-semibold text-teal-800 flex items-center gap-1 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                <Shield className="w-3 h-3" /> Counselor-Only (Private)
              </span>
            </div>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={
                status === 'Completed'
                  ? "e.g., 'Discussed academic workload and sleep routine. Follow-up recommended next week.'"
                  : "Add notes regarding meeting progress, touchpoint plans, or cancellation reason..."
              }
              className="w-full text-xs p-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
            />
            <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
              <Shield className="w-3 h-3 text-emerald-600 inline" />
              <span>
                Students will NOT see private counselor follow-up notes or internal clinical assessments.
              </span>
            </p>
          </div>

          {/* Status Message */}
          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <span>Saving...</span>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Save Status & Follow-up Note</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
