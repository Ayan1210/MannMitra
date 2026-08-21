import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Calendar,
  Clock,
  ShieldCheck,
  Brain,
  MessageSquare,
  Send,
  CheckCircle,
  FileText,
  UserCheck,
  RefreshCw,
  Info,
  BookOpen,
} from 'lucide-react';
import { StudentProfile, AISummaryResponse, CounselorAction } from '../../types';
import { analyzeWellbeingPattern, calculateCompositeScore } from '../../lib/patternEngine';
import { generateCounselorAISummary } from '../../lib/geminiSummary';

interface StudentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentProfile;
  onLogAction: (action: Omit<CounselorAction, 'id' | 'timestamp'>) => void;
  pastActions: CounselorAction[];
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  isOpen,
  onClose,
  student,
  onLogAction,
  pastActions,
}) => {
  const [activeTab, setActiveTab] = useState<'trends' | 'ai_briefing' | 'action_log'>('trends');
  const [aiSummary, setAiSummary] = useState<AISummaryResponse | null>(null);
  const [loadingAi, setLoadingAi] = useState<boolean>(false);
  const [actionType, setActionType] = useState<CounselorAction['actionType']>('checkin_scheduled');
  const [actionNote, setActionNote] = useState<string>('');
  const [actionSuccess, setActionSuccess] = useState<boolean>(false);

  const analysis = analyzeWellbeingPattern(student.checkIns);
  const checkIns = student.checkIns;

  // Load AI Summary on opening or when student changes
  useEffect(() => {
    if (isOpen && student) {
      setLoadingAi(true);
      generateCounselorAISummary(student).then((res) => {
        setAiSummary(res);
        setLoadingAi(false);
      });
    }
  }, [isOpen, student.id, student.checkIns.length]);

  if (!isOpen) return null;

  const handleRefreshAi = () => {
    setLoadingAi(true);
    generateCounselorAISummary(student).then((res) => {
      setAiSummary(res);
      setLoadingAi(false);
    });
  };

  const handleSubmitAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionNote.trim()) return;

    onLogAction({
      studentId: student.id,
      studentCode: student.anonymousCode,
      counselorName: 'Dr. Ananya Sharma',
      actionType,
      note: actionNote.trim(),
      status: 'completed',
    });

    setActionSuccess(true);
    setActionNote('');
    setTimeout(() => {
      setActionSuccess(false);
    }, 2000);
  };

  // Dimensions chart helper
  const maxWeeks = checkIns.length;
  const chartHeight = 180;
  const chartWidth = 560;
  const paddingX = 40;
  const paddingY = 25;

  const getPoints = (accessor: (c: typeof checkIns[0]) => number) => {
    return checkIns.map((ck, i) => {
      const x = paddingX + (i / Math.max(1, maxWeeks - 1)) * (chartWidth - paddingX * 2);
      const val = accessor(ck);
      const y = chartHeight - paddingY - ((val - 1) / 4) * (chartHeight - paddingY * 2);
      return { x, y, val, week: ck.weekNumber, date: ck.date };
    });
  };

  const wellbeingPts = getPoints((c) => c.overallWellbeing);
  const stressPts = getPoints((c) => c.academicStress);
  const sleepPts = getPoints((c) => c.sleepQuality);

  const makePath = (pts: typeof wellbeingPts) =>
    pts.reduce((acc, curr, idx) => (idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`), '');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-6 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 p-6 text-white relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src={student.avatar}
                alt={student.name}
                className="w-12 h-12 rounded-xl object-cover border border-slate-700"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white">{student.name}</h2>
                  <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                    {student.anonymousCode}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  {student.department} • {student.year}
                </p>
              </div>
            </div>

            {/* Status Pills */}
            <div className="flex items-center gap-2">
              {analysis.status === 'check_in_recommended' && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                  Check-in Recommended
                </span>
              )}
              {analysis.status === 'monitor' && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  🟡 Monitor
                </span>
              )}
              {analysis.status === 'stable' && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  🟢 Stable
                </span>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-6 border-b border-slate-800 -mb-6 pb-2 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('trends')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'trends'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <TrendingDown className="w-4 h-4" />
              <span>Multi-Week Indicators & Rationale</span>
            </button>
            <button
              onClick={() => setActiveTab('ai_briefing')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'ai_briefing'
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>AI Counselor Synthesis</span>
            </button>
            <button
              onClick={() => setActiveTab('action_log')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'action_log'
                  ? 'bg-teal-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Counselor Actions ({pastActions.length})</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50">
          {/* TAB 1: Longitudinal Trends & Pattern Engine Explanation */}
          {activeTab === 'trends' && (
            <div className="space-y-6">
              {/* Pattern Engine Deterministic Audit Box */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                      <Brain className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">
                        Deterministic Pattern Engine Audit
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Transparent, rule-based algorithmic flags (Not a black-box diagnosis)
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-slate-100 text-slate-800">
                    Index: {analysis.computedScore}/100
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 leading-relaxed mb-3">
                  <p className="font-semibold text-slate-900 mb-1">
                    Pattern Assessment:
                  </p>
                  {analysis.explanation}
                </div>

                {/* Triggered Rules List */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Rule Triggers Evaluated:
                  </span>
                  {analysis.ruleTriggers.length > 0 ? (
                    analysis.ruleTriggers.map((rule, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-xs text-amber-900 bg-amber-50/80 border border-amber-200/70 px-3 py-1.5 rounded-lg"
                      >
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span className="font-mono text-[11px] font-medium">{rule}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                      No adverse pattern triggers active. Student wellbeing baseline is stable.
                    </div>
                  )}
                </div>
              </div>

              {/* Multi-Week Dimension Comparison Chart */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">
                      4-Week Dimension Trajectory (Overlay)
                    </h3>
                    <p className="text-xs text-slate-500">
                      Notice the divergence between rising academic pressure and falling sleep/mood
                    </p>
                  </div>
                  {/* Legend */}
                  <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" /> Mood
                    </span>
                    <span className="flex items-center gap-1 text-amber-700 font-semibold">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Workload Stress
                    </span>
                    <span className="flex items-center gap-1 text-indigo-700 font-semibold">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" /> Sleep Quality
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <svg
                    viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                    className="w-full h-44 overflow-visible"
                  >
                    {/* Horizontal Scale Grid (1-5) */}
                    {[1, 2, 3, 4, 5].map((lvl) => {
                      const y =
                        chartHeight - paddingY - ((lvl - 1) / 4) * (chartHeight - paddingY * 2);
                      return (
                        <g key={lvl}>
                          <line
                            x1={paddingX - 10}
                            y1={y}
                            x2={chartWidth - paddingX + 10}
                            y2={y}
                            stroke="#e2e8f0"
                            strokeDasharray="4 4"
                            strokeWidth="1"
                          />
                          <text
                            x={paddingX - 22}
                            y={y + 3}
                            fontSize="10"
                            fill="#94a3b8"
                            textAnchor="middle"
                            fontWeight="bold"
                          >
                            {lvl}
                          </text>
                        </g>
                      );
                    })}

                    {/* Mood Line */}
                    <path
                      d={makePath(wellbeingPts)}
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    {wellbeingPts.map((p, i) => (
                      <circle
                        key={`m-${i}`}
                        cx={p.x}
                        cy={p.y}
                        r="4.5"
                        className="fill-emerald-600 stroke-white stroke-2"
                      />
                    ))}

                    {/* Stress Line */}
                    <path
                      d={makePath(stressPts)}
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="3"
                      strokeDasharray="5 3"
                      strokeLinecap="round"
                    />
                    {stressPts.map((p, i) => (
                      <circle
                        key={`s-${i}`}
                        cx={p.x}
                        cy={p.y}
                        r="4.5"
                        className="fill-amber-500 stroke-white stroke-2"
                      />
                    ))}

                    {/* Sleep Line */}
                    <path
                      d={makePath(sleepPts)}
                      fill="none"
                      stroke="#6366f1"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    {sleepPts.map((p, i) => (
                      <circle
                        key={`sl-${i}`}
                        cx={p.x}
                        cy={p.y}
                        r="4"
                        className="fill-indigo-600 stroke-white stroke-2"
                      />
                    ))}

                    {/* X-axis labels */}
                    {wellbeingPts.map((p, i) => (
                      <text
                        key={`lbl-${i}`}
                        x={p.x}
                        y={chartHeight - 6}
                        fontSize="11"
                        fill="#64748b"
                        textAnchor="middle"
                        fontWeight="600"
                      >
                        Week {p.week}
                      </text>
                    ))}
                  </svg>
                </div>
              </div>

              {/* Longitudinal Table Breakdown */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
                <h3 className="font-bold text-sm text-slate-900 mb-3">
                  Longitudinal Self-Report Submissions
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 text-slate-700 uppercase font-semibold">
                      <tr>
                        <th className="p-2.5 rounded-l-lg">Week</th>
                        <th className="p-2.5">Date</th>
                        <th className="p-2.5 text-center">Mood</th>
                        <th className="p-2.5 text-center">Academic Stress</th>
                        <th className="p-2.5 text-center">Sleep</th>
                        <th className="p-2.5 text-center">Energy</th>
                        <th className="p-2.5 text-center">Social</th>
                        <th className="p-2.5 text-center">Focus</th>
                        <th className="p-2.5 rounded-r-lg">Context Reflection</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {checkIns.map((ck) => (
                        <tr key={ck.id} className="hover:bg-slate-50">
                          <td className="p-2.5 font-bold text-slate-800">Week {ck.weekNumber}</td>
                          <td className="p-2.5 text-slate-500 font-mono">{ck.date}</td>
                          <td className="p-2.5 text-center font-bold text-emerald-700">
                            {ck.overallWellbeing}/5
                          </td>
                          <td className="p-2.5 text-center font-bold text-amber-700">
                            {ck.academicStress}/5
                          </td>
                          <td className="p-2.5 text-center text-slate-700">{ck.sleepQuality}/5</td>
                          <td className="p-2.5 text-center text-slate-700">{ck.energyLevel}/5</td>
                          <td className="p-2.5 text-center text-slate-700">{ck.socialConnection}/5</td>
                          <td className="p-2.5 text-center text-slate-700">{ck.concentration}/5</td>
                          <td className="p-2.5 text-slate-600 max-w-xs truncate italic">
                            {ck.isPrivateNote
                              ? '[Student marked reflection private]'
                              : ck.personalReflection || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AI Counselor Briefing */}
          {activeTab === 'ai_briefing' && (
            <div className="space-y-6">
              {/* Mandatory Ethical Disclaimer Banner */}
              <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-start gap-3">
                <Info className="w-5 h-5 text-indigo-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-950">
                    WHO & Ethical AI Safeguard Standard
                  </h4>
                  <p className="text-xs text-indigo-900 mt-0.5">
                    {aiSummary?.disclaimer ||
                      'AI-generated assistant briefing for counselor clinical review only. This is an early-warning communication aid, NOT a medical or psychiatric diagnosis.'}
                  </p>
                </div>
              </div>

              {/* AI Briefing Card */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-purple-100 text-purple-800">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-slate-900">
                        AI Clinical Assistant Synthesis
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Synthesizing longitudinal trajectories to save counselor prep time
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleRefreshAi}
                    disabled={loadingAi}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingAi ? 'animate-spin' : ''}`} />
                    <span>{loadingAi ? 'Synthesizing...' : 'Regenerate'}</span>
                  </button>
                </div>

                {loadingAi ? (
                  <div className="py-12 text-center text-slate-500 space-y-2">
                    <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-xs font-medium">
                      Synthesizing multi-week patterns and generating conversation openers...
                    </p>
                  </div>
                ) : aiSummary ? (
                  <div className="space-y-5">
                    {/* Executive Summary */}
                    <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-100 text-xs text-purple-950 leading-relaxed font-medium">
                      {aiSummary.summary}
                    </div>

                    {/* Key Observations */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                        Key Behavioral & Indicator Observations:
                      </h4>
                      <div className="space-y-2">
                        {aiSummary.keyObservations.map((obs, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-start gap-2"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-1.5 shrink-0" />
                            <span>{obs}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Suggested Conversation Openers */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                        Recommended Gentle Conversation Openers (Non-threatening):
                      </h4>
                      <div className="space-y-2">
                        {aiSummary.suggestedOpeners.map((opener, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100 text-xs text-emerald-950 italic flex items-start gap-2.5"
                          >
                            <MessageSquare className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5 not-italic" />
                            <span>{opener}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          )}

          {/* TAB 3: Action Log & Follow-up Scheduler */}
          {activeTab === 'action_log' && (
            <div className="space-y-6">
              {/* Action Creator Form */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
                <h3 className="font-bold text-sm text-slate-900 mb-3 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-teal-600" />
                  <span>Log Counselor Touchpoint / Action</span>
                </h3>

                <form onSubmit={handleSubmitAction} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Action Type
                      </label>
                      <select
                        value={actionType}
                        onChange={(e) =>
                          setActionType(e.target.value as CounselorAction['actionType'])
                        }
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="checkin_scheduled">Schedule 1-on-1 Gentle Check-in</option>
                        <option value="touchpoint_logged">Log Completed Office Hour Visit</option>
                        <option value="wellness_resource">Share Academic Pacing / Sleep Guide</option>
                        <option value="peer_support">Connect with Peer Support Mentor</option>
                        <option value="status_override">Mark Reviewed / Dismiss Alert</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Counselor In Charge
                      </label>
                      <input
                        type="text"
                        disabled
                        value="Dr. Ananya Sharma (Lead Wellbeing Officer)"
                        className="w-full text-xs p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Clinical Notes & Follow-up Plan
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={actionNote}
                      onChange={(e) => setActionNote(e.target.value)}
                      placeholder="e.g., 'Met with Aarav for 20 mins. We discussed restructuring his lab submission timetable and scheduled a relaxing breathing session. Will review next week.'..."
                      className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    {actionSuccess && (
                      <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" /> Touchpoint logged successfully!
                      </span>
                    )}
                    <div className="ml-auto">
                      <button
                        type="submit"
                        className="px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Log Action</span>
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* Past Action Timeline */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
                <h3 className="font-bold text-sm text-slate-900 mb-3">
                  Historical Counselor Touchpoints
                </h3>
                {pastActions.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">
                    No touchpoints recorded yet for this student.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {pastActions.map((act) => (
                      <div
                        key={act.id}
                        className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between font-semibold">
                          <span className="text-teal-900 capitalize">
                            📌 {act.actionType.replace('_', ' ')}
                          </span>
                          <span className="text-slate-400 font-mono text-[11px]">
                            {act.timestamp}
                          </span>
                        </div>
                        <p className="text-slate-700">{act.note}</p>
                        <span className="text-[10px] text-slate-400 block pt-1">
                          Logged by {act.counselorName}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500">
            Student consent status: <span className="text-emerald-700 font-semibold">Opted-in</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};
