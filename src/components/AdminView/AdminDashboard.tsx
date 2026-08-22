import React from 'react';
import {
  Building2,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  BarChart3,
  Calendar,
  AlertOctagon,
  FileCheck,
  PieChart,
  Users2,
  Lock,
} from 'lucide-react';
import { CAMPUS_COHORT_STATS } from '../../lib/mockData';

export const AdminDashboard: React.FC = () => {
  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Institutional Dean & Academic Council View</span>
              <span>•</span>
              <span>Anonymized Aggregates Only</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Campus-Wide Student Wellbeing Macro Intelligence
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Provides leadership with cohort-level workload and environment insights without compromising individual student privacy.
            </p>
          </div>

          {/* Privacy Guarantee Seal */}
          <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/20 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">
                Zero Individual Surveillance Guarantee
              </span>
              <span className="text-[10px] text-slate-300 block">
                k-Anonymity enforced (Cohort min: 10 students)
              </span>
            </div>
          </div>
        </div>

        {/* Aggregate KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800 text-white">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-xs text-slate-400 block mb-1">Total Enrolled Cohort</span>
            <span className="text-2xl font-extrabold text-white">
              {CAMPUS_COHORT_STATS.totalEnrolled}
            </span>
            <span className="text-[10px] text-emerald-400 block mt-0.5">
              {CAMPUS_COHORT_STATS.totalOptedIn} active participants (97.2%)
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-xs text-slate-400 block mb-1">Check-in Compliance Rate</span>
            <span className="text-2xl font-extrabold text-emerald-400">92.0%</span>
            <span className="text-[10px] text-slate-300 block mt-0.5">
              {CAMPUS_COHORT_STATS.activeCheckInsThisWeek} completed this cycle
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-xs text-slate-400 block mb-1">Academic Workload Index</span>
            <span className="text-2xl font-extrabold text-amber-400">3.6 / 5.0</span>
            <span className="text-[10px] text-amber-300/80 block mt-0.5">
              +18% increase due to midterm submissions
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-xs text-slate-400 block mb-1">Counselor Triage Coverage</span>
            <span className="text-2xl font-extrabold text-teal-400">100%</span>
            <span className="text-[10px] text-teal-300/80 block mt-0.5">
              All 16 flagged cohorts assigned
            </span>
          </div>
        </div>
      </div>

      {/* Main Aggregates Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Comparison (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
                <span>Departmental Stress & Wellbeing Distribution</span>
              </h2>
              <p className="text-xs text-slate-500">
                Identifies systemic curriculum bottlenecks (e.g. lab deadlines clashing with midterms)
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
              Aggregated View
            </span>
          </div>

          <div className="space-y-4">
            {CAMPUS_COHORT_STATS.departmentBreakdown.map((dept, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2"
              >
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span>{dept.name}</span>
                  <span className="text-slate-500 font-normal">
                    {dept.count} Students • Attention Rate: <span className="font-bold text-amber-700">{dept.flagRate}</span>
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden flex">
                  <div
                    style={{ width: `${(dept.avgWellbeing / 5) * 70}%` }}
                    className="h-full bg-emerald-500"
                    title="Stable"
                  />
                  <div
                    style={{ width: `${parseFloat(dept.flagRate) * 1.5}%` }}
                    className="h-full bg-amber-500"
                    title="Monitor"
                  />
                  <div
                    style={{ width: `${parseFloat(dept.flagRate)}%` }}
                    className="h-full bg-rose-500"
                    title="Check-in Recommended"
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>Cohort Average Wellbeing: <strong>{dept.avgWellbeing}/5.0</strong></span>
                  <span className="text-emerald-700 font-semibold">Institutional policy threshold met</span>
                </div>
              </div>
            ))}
          </div>

          {/* Academic Council Strategic Recommendation */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-1">
            <span className="font-bold block flex items-center gap-1.5 text-amber-900">
              <FileCheck className="w-4 h-4 text-amber-700" />
              Academic Council Actionable Insight:
            </span>
            <p className="leading-relaxed text-amber-900">
              <strong>Computer Science (1st Year)</strong> shows a 28% increase in academic workload reports during Week 3 & 4. Recommend staggering Data Structures lab assignment deadlines to prevent clustering around mid-semester evaluations.
            </p>
          </div>
        </div>

        {/* Top Factors & Privacy Architecture (1 col) */}
        <div className="space-y-6">
          {/* Top Macro Stress Factors */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <h3 className="font-bold text-base text-slate-900 mb-1 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-indigo-600" />
              <span>Primary Elevated Factors</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Self-reported primary challenge themes
            </p>

            <div className="space-y-3">
              {CAMPUS_COHORT_STATS.topElevatedFactors.map((factor, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">{factor.factor}</span>
                    <span className="font-bold text-slate-900">{factor.percentage}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${factor.percentage}%` }}
                      className={`h-full rounded-full ${
                        idx === 0
                          ? 'bg-amber-500'
                          : idx === 1
                          ? 'bg-indigo-500'
                          : idx === 2
                          ? 'bg-purple-500'
                          : 'bg-teal-500'
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Privacy Architecture Box */}
          <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>WHO Guideline Compliance</span>
            </div>
            <h4 className="font-bold text-base text-white">Why MannMitra is Not Surveillance</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              In accordance with WHO ethical digital health frameworks, individual student names and raw journal reflections are strictly segregated from administration.
            </p>
            <ul className="text-xs text-slate-300 space-y-1.5 pt-1">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>No student disciplinary or academic punitive use</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Zero individual student identification in Dean portal</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Explicit student opt-in and consent revocation</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
