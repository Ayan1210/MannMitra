import React, { useState, useEffect, useRef } from 'react';
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
  Shield,
  ShieldCheck,
  Zap,
  SlidersHorizontal,
  ChevronDown,
  PlusCircle,
  Bell,
  BellRing,
  Check,
  CheckCheck,
  ExternalLink,
} from 'lucide-react';
import { StudentProfile, CounselorAction, WellBeingStatus, CounselorNotification, CounselorMeeting } from '../../types';
import { analyzeWellbeingPattern, calculateCompositeScore } from '../../lib/patternEngine';
import { StudentDetailModal } from './StudentDetailModal';
import { MeetingFollowUpModal } from './MeetingFollowUpModal';
import { CAMPUS_COHORT_STATS } from '../../lib/mockData';
import {
  fetchCounselorNotifications,
  markCounselorNotificationRead,
  markAllCounselorNotificationsRead,
  fetchCounselorMeetings,
  updateCounselorMeeting,
} from '../../lib/api';

function formatRelativeTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (diffSec < 60) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDays = Math.floor(diffHr / 24);
    return `${diffDays}d ago`;
  } catch {
    return 'Recent';
  }
}

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
  const [notifications, setNotifications] = useState<CounselorNotification[]>([]);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState<boolean>(false);
  const [meetings, setMeetings] = useState<CounselorMeeting[]>([]);
  const [meetingFilter, setMeetingFilter] = useState<'All' | 'Scheduled' | 'Completed' | 'Rescheduled' | 'Cancelled'>('All');
  const [editingMeeting, setEditingMeeting] = useState<CounselorMeeting | null>(null);
  const notificationDropdownRef = useRef<HTMLDivElement>(null);

  // Load counselor notifications & meetings
  useEffect(() => {
    async function loadDashboardData() {
      try {
        const notifData = await fetchCounselorNotifications();
        if (notifData && Array.isArray(notifData)) {
          setNotifications(notifData);
        }
      } catch (err) {
        console.warn('Could not load counselor notifications:', err);
      }

      try {
        const meetsData = await fetchCounselorMeetings();
        if (meetsData && Array.isArray(meetsData)) {
          setMeetings(meetsData);
        }
      } catch (err) {
        console.warn('Could not load counselor meetings:', err);
      }
    }
    loadDashboardData();
  }, [students]);

  const handleMeetingStatusChange = async (
    id: string,
    newStatus: 'Scheduled' | 'Completed' | 'Rescheduled' | 'Cancelled'
  ) => {
    const targetMeet = meetings.find((m) => m.id === id);
    if (newStatus === 'Completed' && targetMeet) {
      // Prompt modal to allow adding a clinical follow-up note
      setEditingMeeting({ ...targetMeet, status: 'Completed' });
      return;
    }

    setMeetings((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: newStatus } : m))
    );
    try {
      await updateCounselorMeeting(id, { status: newStatus });
    } catch (err) {
      console.warn('Could not update meeting status:', err);
    }
  };

  const handleMeetingSaved = async (updated: CounselorMeeting) => {
    setMeetings((prev) =>
      prev.map((m) => (m.id === updated.id ? updated : m))
    );
    try {
      await updateCounselorMeeting(updated.id, {
        status: updated.status,
        note: updated.note,
        date: updated.date,
        time: updated.time,
        duration: updated.duration,
        mode: updated.mode,
      });
    } catch (err) {
      console.warn('Could not persist updated meeting:', err);
    }
  };

  const handleMeetingAdded = (newMeeting: CounselorMeeting) => {
    setMeetings((prev) => [newMeeting, ...prev.filter((m) => m.id !== newMeeting.id)]);
  };

  // Close notifications dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notificationDropdownRef.current &&
        !notificationDropdownRef.current.contains(event.target as Node)
      ) {
        setShowNotificationsDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleNotificationClick = async (notif: CounselorNotification) => {
    // Mark as read locally and via API
    if (!notif.isRead) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
      );
      try {
        await markCounselorNotificationRead(notif.id);
      } catch (err) {
        console.warn('Could not mark notification as read:', err);
      }
    }

    // Find and open relevant student detail view
    const targetStudent = students.find(
      (s) => s.id === notif.studentId || (notif.studentCode && s.anonymousCode === notif.studentCode)
    );

    if (targetStudent) {
      setSelectedStudent(targetStudent);
      setShowNotificationsDropdown(false);
    }
  };

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      await markAllCounselorNotificationsRead();
    } catch (err) {
      console.warn('Could not mark all as read:', err);
    }
  };

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
            {/* Counselor Notifications Bell & Dropdown */}
            <div className="relative" ref={notificationDropdownRef}>
              <button
                onClick={() => setShowNotificationsDropdown((prev) => !prev)}
                className={`relative px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
                  unreadCount > 0
                    ? 'bg-slate-800 border-rose-500/60 text-white hover:bg-slate-700/80 shadow-md'
                    : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700/60'
                }`}
                title="Counselor Triage Notifications"
                aria-label="Counselor Triage Notifications"
              >
                {unreadCount > 0 ? (
                  <BellRing className="w-4 h-4 text-rose-400 animate-pulse" />
                ) : (
                  <Bell className="w-4 h-4 text-slate-300" />
                )}
                <span className="hidden sm:inline">Notifications</span>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-extrabold tracking-wide">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown Popover */}
              {showNotificationsDropdown && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden z-50 text-slate-900 animate-in fade-in zoom-in-95 duration-150">
                  <div className="p-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs sm:text-sm text-slate-800">
                        Counselor Notifications
                      </span>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold text-[10px]">
                          {unreadCount} unread
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[11px] font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1 transition-colors"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>Mark all read</span>
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-500">
                        No notifications yet. Student wellbeing updates requiring counselor review will appear here.
                      </div>
                    ) : (
                      notifications.map((n) => {
                        const targetStudent = students.find(
                          (s) => s.id === n.studentId || (n.studentCode && s.anonymousCode === n.studentCode)
                        );
                        return (
                          <div
                            key={n.id}
                            onClick={() => handleNotificationClick(n)}
                            className={`p-3.5 hover:bg-slate-50 cursor-pointer transition-colors flex items-start gap-3 text-left ${
                              !n.isRead ? 'bg-rose-50/40' : ''
                            }`}
                          >
                            <div className="pt-1">
                              {!n.isRead ? (
                                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 block ring-4 ring-rose-100" />
                              ) : (
                                <span className="w-2 h-2 rounded-full bg-slate-300 block" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1 mb-0.5">
                                <span className="text-xs font-bold text-slate-800 truncate">
                                  {n.studentCode || (targetStudent ? targetStudent.anonymousCode : 'Student')}
                                </span>
                                <span className="text-[10px] text-slate-400 whitespace-nowrap">
                                  {formatRelativeTime(n.createdAt)}
                                </span>
                              </div>
                              <p className="text-xs text-slate-600 font-medium line-clamp-2">
                                {n.message}
                              </p>
                              <div className="mt-1.5 flex items-center justify-between">
                                <span className="text-[10px] text-teal-600 font-semibold flex items-center gap-1 group-hover:underline">
                                  <span>Open student detail view</span>
                                  <ArrowRight className="w-3 h-3" />
                                </span>
                                {!n.isRead && (
                                  <span className="text-[9px] font-bold text-rose-600 uppercase tracking-wider">
                                    Needs review
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

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
                ? 'bg-rose-500/20 border-rose-500 ring-2 ring-rose-400'
                : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
          >
            <span className="text-xs text-rose-300 block mb-1 flex items-center justify-between">
              <span className="font-bold">🔴 Higher Concern</span>
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            </span>
            <span className="text-2xl font-extrabold text-rose-400">
              {CAMPUS_COHORT_STATS.statusBreakdown.checkInRecommended}
            </span>
            <span className="text-[10px] text-rose-200 block mt-0.5 font-medium">
              Requires Review • 1-on-1 Follow-up Recommended
            </span>
          </button>

          <button
            onClick={() => setStatusFilter('monitor')}
            className={`p-4 rounded-2xl border text-left transition-all ${
              statusFilter === 'monitor'
                ? 'bg-amber-500/20 border-amber-500 ring-2 ring-amber-400'
                : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
          >
            <span className="text-xs text-amber-300 block mb-1 flex items-center justify-between">
              <span className="font-bold">🟡 Moderate Concern</span>
            </span>
            <span className="text-2xl font-extrabold text-amber-400">
              {CAMPUS_COHORT_STATS.statusBreakdown.monitor}
            </span>
            <span className="text-[10px] text-amber-200 block mt-0.5 font-medium">
              Support Recommended • Share Resources / Monitor
            </span>
          </button>

          <button
            onClick={() => setStatusFilter('stable')}
            className={`p-4 rounded-2xl border text-left transition-all ${
              statusFilter === 'stable'
                ? 'bg-emerald-500/20 border-emerald-500 ring-2 ring-emerald-400'
                : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
          >
            <span className="text-xs text-emerald-300 block mb-1 flex items-center justify-between">
              <span className="font-bold">🟢 Low Concern</span>
            </span>
            <span className="text-2xl font-extrabold text-emerald-400">
              {CAMPUS_COHORT_STATS.statusBreakdown.stable}
            </span>
            <span className="text-[10px] text-emerald-200 block mt-0.5 font-medium">
              Stable Baseline • Routine Check-ins & Guides
            </span>
          </button>
        </div>

        {/* Clinical Intervention Decision Support Guide */}
        <div className="mt-6 pt-5 border-t border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/50 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-300 block mb-1">
                Higher Concern Workflow
              </span>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Prioritize counselor review and possible 1-on-1 check-in follow-up.
              </p>
            </div>
            <span className="text-[10px] text-rose-400 font-semibold mt-2">
              Action: Schedule 1-on-1 Touchpoint
            </span>
          </div>

          <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/50 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 block mb-1">
                Moderate Concern Workflow
              </span>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Review longitudinal trends, share pacing/sleep guides, monitor rhythm, or schedule a gentle check-in.
              </p>
            </div>
            <span className="text-[10px] text-amber-400 font-semibold mt-2">
              Action: Share Resource / Peer Buddy / Monitor
            </span>
          </div>

          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/50 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 block mb-1">
                Low Concern Workflow
              </span>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Continue normal check-ins and provide self-directed wellbeing resources.
              </p>
            </div>
            <span className="text-[10px] text-emerald-400 font-semibold mt-2">
              Action: Normal Routine & Self-Care
            </span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5 text-teal-400 font-medium">
            <Shield className="w-3.5 h-3.5" />
            <span>AI identifies multi-dimensional patterns only. Zero diagnostic claims. Counselor makes all final intervention decisions.</span>
          </span>
          <span className="hidden sm:inline text-slate-500 font-mono">WHO Digital Health Compliant</span>
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
              className="text-xs py-2 px-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-hidden bg-white text-slate-700 font-medium"
            >
              <option value="all">All Triage Categories</option>
              <option value="check_in_recommended">🔴 Higher Concern (Requires Review)</option>
              <option value="monitor">🟡 Moderate Concern (Support Recommended)</option>
              <option value="stable">🟢 Low Concern (Stable Baseline)</option>
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
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-900 border border-rose-200 inline-flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                          <span>Requires Review</span>
                        </span>
                      )}
                      {analysis.status === 'monitor' && (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-200 inline-flex items-center gap-1">
                          <span>Support Recommended</span>
                        </span>
                      )}
                      {analysis.status === 'stable' && (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-200 inline-flex items-center gap-1">
                          <span>Stable Baseline</span>
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

      {/* Counselor Upcoming 1-on-1 Meetings Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
              <h2 className="text-lg font-bold text-slate-900">
                Scheduled 1-on-1 Gentle Check-in Meetings
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Active appointments scheduled by the counseling team for proactive student wellbeing check-ins
            </p>
          </div>

          {/* Filter Pills with Counts */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
            {(
              [
                { id: 'All', label: 'All', count: meetings.length },
                { id: 'Scheduled', label: 'Upcoming', count: meetings.filter((m) => m.status === 'Scheduled').length },
                { id: 'Completed', label: 'Completed', count: meetings.filter((m) => m.status === 'Completed').length },
                { id: 'Rescheduled', label: 'Rescheduled', count: meetings.filter((m) => m.status === 'Rescheduled').length },
                { id: 'Cancelled', label: 'Cancelled', count: meetings.filter((m) => m.status === 'Cancelled').length },
              ] as const
            ).map((st) => (
              <button
                key={st.id}
                onClick={() => setMeetingFilter(st.id)}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  meetingFilter === st.id
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'hover:text-slate-900'
                }`}
              >
                <span>{st.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    meetingFilter === st.id
                      ? 'bg-teal-100 text-teal-800 font-bold'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {st.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Meeting Cards List */}
        {meetings.filter((m) => meetingFilter === 'All' || m.status === meetingFilter).length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-xs font-medium text-slate-500">
              No meetings found for the "{meetingFilter}" filter. To schedule a new 1-on-1 meeting, click on "Review & Action" for any student above.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {meetings
              .filter((m) => meetingFilter === 'All' || m.status === meetingFilter)
              .map((meeting) => {
                const targetStudent = students.find((s) => s.id === meeting.studentId);
                return (
                  <div
                    key={meeting.id}
                    className="p-4.5 rounded-2xl bg-slate-50 hover:bg-slate-100/70 border border-slate-200 transition-all flex flex-col justify-between gap-3 shadow-2xs"
                  >
                    <div>
                      {/* Top Header */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <span className="font-bold text-sm text-slate-900 block">
                            {meeting.studentName || targetStudent?.name || 'Student'}
                          </span>
                          <span className="font-mono text-[10px] text-slate-500">
                            {meeting.studentCode || targetStudent?.anonymousCode || 'STU-1000'}
                          </span>
                        </div>
                        <select
                          value={meeting.status}
                          onChange={(e) =>
                            handleMeetingStatusChange(
                              meeting.id,
                              e.target.value as CounselorMeeting['status']
                            )
                          }
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border focus:ring-1 focus:outline-hidden cursor-pointer ${
                            meeting.status === 'Scheduled'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : meeting.status === 'Completed'
                              ? 'bg-blue-100 text-blue-800 border-blue-300'
                              : meeting.status === 'Rescheduled'
                              ? 'bg-amber-100 text-amber-800 border-amber-300'
                              : 'bg-rose-100 text-rose-800 border-rose-300'
                          }`}
                        >
                          <option value="Scheduled">Scheduled</option>
                          <option value="Completed">Completed</option>
                          <option value="Rescheduled">Rescheduled</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>

                      {/* Date, Time & Mode */}
                      <div className="space-y-1 text-xs text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200/70">
                        <div className="flex items-center justify-between font-semibold">
                          <span className="flex items-center gap-1.5 text-teal-900">
                            <span>📅</span>
                            <span>{meeting.date}</span>
                          </span>
                          <span className="text-slate-500 font-mono text-[11px]">
                            ⏰ {meeting.time}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5 border-t border-slate-100">
                          <span>⏱️ {meeting.duration}</span>
                          <span>{meeting.mode === 'Online' ? '💻 Online' : '🏢 In-person'}</span>
                        </div>
                      </div>

                      {/* Follow-up Note Display for Completed Meetings */}
                      {meeting.status === 'Completed' ? (
                        <div className="mt-2.5 p-2.5 rounded-xl bg-blue-50/80 border border-blue-200/80 text-xs">
                          <div className="flex items-center justify-between text-[11px] font-bold text-blue-900 mb-1">
                            <span className="flex items-center gap-1">
                              <span>📝</span>
                              <span>Clinical Follow-up Note</span>
                            </span>
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-200/70 text-blue-800 uppercase">
                              Private
                            </span>
                          </div>
                          <p className="text-slate-700 italic text-xs">
                            {meeting.note ? `"${meeting.note}"` : 'No follow-up note recorded yet.'}
                          </p>
                          <button
                            onClick={() => setEditingMeeting(meeting)}
                            className="mt-2 text-[11px] font-bold text-blue-700 hover:text-blue-900 underline flex items-center gap-1"
                          >
                            <span>✏️ {meeting.note ? 'Edit Follow-up Note' : 'Add Follow-up Note'}</span>
                          </button>
                        </div>
                      ) : meeting.status === 'Scheduled' ? (
                        <div className="mt-2.5">
                          <button
                            onClick={() => setEditingMeeting({ ...meeting, status: 'Completed' })}
                            className="w-full py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-2xs transition-colors flex items-center justify-center gap-1.5"
                          >
                            <span>✅ Mark Completed & Add Note</span>
                          </button>
                        </div>
                      ) : (
                        meeting.note && (
                          <div className="mt-2 p-2 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600 italic">
                            "{meeting.note}"
                          </div>
                        )
                      )}
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                      <button
                        onClick={() => setEditingMeeting(meeting)}
                        className="text-slate-500 hover:text-slate-800 text-[11px] font-semibold flex items-center gap-1"
                      >
                        <span>⚙️ Status & Details</span>
                      </button>
                      {targetStudent && (
                        <button
                          onClick={() => setSelectedStudent(targetStudent)}
                          className="text-teal-700 font-bold hover:underline flex items-center gap-1"
                        >
                          <span>Open Student</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* Meeting Follow-Up & Status Modal */}
      {editingMeeting && (
        <MeetingFollowUpModal
          isOpen={!!editingMeeting}
          meeting={editingMeeting}
          onClose={() => setEditingMeeting(null)}
          onSave={handleMeetingSaved}
        />
      )}

      {/* Student Detail Modal */}
      {selectedStudent && (
        <StudentDetailModal
          isOpen={!!selectedStudent}
          onClose={() => setSelectedStudent(null)}
          student={selectedStudent}
          onLogAction={onLogAction}
          pastActions={counselorActions.filter((a) => a.studentId === selectedStudent.id)}
          meetings={meetings}
          onMeetingScheduled={handleMeetingAdded}
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
