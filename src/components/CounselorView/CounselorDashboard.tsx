import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  TrendingDown,
  TrendingUp,
  Minus,
  AlertCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  SlidersHorizontal,
  ChevronDown,
  PlusCircle,
} from 'lucide-react';
import { StudentProfile, CounselorAction, WellBeingStatus } from '../../types';
import { analyzeWellbeingPattern, calculateCompositeScore } from '../../lib/patternEngine';
import { StudentDetailModal } from './StudentDetailModal';
import { CAMPUS_COHORT_STATS } from '../../lib/mockData';

interface CounselorDashboardProps {
  students: StudentProfile[];
  counselorActions: CounselorAction[];
  onLogAction: (action: Omit<CounselorAction, 'id' | 'timestamp'>) => void;
  onSimulateCheckIn: (studentId: string, customCheckIn: any) => void;
}

export const CounselorDashboard: React.FC<CounselorDashboardProps> = ({
  students,
  counselorActions,
  onLogAction,
  onSimulateCheckIn,
}) => {
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | WellBeingStatus>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [showSimModal, setShowSimModal] = useState<boolean>(false);

  // Filter logic
  const filteredStudents = students.filter((s) => {
    const analysis = analyzeWellbeingPattern(s.checkIns);

    // Status filter
    if (statusFilter !== 'all' && analysis.status !== statusFilter) {
      return false;
    }

    // Dept filter
    if (deptFilter !== 'all' && !s.department.toLowerCase().includes(deptFilter.toLowerCase())) {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchCode = s.anonymousCode.toLowerCase().includes(q);
      const matchName = s.name.toLowerCase().includes(q);
      const matchDept = s.department.toLowerCase().includes(q);
      return matchCode || matchName || matchDept;
    }

    return true;
  });

  // Calculate quick summary metrics
  const analyzedList = students.map((s) => ({
    student: s,
    analysis: analyzeWellbeingPattern(s.checkIns),
  }));

  const checkInRecommendedCount = analyzedList.filter(
    (a) => a.analysis.status === 'check_in_recommended'
  ).length;
  const monitorCount = analyzedList.filter((a) => a.analysis.status === 'monitor').length;
  const stableCount = analyzedList.filter((a) => a.analysis.status === 'stable').length;

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-teal-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Counselor Clinical Support Triage</span>
              <span>•</span>
              <span>Dr. Ananya Sharma</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Student Wellbeing Early-Warning Triage
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Identifies multi-week longitudinal wellbeing shifts and workload pressures. Zero diagnostic claims; pure decision-support for timely check-ins.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSimModal(true)}
              className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs sm:text-sm font-bold shadow-md transition-all flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              <span>Simulate New Check-in</span>
            </button>
          </div>
        </div>

        {/* High-Level Counters Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800 text-white">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-xs text-slate-400 block mb-1">Total Active Enrolled</span>
            <span className="text-2xl font-extrabold text-white">
              {CAMPUS_COHORT_STATS.totalEnrolled}
            </span>
            <span className="text-[10px] text-emerald-400 block mt-0.5">
              97.2% consent opt-in rate
            </span>
          </div>

          <button
            onClick={() => setStatusFilter('check_in_recommended')}
            className={`p-4 rounded-2xl border text-left transition-all ${
              statusFilter === 'check_in_recommended'
                ? 'bg-rose-500/20 border-rose-500'
                : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
          >
            <span className="text-xs text-rose-300 block mb-1 flex items-center justify-between">
              <span>Check-in Recommended</span>
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            </span>
            <span className="text-2xl font-extrabold text-rose-400">
              {CAMPUS_COHORT_STATS.statusBreakdown.checkInRecommended}
            </span>
            <span className="text-[10px] text-rose-300/80 block mt-0.5">
              Multi-week decline or overload
            </span>
          </button>

          <button
            onClick={() => setStatusFilter('monitor')}
            className={`p-4 rounded-2xl border text-left transition-all ${
              statusFilter === 'monitor'
                ? 'bg-amber-500/20 border-amber-500'
                : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
          >
            <span className="text-xs text-amber-300 block mb-1">🟡 Active Watchlist</span>
            <span className="text-2xl font-extrabold text-amber-400">
              {CAMPUS_COHORT_STATS.statusBreakdown.monitor}
            </span>
            <span className="text-[10px] text-amber-300/80 block mt-0.5">
              Single-indicator shifts
            </span>
          </button>

          <button
            onClick={() => setStatusFilter('stable')}
            className={`p-4 rounded-2xl border text-left transition-all ${
              statusFilter === 'stable'
                ? 'bg-emerald-500/20 border-emerald-500'
                : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
          >
            <span className="text-xs text-emerald-300 block mb-1">🟢 Stable Rhythm</span>
            <span className="text-2xl font-extrabold text-emerald-400">
              {CAMPUS_COHORT_STATS.statusBreakdown.stable}
            </span>
            <span className="text-[10px] text-emerald-300/80 block mt-0.5">
              Consistent healthy baselines
            </span>
          </button>
        </div>
      </div>

      {/* Roster & Filters Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-teal-600" />
              <span>Student Wellbeing Roster & Longitudinal Trajectories</span>
            </h2>
            <p className="text-xs text-slate-500">
              Prioritized by consecutive decline trends and academic pressure divergences
            </p>
          </div>

          {/* Search and Filters Bar */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search STU code or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-hidden w-48 sm:w-56"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="text-xs py-2 px-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-hidden bg-white text-slate-700"
            >
              <option value="all">All Statuses</option>
              <option value="check_in_recommended">🔴 Check-in Recommended</option>
              <option value="monitor">🟡 Monitor</option>
              <option value="stable">🟢 Stable</option>
            </select>

            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="text-xs py-2 px-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-hidden bg-white text-slate-700"
            >
              <option value="all">All Departments</option>
              <option value="computer">Computer Science & BCA</option>
              <option value="management">MBA / Commerce</option>
              <option value="design">Design</option>
              <option value="engineering">Engineering</option>
            </select>
          </div>
        </div>

        {/* Student Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100/80 text-slate-700 uppercase font-bold text-[11px] border-b border-slate-200">
              <tr>
                <th className="p-3.5">Student Code</th>
                <th className="p-3.5">Student Name & Dept</th>
                <th className="p-3.5 text-center">Trend</th>
                <th className="p-3.5">Decline Streak</th>
                <th className="p-3.5">Main Pattern Driver</th>
                <th className="p-3.5 text-center">Composite Score</th>
                <th className="p-3.5 text-center">Triage Status</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((st) => {
                const analysis = analyzeWellbeingPattern(st.checkIns);
                const hasRecentAction = counselorActions.some(
                  (a) => a.studentId === st.id
                );

                return (
                  <tr
                    key={st.id}
                    onClick={() => setSelectedStudent(st)}
                    className="hover:bg-teal-50/40 cursor-pointer transition-colors"
                  >
                    {/* Student Code */}
                    <td className="p-3.5">
                      <span className="font-mono font-bold text-slate-800 px-2 py-1 bg-slate-100 rounded-md border border-slate-200">
                        {st.anonymousCode}
                      </span>
                    </td>

                    {/* Name & Dept */}
                    <td className="p-3.5">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={st.avatar}
                          alt={st.name}
                          className="w-8 h-8 rounded-lg object-cover"
                        />
                        <div>
                          <span className="font-bold text-slate-900 block">{st.name}</span>
                          <span className="text-[10px] text-slate-500 block truncate max-w-xs">
                            {st.department} • {st.year}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Trend */}
                    <td className="p-3.5 text-center">
                      {analysis.trend === 'declining' && (
                        <span className="inline-flex items-center gap-1 text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded-md">
                          <TrendingDown className="w-3.5 h-3.5" />
                          <span>Down</span>
                        </span>
                      )}
                      {analysis.trend === 'improving' && (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                          <TrendingUp className="w-3.5 h-3.5" />
                          <span>Up</span>
                        </span>
                      )}
                      {analysis.trend === 'stable' && (
                        <span className="inline-flex items-center gap-1 text-slate-600 font-medium bg-slate-100 px-2 py-0.5 rounded-md">
                          <Minus className="w-3.5 h-3.5" />
                          <span>Stable</span>
                        </span>
                      )}
                    </td>

                    {/* Decline Streak */}
                    <td className="p-3.5 font-medium">
                      {analysis.consecutiveDeclines > 0 ? (
                        <span className="text-amber-900 font-semibold px-2 py-0.5 bg-amber-50 rounded-md border border-amber-200">
                          {analysis.consecutiveDeclines} weeks ↓
                        </span>
                      ) : (
                        <span className="text-slate-400">0 weeks</span>
                      )}
                    </td>

                    {/* Main Driver */}
                    <td className="p-3.5">
                      <span className="font-medium text-slate-800">
                        {analysis.primaryDrivers[0] || 'Routine baseline'}
                      </span>
                    </td>

                    {/* Composite Score */}
                    <td className="p-3.5 text-center">
                      <span className="font-mono font-bold text-slate-800">
                        {analysis.computedScore}/100
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="p-3.5 text-center">
                      {analysis.status === 'check_in_recommended' && (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-900 border border-rose-200">
                          Check-in Rec.
                        </span>
                      )}
                      {analysis.status === 'monitor' && (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                          Monitor
                        </span>
                      )}
                      {analysis.status === 'stable' && (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
                          Stable
                        </span>
                      )}
                    </td>

                    {/* Action Button */}
                    <td className="p-3.5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedStudent(st);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-2xs transition-colors"
                      >
                        {hasRecentAction ? 'View Notes' : 'Review & Action'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Detail Modal */}
      {selectedStudent && (
        <StudentDetailModal
          isOpen={!!selectedStudent}
          onClose={() => setSelectedStudent(null)}
          student={selectedStudent}
          onLogAction={onLogAction}
          pastActions={counselorActions.filter((a) => a.studentId === selectedStudent.id)}
        />
      )}

      {/* Sandbox Simulation Modal */}
      {showSimModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Deterministic Engine Live Sandbox
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Test how the pattern engine responds dynamically to new simulated student check-in answers without affecting production data.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Student to Simulate
                </label>
                <select
                  id="simStudentSelect"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                  defaultValue="stu-1024"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.anonymousCode}) - Current: {s.checkIns.length} check-ins
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    const sel = (document.getElementById('simStudentSelect') as HTMLSelectElement)
                      ?.value;
                    onSimulateCheckIn(sel || 'stu-1024', {
                      overallWellbeing: 1,
                      academicStress: 5,
                      sleepQuality: 1,
                      energyLevel: 1,
                      socialConnection: 2,
                      concentration: 1,
                      primaryTag: 'Exams',
                      personalReflection:
                        'Simulated severe exam stress with all-nighters. Flag should spike to Check-in Recommended.',
                    });
                    setShowSimModal(false);
                  }}
                  className="p-3 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-left transition-colors"
                >
                  <span className="font-bold text-xs text-rose-900 block">
                    ⚡ High Stress / Drop
                  </span>
                  <span className="text-[11px] text-rose-700 block mt-0.5">
                    Mood 1/5, Stress 5/5, Sleep 1/5
                  </span>
                </button>

                <button
                  onClick={() => {
                    const sel = (document.getElementById('simStudentSelect') as HTMLSelectElement)
                      ?.value;
                    onSimulateCheckIn(sel || 'stu-1024', {
                      overallWellbeing: 5,
                      academicStress: 2,
                      sleepQuality: 5,
                      energyLevel: 4,
                      socialConnection: 5,
                      concentration: 4,
                      primaryTag: 'Routine',
                      personalReflection:
                        'Simulated post-counseling recovery check-in with healthy balance and rest.',
                    });
                    setShowSimModal(false);
                  }}
                  className="p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-left transition-colors"
                >
                  <span className="font-bold text-xs text-emerald-900 block">
                    🌱 Recovery / High Balance
                  </span>
                  <span className="text-[11px] text-emerald-700 block mt-0.5">
                    Mood 5/5, Stress 2/5, Sleep 5/5
                  </span>
                </button>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setShowSimModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Close Sandbox
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
