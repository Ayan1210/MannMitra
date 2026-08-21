import React from 'react';
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
  LogIn,
  LogOut,
  User,
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
  return (
    <div className="space-y-12 pb-16">
      {/* ACTIVE SESSION BANNER (Only shown if already logged in) */}
      {currentSession && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
              {currentSession.role === 'student' ? '🎓' : currentSession.role === 'counselor' ? '🧑‍⚕️' : '🏛️'}
            </div>
            <div>
              <div className="text-xs text-emerald-800 font-medium">
                Active Session Detected
              </div>
              <div className="text-sm font-bold text-slate-900">
                {(currentSession.profile as any).name} ({currentSession.role.toUpperCase()})
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => onSelectRole(currentSession.role)}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5"
            >
              <span>Go to My {currentSession.role === 'student' ? 'Check-in Portal' : currentSession.role === 'counselor' ? 'Triage Dashboard' : 'Analytics'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 1. HERO & MISSION OVERVIEW */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-emerald-950 via-slate-900 to-slate-950 text-white p-6 sm:p-10 lg:p-12 shadow-2xl border border-emerald-900/40">
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

          {/* Subtitle */}
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-3xl mx-auto">
            Designed for Indian campus communities. Detects subtle longitudinal changes in
            sleep, academic stress, energy, and concentration—enabling gentle, non-stigmatizing human
            counselor check-ins before crises develop.
          </p>

          {/* Ethical highlights */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 pt-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-slate-200">
              <EyeOff className="w-3.5 h-3.5 text-emerald-400" />
              100% Zero-Surveillance
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-slate-200">
              <TrendingUp className="w-3.5 h-3.5 text-teal-400" />
              Longitudinal Slope Analysis
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-slate-200">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              Granular Student Consent
            </span>
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            <a
              href="#login-portals"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
            >
              <span>Who Do You Want to Login As?</span>
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

      {/* 2. THE CORE QUESTION: WHO DO YOU WANT TO LOGIN AS? */}
      <section id="login-portals" className="space-y-6 scroll-mt-20">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Role-Based Authentication Gateway</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Who do you want to login as?
          </h2>
          <p className="text-sm text-slate-600">
            Please choose your role to enter your dedicated portal or use 1-click verified demo accounts.
          </p>
        </div>

        {/* 3-WAY LOGIN PORTAL CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* CARD 1: STUDENT */}
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
                  Student / विद्यार्थी
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Log in to submit 60-second weekly check-ins, record Hinglish/English voice reflections, view your longitudinal trends, and practice breathing exercises.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Private weekly micro check-ins</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Voice journal with supportive reflection</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Granular privacy & consent controls</span>
                </div>
              </div>

              {/* 1-Click Demo Profiles */}
              <div className="pt-3 border-t border-slate-100">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  1-Click Student Demo Accounts:
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
                      <div className="text-[10px] text-emerald-700">Week 4 • Declining sleep & project stress</div>
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
                      <div className="text-[10px] text-slate-500">Week 3 • Balanced & stable baseline</div>
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
                onClick={() => onOpenAuthModal('student')}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Log In as Student</span>
              </button>
              <button
                onClick={() => onOpenAuthModal('student')}
                className="w-full py-2 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-all text-center"
              >
                New Student? Register with ID
              </button>
            </div>
          </div>

          {/* CARD 2: COUNSELOR */}
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
                  Counselor / परामर्शदाता
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  For campus psychologists and wellness officers. Access the longitudinal triage matrix, AI clinical summaries, and proactive check-in logs.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span>Multi-week downward slope alerts</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span>Gemini AI clinical briefing synthesis</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span>Proactive outreach & touchpoint logger</span>
                </div>
              </div>

              {/* 1-Click Demo Staff */}
              <div className="pt-3 border-t border-slate-100">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  1-Click Counselor Demo Accounts:
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
                      <div className="text-[10px] text-slate-500">Student Welfare Specialist</div>
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
                onClick={() => onOpenAuthModal('counselor')}
                className="w-full py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 transition-all flex items-center justify-center gap-2"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Log In as Counselor</span>
              </button>
              <button
                onClick={() => onQuickAuthenticate('counselor', 'counselor.sharma@campus.edu', 'counselor123')}
                className="w-full py-2 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-all text-center"
              >
                Quick Enter Demo Dashboard
              </button>
            </div>
          </div>

          {/* CARD 3: INSTITUTIONAL ADMIN */}
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
                  Administrator / प्रशासन
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  For Deans and Academic Leadership. View aggregated department stress heatmaps and exam pacing without individual student de-anonymization.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>Aggregated department stress heatmaps</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>Semester exam workload pacing metrics</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>Zero individual student surveillance</span>
                </div>
              </div>

              {/* 1-Click Demo Admin */}
              <div className="pt-3 border-t border-slate-100">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  1-Click Admin Demo Accounts:
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
                onClick={() => onOpenAuthModal('admin')}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Log In as Administrator</span>
              </button>
              <button
                onClick={() => onQuickAuthenticate('admin', 'admin@campus.edu', 'admin123')}
                className="w-full py-2 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-all text-center"
              >
                Quick Enter Demo Analytics
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
              No keystroke logging, no LMS activity scraping, no webcam or social media tracking. 100% of data is voluntarily student-authored with revocable consent.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Human-in-the-Loop Triage</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              AI serves solely as a communication briefing tool to reduce counselor workload. The AI never delivers autonomous clinical diagnoses or labels students.
            </p>
          </div>
        </div>
      </section>

      {/* 4. EMERGENCY & 24x7 HELPLINES */}
      <section className="rounded-2xl bg-gradient-to-r from-rose-50 via-amber-50 to-emerald-50 border border-rose-200/80 p-6 sm:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold">
              <PhoneCall className="w-3.5 h-3.5" />
              <span>National 24x7 Student Support Helplines (India)</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Immediate, Free & Confidential Crisis Support
            </h3>
            <p className="text-xs text-slate-600 max-w-2xl">
              MannMitra is an early-warning wellbeing platform. If you or someone you know is in acute distress, please reach out to dedicated national support lines immediately:
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap gap-3 shrink-0">
            <div className="p-3 bg-white rounded-xl border border-rose-200 shadow-xs text-xs">
              <div className="font-bold text-rose-900">Tele-MANAS (MoHFW)</div>
              <div className="text-base font-mono font-extrabold text-rose-600">14416</div>
              <div className="text-[10px] text-slate-500">Toll-Free • 24x7 • Multi-lingual</div>
            </div>
            <div className="p-3 bg-white rounded-xl border border-amber-200 shadow-xs text-xs">
              <div className="font-bold text-amber-900">KIRAN (MSJE)</div>
              <div className="text-base font-mono font-extrabold text-amber-700">1800-599-0019</div>
              <div className="text-[10px] text-slate-500">Mental Health Helpline</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
