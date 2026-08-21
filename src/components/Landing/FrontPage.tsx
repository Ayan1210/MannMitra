import React, { useState } from 'react';
import {
  HeartHandshake,
  GraduationCap,
  Stethoscope,
  Building2,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Lock,
  CheckCircle2,
  TrendingUp,
  Brain,
  EyeOff,
  Clock,
  PhoneCall,
  ChevronRight,
  FileText,
  UserCheck,
  Activity,
  Award,
} from 'lucide-react';
import { Role, StudentProfile, StaffProfile, AuthSessionUser } from '../../types';

interface FrontPageProps {
  onSelectRole: (role: Role) => void;
  onOpenAuthModal: (targetRole: 'student' | 'counselor' | 'admin') => void;
  onQuickAuthenticate: (role: 'student' | 'counselor' | 'admin', email: string, pass: string) => void;
  onOpenEthicsModal: () => void;
  currentSession: AuthSessionUser | null;
  unreadAlertCount: number;
}

export const FrontPage: React.FC<FrontPageProps> = ({
  onSelectRole,
  onOpenAuthModal,
  onQuickAuthenticate,
  onOpenEthicsModal,
  currentSession,
  unreadAlertCount,
}) => {
  const [activeTab, setActiveTab] = useState<'student' | 'counselor' | 'admin'>('student');

  return (
    <div className="space-y-12 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-emerald-950 via-slate-900 to-slate-950 text-white p-6 sm:p-10 lg:p-14 shadow-2xl border border-emerald-900/40">
        {/* Ambient background glows */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-semibold backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>मनमित्र • MannMitra: Early Warning Student Mental Health Intelligence</span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white">
            Ethical, Consent-Driven Student Wellbeing{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 bg-clip-text text-transparent">
              Early-Warning Platform
            </span>
          </h1>

          {/* Subtitle / Mission Statement */}
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-3xl mx-auto">
            Designed for Indian higher education campuses. Detects subtle longitudinal changes in
            sleep, stress, energy, and academic pressure over time—empowering counselors with timely,
            non-stigmatizing intervention before acute distress occurs.
          </p>

          {/* Three Key Ethics Tags */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 pt-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-slate-200">
              <EyeOff className="w-3.5 h-3.5 text-emerald-400" />
              100% Zero-Surveillance
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-slate-200">
              <TrendingUp className="w-3.5 h-3.5 text-teal-400" />
              Longitudinal Pattern Analysis
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-slate-200">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              Granular Student Consent
            </span>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <a
              href="#login-portals"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
            >
              <span>Access 3-Way Portals</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <button
              onClick={() => onSelectRole('story_mode')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white font-semibold text-sm border border-slate-700 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Explore Aarav's 4-Week Story</span>
            </button>
            <button
              onClick={onOpenEthicsModal}
              className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-transparent hover:bg-slate-800/50 text-slate-300 hover:text-white font-medium text-sm transition-all flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4 text-slate-400" />
              <span>Ethical Framework</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. THE 3-WAY LOGIN & PORTAL GATEWAY SECTION */}
      <section id="login-portals" className="space-y-6 scroll-mt-20">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Role-Based Authentication</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Select Your Portal & Sign In
          </h2>
          <p className="text-sm text-slate-600">
            Dedicated entrances tailored for Students, Clinical Counselors, and Institutional Administrators.
          </p>
        </div>

        {/* 3-Way Interactive Portal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* PORTAL 1: STUDENT */}
          <div className="bg-white rounded-2xl border-2 border-emerald-500/80 shadow-md hover:shadow-xl transition-all p-6 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 px-3 py-1 bg-emerald-600 text-white text-[10px] font-bold rounded-bl-xl uppercase tracking-wider">
              Student Hub
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shadow-inner">
                <GraduationCap className="w-6 h-6 text-emerald-700" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  Student Portal
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-normal">
                    विद्यार्थी
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Private wellness self check-ins, Hinglish/English voice reflections, longitudinal trends, and breathing exercises.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>60-second weekly micro check-ins</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Hinglish voice journal & audio synthesis</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Granular consent toggles (Zero surveillance)</span>
                </div>
              </div>

              {/* 1-Click Demo Profiles */}
              <div className="pt-3 border-t border-slate-100">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Quick Demo Student Accounts:
                </div>
                <div className="grid grid-cols-1 gap-1.5">
                  <button
                    onClick={() => {
                      onQuickAuthenticate('student', 'aarav.sharma@campus.edu', 'password123');
                    }}
                    className="w-full text-left p-2 rounded-lg bg-emerald-50/70 hover:bg-emerald-100/80 border border-emerald-200 transition-all flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-emerald-950">Aarav Sharma (STU-1024)</div>
                      <div className="text-[10px] text-emerald-700">Week 4 • Declining Sleep & Lab Stress</div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded shadow-2xs">
                      1-Click
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      onQuickAuthenticate('student', 'priya.patel@campus.edu', 'password123');
                    }}
                    className="w-full text-left p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all flex items-center justify-between text-xs text-slate-700"
                  >
                    <div>
                      <div className="font-bold text-slate-900">Priya Patel (STU-1089)</div>
                      <div className="text-[10px] text-slate-500">Week 3 • Balanced & Stable</div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded shadow-2xs">
                      1-Click
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-5 space-y-2">
              <button
                onClick={() => onSelectRole('student')}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
              >
                <span>Enter Student Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onOpenAuthModal('student')}
                className="w-full py-2 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-all text-center"
              >
                Sign In / Register with Email
              </button>
            </div>
          </div>

          {/* PORTAL 2: COUNSELOR */}
          <div className="bg-white rounded-2xl border-2 border-teal-500/80 shadow-md hover:shadow-xl transition-all p-6 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 px-3 py-1 bg-teal-600 text-white text-[10px] font-bold rounded-bl-xl uppercase tracking-wider flex items-center gap-1">
              <Lock className="w-2.5 h-2.5" />
              <span>Counselor</span>
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold shadow-inner">
                <Stethoscope className="w-6 h-6 text-teal-700" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  Counselor Portal
                  <span className="text-xs px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 font-normal">
                    परामर्शदाता
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Longitudinal triage matrix, AI-powered clinical summaries, privacy-preserving alerts, and proactive outreach scheduling.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span>Multi-week downward trajectory alerts</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span>Gemini AI clinical briefing synthesis</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span>Proactive, non-stigmatizing check-in logger</span>
                </div>
              </div>

              {/* 1-Click Demo Staff */}
              <div className="pt-3 border-t border-slate-100">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Quick Demo Staff Credentials:
                </div>
                <div className="grid grid-cols-1 gap-1.5">
                  <button
                    onClick={() => {
                      onQuickAuthenticate('counselor', 'counselor.sharma@campus.edu', 'counselor123');
                    }}
                    className="w-full text-left p-2 rounded-lg bg-teal-50/70 hover:bg-teal-100/80 border border-teal-200 transition-all flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-teal-950">Dr. Ananya Sharma</div>
                      <div className="text-[10px] text-teal-700">Lead Psychologist & Counselor</div>
                    </div>
                    <span className="text-[10px] font-bold text-teal-700 bg-white px-2 py-0.5 rounded shadow-2xs">
                      1-Click
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      onQuickAuthenticate('counselor', 'counselor.verma@campus.edu', 'counselor123');
                    }}
                    className="w-full text-left p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all flex items-center justify-between text-xs text-slate-700"
                  >
                    <div>
                      <div className="font-bold text-slate-900">Dr. Rajesh Verma</div>
                      <div className="text-[10px] text-slate-500">Academic Stress Counselor</div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded shadow-2xs">
                      1-Click
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-5 space-y-2">
              <button
                onClick={() => {
                  onQuickAuthenticate('counselor', 'counselor.sharma@campus.edu', 'counselor123');
                  onSelectRole('counselor');
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 transition-all flex items-center justify-center gap-2"
              >
                <span>Enter Counselor Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onOpenAuthModal('counselor')}
                className="w-full py-2 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-all text-center"
              >
                Staff Login with Password
              </button>
            </div>
          </div>

          {/* PORTAL 3: INSTITUTIONAL ADMIN */}
          <div className="bg-white rounded-2xl border-2 border-indigo-500/80 shadow-md hover:shadow-xl transition-all p-6 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 px-3 py-1 bg-indigo-600 text-white text-[10px] font-bold rounded-bl-xl uppercase tracking-wider flex items-center gap-1">
              <Lock className="w-2.5 h-2.5" />
              <span>Admin</span>
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold shadow-inner">
                <Building2 className="w-6 h-6 text-indigo-700" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  Admin Portal
                  <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-normal">
                    प्रशासन
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Aggregated department stress heatmaps, semester exam risk timelines, and resource allocation—no individual tracking.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>Campus-wide stress & sleep heatmaps</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>Semester exam workload pacing metrics</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>Strict anonymization (k-anonymity compliance)</span>
                </div>
              </div>

              {/* 1-Click Demo Admin */}
              <div className="pt-3 border-t border-slate-100">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Quick Demo Admin Credentials:
                </div>
                <div className="grid grid-cols-1 gap-1.5">
                  <button
                    onClick={() => {
                      onQuickAuthenticate('admin', 'admin@campus.edu', 'admin123');
                    }}
                    className="w-full text-left p-2 rounded-lg bg-indigo-50/70 hover:bg-indigo-100/80 border border-indigo-200 transition-all flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-indigo-950">Prof. Meenakshi Sundaram</div>
                      <div className="text-[10px] text-indigo-700">Dean of Student Affairs</div>
                    </div>
                    <span className="text-[10px] font-bold text-indigo-700 bg-white px-2 py-0.5 rounded shadow-2xs">
                      1-Click
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      onQuickAuthenticate('admin', 'director@campus.edu', 'admin123');
                    }}
                    className="w-full text-left p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all flex items-center justify-between text-xs text-slate-700"
                  >
                    <div>
                      <div className="font-bold text-slate-900">Dr. Vikram Malhotra</div>
                      <div className="text-[10px] text-slate-500">Campus Director</div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded shadow-2xs">
                      1-Click
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-5 space-y-2">
              <button
                onClick={() => {
                  onQuickAuthenticate('admin', 'admin@campus.edu', 'admin123');
                  onSelectRole('admin');
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
              >
                <span>Enter Admin Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onOpenAuthModal('admin')}
                className="w-full py-2 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-all text-center"
              >
                Institutional Login with Password
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CORE ARCHITECTURAL PILLARS */}
      <section className="space-y-6">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Why MannMitra is Different
          </h2>
          <p className="text-sm text-slate-600">
            A departure from clinical surveys and intrusive surveillance. Designed specifically around student trust.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Longitudinal Slope Analysis</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Instead of relying on single high-stress test days, MannMitra models 4+ week slope trajectories across Sleep, Stress, Energy, and Concentration to flag true systemic decline.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
              <EyeOff className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Zero-Surveillance Architecture</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              No campus Wi-Fi snooping, biometric scraping, or keylogging. All data is student-authored with granular consent toggles and complete isolation from disciplinary records.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Brain className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Human-in-the-Loop Triage</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              AI does not diagnose or make clinical decisions. It acts purely as a clinical summarizer for certified campus psychologists to facilitate gentle, timely human conversations.
            </p>
          </div>
        </div>
      </section>

      {/* 4. FOUR-WEEK INTERACTIVE STORY CASE STUDY CALLOUT */}
      <section className="bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-teal-500/10 rounded-3xl p-6 sm:p-8 border border-amber-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            <span>Interactive Case Walkthrough</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
            Follow "Aarav Sharma's" 4-Week Journey
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Experience how MannMitra detects Aarav's transition from Semester Onset (Week 1) to Lab Deadline Fatigue (Week 3) and Severe Academic Overload (Week 4), triggering a supportive counselor check-in that restores his balance.
          </p>
        </div>

        <button
          onClick={() => onSelectRole('story_mode')}
          className="shrink-0 px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2"
        >
          <span>Launch 4-Week Story</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </section>

      {/* 5. NATIONAL CRISIS & TELE-MANAS HELPLINE FOOTER BANNER */}
      <section className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sm text-rose-300">
              National Mental Health Helplines (India)
            </div>
            <div className="text-xs text-slate-400">
              Free, confidential 24x7 psychological support for students across India
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 font-mono text-emerald-300">
            Tele-MANAS: 14416 / 1800-891-4416
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 font-mono text-cyan-300">
            KIRAN: 1800-599-0019
          </span>
        </div>
      </section>
    </div>
  );
};
