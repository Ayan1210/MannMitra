import React, { useState } from 'react';
import {
  Heart,
  TrendingDown,
  TrendingUp,
  Minus,
  Shield,
  Calendar,
  Sparkles,
  HelpCircle,
  MessageCircle,
  Lock,
  Compass,
  Smile,
  AlertTriangle,
  Coffee,
  Moon,
  Zap,
  Users,
  Brain,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import { StudentProfile, CheckInRecord } from '../../types';
import { analyzeWellbeingPattern, calculateCompositeScore } from '../../lib/patternEngine';
import { BoxBreathingWidget } from './BoxBreathingWidget';
import { StudentPrivacyModal } from './StudentPrivacyModal';

interface StudentDashboardProps {
  student: StudentProfile;
  onOpenCheckIn: () => void;
  onUpdateConsent: (consent: StudentProfile['consent']) => void;
  onRequestCounselorChat: (note: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  student,
  onOpenCheckIn,
  onUpdateConsent,
  onRequestCounselorChat,
}) => {
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [selectedChartMetric, setSelectedChartMetric] = useState<
    'composite' | 'wellbeing' | 'stress' | 'sleep' | 'energy'
  >('composite');
  const [showGroundingGuide, setShowGroundingGuide] = useState(false);
  const [counselorRequestModal, setCounselorRequestModal] = useState(false);
  const [chatNote, setChatNote] = useState('');
  const [chatRequestedSuccess, setChatRequestedSuccess] = useState(false);

  const analysis = analyzeWellbeingPattern(student.checkIns);
  const checkIns = student.checkIns;
  const latestCheckIn = checkIns[checkIns.length - 1];

  const handleSendChatRequest = (e: React.FormEvent) => {
    e.preventDefault();
    onRequestCounselorChat(chatNote || 'Requested via student portal gentle check-in button.');
    setChatRequestedSuccess(true);
    setTimeout(() => {
      setChatRequestedSuccess(false);
      setCounselorRequestModal(false);
      setChatNote('');
    }, 1500);
  };

  const getStatusBadge = () => {
    if (analysis.status === 'check_in_recommended') {
      return (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
          <span>Gentle Support Recommended</span>
        </div>
      );
    }
    if (analysis.status === 'monitor') {
      return (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span>Mindful Observation</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
        <span>Rhythm in Balance</span>
      </div>
    );
  };

  // Helper for trend chart coordinates
  const maxWeeks = checkIns.length;
  const chartHeight = 160;
  const chartWidth = 520;
  const paddingX = 40;
  const paddingY = 25;

  const getChartPoints = (metric: typeof selectedChartMetric) => {
    return checkIns.map((ck, i) => {
      const x = paddingX + (i / Math.max(1, maxWeeks - 1)) * (chartWidth - paddingX * 2);
      let val = 3;
      if (metric === 'composite') {
        val = calculateCompositeScore(ck) / 20; // scale 0-100 to 0-5
      } else if (metric === 'wellbeing') {
        val = ck.overallWellbeing;
      } else if (metric === 'stress') {
        val = ck.academicStress;
      } else if (metric === 'sleep') {
        val = ck.sleepQuality;
      } else if (metric === 'energy') {
        val = ck.energyLevel;
      }

      // Invert Y because SVG top is 0
      const y = chartHeight - paddingY - ((val - 1) / 4) * (chartHeight - paddingY * 2);
      return { x, y, val, week: ck.weekNumber, date: ck.date };
    });
  };

  const points = getChartPoints(selectedChartMetric);
  const pathD = points.length > 1
    ? points.reduce(
        (acc, curr, idx) =>
          idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`,
        ''
      )
    : '';

  return (
    <div className="space-y-8 pb-16">
      {/* Student Welcome Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={student.avatar}
              alt={student.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-100 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-bold text-slate-900">{student.name}</h1>
                <span className="text-xs px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono font-medium">
                  {student.anonymousCode}
                </span>
                {getStatusBadge()}
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {student.department} • {student.year}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setShowPrivacyModal(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200/60 transition-colors flex items-center gap-2"
            >
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>Privacy & Consent</span>
            </button>

            <button
              onClick={onOpenCheckIn}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-600/30 transition-all flex items-center gap-2"
            >
              <Heart className="w-4 h-4 fill-white" />
              <span>New Check-in</span>
            </button>
          </div>
        </div>

        {/* Longitudinal Notice Banner if Alert Triggered */}
        {analysis.status === 'check_in_recommended' && (
          <div className="mt-6 p-4 rounded-2xl bg-amber-50/90 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-100 text-amber-800 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xs sm:text-sm font-bold text-amber-950">
                  Notice: Wellbeing pattern change detected across {analysis.consecutiveDeclines > 0 ? analysis.consecutiveDeclines : 3} consecutive weeks
                </h2>
                <p className="text-xs text-amber-800 mt-0.5">
                  Academic workload has increased while sleep and energy have lowered. Remember you don't have to carry peak semester pressure alone.
                </p>
              </div>
            </div>
            <button
              onClick={() => setCounselorRequestModal(true)}
              className="shrink-0 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Talk with Dr. Ananya (Counselor)</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Grid: Trend Visualization + Core Dimensions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Longitudinal Trend Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                <span>Your Wellbeing Trajectory (Multi-Week Trend)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                MannMitra analyzes changes over time rather than judging a single stressful day.
              </p>
            </div>

            {/* Metric Selector Pills */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-medium overflow-x-auto">
              <button
                onClick={() => setSelectedChartMetric('composite')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  selectedChartMetric === 'composite'
                    ? 'bg-white text-emerald-700 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Composite Index
              </button>
              <button
                onClick={() => setSelectedChartMetric('wellbeing')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  selectedChartMetric === 'wellbeing'
                    ? 'bg-white text-emerald-700 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Mood
              </button>
              <button
                onClick={() => setSelectedChartMetric('stress')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  selectedChartMetric === 'stress'
                    ? 'bg-white text-amber-700 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Workload
              </button>
              <button
                onClick={() => setSelectedChartMetric('sleep')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  selectedChartMetric === 'sleep'
                    ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sleep
              </button>
            </div>
          </div>

          {/* SVG Line Chart */}
          <div className="relative bg-slate-50/70 rounded-2xl p-4 border border-slate-100">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-48 overflow-visible"
            >
              {/* Background Grid Lines (1-5) */}
              {[1, 2, 3, 4, 5].map((lvl) => {
                const y = chartHeight - paddingY - ((lvl - 1) / 4) * (chartHeight - paddingY * 2);
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
                      {selectedChartMetric === 'composite' ? `${lvl * 20}%` : `${lvl}/5`}
                    </text>
                  </g>
                );
              })}

              {/* Gradient Area Fill */}
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {points.length > 1 && (
                <path
                  d={`${pathD} L ${points[points.length - 1].x} ${chartHeight - paddingY} L ${points[0].x} ${chartHeight - paddingY} Z`}
                  fill="url(#chartGradient)"
                />
              )}

              {/* Main Line */}
              {pathD && (
                <path
                  d={pathD}
                  fill="none"
                  stroke={selectedChartMetric === 'stress' ? '#f59e0b' : '#10b981'}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Data Points */}
              {points.map((pt, idx) => (
                <g key={idx} className="cursor-pointer group">
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="6"
                    className={`${
                      selectedChartMetric === 'stress'
                        ? 'fill-amber-500 stroke-white'
                        : 'fill-emerald-600 stroke-white'
                    } stroke-2 transition-transform group-hover:scale-125`}
                  />
                  {/* Tooltip on hover */}
                  <text
                    x={pt.x}
                    y={chartHeight - 6}
                    fontSize="11"
                    fill="#64748b"
                    textAnchor="middle"
                    fontWeight="600"
                  >
                    Week {pt.week}
                  </text>
                  <text
                    x={pt.x}
                    y={pt.y - 12}
                    fontSize="11"
                    fill="#1e293b"
                    textAnchor="middle"
                    fontWeight="bold"
                  >
                    {selectedChartMetric === 'composite'
                      ? `${Math.round(pt.val * 20)}%`
                      : `${pt.val}/5`}
                  </text>
                </g>
              ))}
            </svg>

            {/* Subtext trend interpretation */}
            <div className="mt-3 pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
              <span className="font-medium">
                Analysis: <span className="text-slate-800 font-semibold">{analysis.explanation}</span>
              </span>
              <span className="text-slate-400 text-[11px]">4-Week Snapshot</span>
            </div>
          </div>

          {/* 6 Core Pillars Breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6">
            <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100">
              <div className="flex items-center justify-between text-emerald-800 mb-1">
                <span className="text-xs font-semibold">Overall Mood</span>
                <Smile className="w-4 h-4" />
              </div>
              <span className="text-xl font-extrabold text-emerald-950">
                {latestCheckIn ? `${latestCheckIn.overallWellbeing}/5` : 'N/A'}
              </span>
              <span className="text-[10px] text-emerald-700 block mt-0.5">
                {latestCheckIn?.overallWellbeing >= 4 ? 'Doing well' : 'Needs care'}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-100">
              <div className="flex items-center justify-between text-amber-800 mb-1">
                <span className="text-xs font-semibold">Academic Stress</span>
                <Coffee className="w-4 h-4" />
              </div>
              <span className="text-xl font-extrabold text-amber-950">
                {latestCheckIn ? `${latestCheckIn.academicStress}/5` : 'N/A'}
              </span>
              <span className="text-[10px] text-amber-700 block mt-0.5">
                {latestCheckIn?.academicStress >= 4 ? 'High Pressure' : 'Manageable'}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-100">
              <div className="flex items-center justify-between text-indigo-800 mb-1">
                <span className="text-xs font-semibold">Sleep Restfulness</span>
                <Moon className="w-4 h-4" />
              </div>
              <span className="text-xl font-extrabold text-indigo-950">
                {latestCheckIn ? `${latestCheckIn.sleepQuality}/5` : 'N/A'}
              </span>
              <span className="text-[10px] text-indigo-700 block mt-0.5">
                {latestCheckIn?.sleepQuality <= 2 ? 'Irregular / Short' : 'Restful'}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-teal-50/60 border border-teal-100">
              <div className="flex items-center justify-between text-teal-800 mb-1">
                <span className="text-xs font-semibold">Energy Level</span>
                <Zap className="w-4 h-4" />
              </div>
              <span className="text-xl font-extrabold text-teal-950">
                {latestCheckIn ? `${latestCheckIn.energyLevel}/5` : 'N/A'}
              </span>
              <span className="text-[10px] text-teal-700 block mt-0.5">
                {latestCheckIn?.energyLevel <= 2 ? 'Fatigued' : 'Energetic'}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-100">
              <div className="flex items-center justify-between text-purple-800 mb-1">
                <span className="text-xs font-semibold">Social Connection</span>
                <Users className="w-4 h-4" />
              </div>
              <span className="text-xl font-extrabold text-purple-950">
                {latestCheckIn ? `${latestCheckIn.socialConnection}/5` : 'N/A'}
              </span>
              <span className="text-[10px] text-purple-700 block mt-0.5">
                {latestCheckIn?.socialConnection <= 2 ? 'Isolated' : 'Connected'}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-sky-50/60 border border-sky-100">
              <div className="flex items-center justify-between text-sky-800 mb-1">
                <span className="text-xs font-semibold">Study Focus</span>
                <Brain className="w-4 h-4" />
              </div>
              <span className="text-xl font-extrabold text-sky-950">
                {latestCheckIn ? `${latestCheckIn.concentration}/5` : 'N/A'}
              </span>
              <span className="text-[10px] text-sky-700 block mt-0.5">
                {latestCheckIn?.concentration <= 2 ? 'Hard to focus' : 'Sharp'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Self-Care & Grounding Tools */}
        <div className="space-y-6">
          {/* Box Breathing Widget */}
          <BoxBreathingWidget />

          {/* 5-4-3-2-1 Sensory Grounding Card */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-50 text-purple-700">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">5-4-3-2-1 Grounding</h3>
                  <p className="text-[11px] text-slate-500">Quick sensory reset during study stress</p>
                </div>
              </div>
              <button
                onClick={() => setShowGroundingGuide(!showGroundingGuide)}
                className="text-xs font-semibold text-purple-700 hover:text-purple-900"
              >
                {showGroundingGuide ? 'Hide' : 'View'}
              </button>
            </div>

            {showGroundingGuide && (
              <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <div className="p-2 rounded-lg bg-slate-50 flex items-center gap-2">
                  <span className="font-bold text-purple-700">👁️ 5</span>
                  <span>Things you can see around your desk</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 flex items-center gap-2">
                  <span className="font-bold text-purple-700">✋ 4</span>
                  <span>Things you can touch (pen, desk, clothes)</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 flex items-center gap-2">
                  <span className="font-bold text-purple-700">👂 3</span>
                  <span>Sounds you can hear in the room</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 flex items-center gap-2">
                  <span className="font-bold text-purple-700">👃 2</span>
                  <span>Scents you can smell (tea, air)</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 flex items-center gap-2">
                  <span className="font-bold text-purple-700">👅 1</span>
                  <span>Taste in your mouth or take a sip of water</span>
                </div>
              </div>
            )}

            {!showGroundingGuide && (
              <p className="text-xs text-slate-500">
                A proven mental grounding technique to break anxious thought loops when preparing for tests.
              </p>
            )}
          </div>

          {/* Quick Support Touchpoint */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 text-white shadow-sm">
            <h3 className="font-bold text-base text-white">Need to talk to someone?</h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Dr. Ananya Sharma from the campus counseling center is available for confidential, non-judgmental chats.
            </p>
            <button
              onClick={() => setCounselorRequestModal(true)}
              className="mt-4 w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-md"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Request a Gentle Check-in</span>
            </button>
          </div>
        </div>
      </div>

      {/* Check-In History */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-lg text-slate-900">Check-in History & Reflections</h3>
            <p className="text-xs text-slate-500">Your personal longitudinal log</p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
            {checkIns.length} Check-ins Recorded
          </span>
        </div>

        <div className="space-y-3">
          {[...checkIns].reverse().map((record) => (
            <div
              key={record.id}
              className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:bg-slate-50"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-slate-800">
                    Week {record.weekNumber}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">({record.date})</span>
                  {record.primaryTag && (
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-white border border-slate-200 font-medium text-slate-700">
                      🏷️ {record.primaryTag}
                    </span>
                  )}
                  {record.isPrivateNote && (
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-medium flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" />
                      <span>Private Note</span>
                    </span>
                  )}
                </div>
                {record.personalReflection && (
                  <p className="text-xs text-slate-600 italic">
                    "{record.personalReflection}"
                  </p>
                )}
              </div>

              {/* Ratings Pills */}
              <div className="flex items-center gap-2 shrink-0 flex-wrap text-xs">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-100/70 text-emerald-900 font-semibold">
                  Mood {record.overallWellbeing}/5
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-amber-100/70 text-amber-900 font-semibold">
                  Stress {record.academicStress}/5
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-indigo-100/70 text-indigo-900 font-semibold">
                  Sleep {record.sleepQuality}/5
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Privacy Modal */}
      <StudentPrivacyModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
        student={student}
        onUpdateConsent={onUpdateConsent}
      />

      {/* Counselor Request Modal */}
      {counselorRequestModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Request a Confidential Check-in
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Dr. Ananya Sharma from Student Wellbeing Services will receive this note and reach out with convenient appointment slots.
            </p>

            <form onSubmit={handleSendChatRequest} className="space-y-4">
              <textarea
                rows={3}
                value={chatNote}
                onChange={(e) => setChatNote(e.target.value)}
                placeholder="Optional: What's on your mind? e.g., 'Looking for guidance with sleep routines and balancing assignment deadlines'..."
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCounselorRequestModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  {chatRequestedSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Sent!</span>
                    </>
                  ) : (
                    <span>Send Request</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
