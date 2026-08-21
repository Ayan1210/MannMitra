import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  HeartHandshake,
  User,
  Brain,
  ShieldCheck,
  TrendingDown,
  MessageCircle,
  Eye,
} from 'lucide-react';
import { Role } from '../../types';

interface AaravStoryWalkthroughProps {
  onSwitchToCounselor: () => void;
  onSwitchToStudent: () => void;
}

export const AaravStoryWalkthrough: React.FC<AaravStoryWalkthroughProps> = ({
  onSwitchToCounselor,
  onSwitchToStudent,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);

  const steps = [
    {
      step: 1,
      title: 'Meet Aarav — 1st Year Computer Science Student',
      subtitle: 'Week 1: Smooth transition into college life',
      status: 'stable',
      mood: 4,
      stress: 2,
      sleep: 4,
      energy: 4,
      social: 4,
      focus: 4,
      reflection: 'Orientation went well, feeling excited about coding labs and hostel life.',
      engineResult: '🟢 Stable Rhythm (Baseline index: 80/100)',
      explanation: 'Aarav is adapting smoothly with high energy, balanced sleep, and low stress.',
      storyline:
        'Aarav started college full of excitement. His first weekly check-in showed healthy sleep, low academic pressure, and good social connection. No alarms, no intervention needed.',
    },
    {
      step: 2,
      title: 'Week 2: Consistent Baseline Routine',
      subtitle: 'Week 2: Coursework begins, rhythm remains steady',
      status: 'stable',
      mood: 4,
      stress: 2,
      sleep: 4,
      energy: 4,
      social: 4,
      focus: 4,
      reflection: 'Lectures are engaging. Balance is good so far.',
      engineResult: '🟢 Stable Rhythm (Index: 80/100)',
      explanation: 'Week 2 matches Week 1 baseline perfectly. Zero negative trend.',
      storyline:
        'Lectures kick off. Aarav attends classes and continues sleeping 7.5 hours. MannMitra stores this baseline without flagging the counselor.',
    },
    {
      step: 3,
      title: 'Week 3: Early Signs of Strain (First Shift)',
      subtitle: 'Week 3: Lab assignments pile up with midterms approaching',
      status: 'monitor',
      mood: 3,
      stress: 3,
      sleep: 3,
      energy: 3,
      social: 3,
      focus: 3,
      reflection: 'Data Structures assignment deadlines and lab submissions started piling up together.',
      engineResult: '🟡 Active Watchlist (Index: 55/100, -25 pt delta)',
      explanation: 'First week of downward delta across mood, sleep, and focus.',
      storyline:
        'Assignment deadlines start colliding. Aarav begins studying later into the night. His check-in reflects moderate stress and a slight dip in energy. MannMitra marks him for routine observation — not panic.',
    },
    {
      step: 4,
      title: 'Week 4: The Tipping Point (Multi-Indicator Divergence)',
      subtitle: 'Week 4: Sustained decline + academic overload divergence',
      status: 'check_in_recommended',
      mood: 2,
      stress: 5,
      sleep: 2,
      energy: 2,
      social: 3,
      focus: 2,
      reflection: 'Staying up until 3:30 AM every night to catch up on backlog. Brain feels foggy in morning lectures.',
      engineResult: '🔴 Check-in Recommended (Index: 28/100, 3-week decline streak)',
      explanation: 'Triggered Rule R-01 (3 consecutive drops) and Rule R-03 (Academic overload divergence).',
      storyline:
        'Aarav is now struggling with sleep deprivation and heavy project stress. Notice what MannMitra does: It does NOT say "Aarav has clinical depression." It flags a significant longitudinal pattern change.',
    },
    {
      step: 5,
      title: 'The Impact: Proactive Support Before a Crisis',
      subtitle: 'Week 4: Counselor Dr. Ananya reaches out with a gentle touchpoint',
      status: 'action',
      mood: 2,
      stress: 5,
      sleep: 2,
      energy: 2,
      social: 3,
      focus: 2,
      reflection: '',
      engineResult: '🤝 Proactive Intervention Successful',
      explanation: 'Counselor uses AI-synthesized briefing to start a low-pressure conversation.',
      storyline:
        'Dr. Ananya receives the early-warning triage alert with safe conversation starters. She invites Aarav for tea, assists him in pacing his lab deadlines, and prevents an academic crisis.',
    },
  ];

  const current = steps[currentStep - 1];

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto">
      {/* Story Mode Header */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="flex items-center gap-2 text-amber-200 text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-4 h-4" />
          <span>Interactive Hackathon Story Mode • Live Demo Walkthrough</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          "Meet Aarav: The Power of Pattern Early-Warning"
        </h1>
        <p className="text-xs sm:text-sm text-amber-100 mt-1 max-w-2xl">
          Follow Aarav's 4-week journey to see how MannMitra detects multi-dimensional changes in wellbeing over time — without ever making a false psychiatric diagnosis.
        </p>

        {/* Step Progress Pills */}
        <div className="grid grid-cols-5 gap-2 mt-6 pt-6 border-t border-amber-500/40">
          {steps.map((s) => (
            <button
              key={s.step}
              onClick={() => setCurrentStep(s.step)}
              className={`p-2 sm:p-3 rounded-xl text-left transition-all ${
                currentStep === s.step
                  ? 'bg-white text-slate-900 shadow-md font-bold'
                  : 'bg-white/10 text-amber-100 hover:bg-white/20'
              }`}
            >
              <span className="text-[10px] block opacity-80 uppercase">
                {s.step === 5 ? 'Outcome' : `Week ${s.step}`}
              </span>
              <span className="text-xs sm:text-sm block truncate">
                {s.step === 5 ? 'Support' : `Status ${s.step}`}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
              Step {currentStep} of {steps.length}
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
              {current.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">{current.subtitle}</p>
          </div>

          {/* Status Indicator Badge */}
          <div>
            {current.status === 'stable' && (
              <span className="px-4 py-2 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                🟢 Stable Rhythm
              </span>
            )}
            {current.status === 'monitor' && (
              <span className="px-4 py-2 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
                🟡 Monitor (Shift Detected)
              </span>
            )}
            {current.status === 'check_in_recommended' && (
              <span className="px-4 py-2 rounded-full text-xs font-bold bg-rose-100 text-rose-900 border border-rose-300 flex items-center gap-1.5 animate-pulse">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                🔴 Check-in Recommended
              </span>
            )}
            {current.status === 'action' && (
              <span className="px-4 py-2 rounded-full text-xs font-bold bg-teal-100 text-teal-900 border border-teal-300 flex items-center gap-1.5">
                <HeartHandshake className="w-4 h-4 text-teal-700" />
                🤝 Support Activated
              </span>
            )}
          </div>
        </div>

        {/* Story Narrative Box */}
        <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-sm text-amber-950 leading-relaxed font-medium">
          {current.storyline}
        </div>

        {/* Indicator Sliders for this Week */}
        {currentStep <= 4 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100 text-center">
              <span className="text-[11px] text-emerald-800 font-semibold block">Mood</span>
              <span className="text-xl font-bold text-emerald-950 mt-1 block">
                {current.mood}/5
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-100 text-center">
              <span className="text-[11px] text-amber-800 font-semibold block">
                Academic Stress
              </span>
              <span className="text-xl font-bold text-amber-950 mt-1 block">
                {current.stress}/5
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-100 text-center">
              <span className="text-[11px] text-indigo-800 font-semibold block">Sleep Quality</span>
              <span className="text-xl font-bold text-indigo-950 mt-1 block">
                {current.sleep}/5
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-teal-50 border border-teal-100 text-center">
              <span className="text-[11px] text-teal-800 font-semibold block">Energy Level</span>
              <span className="text-xl font-bold text-teal-950 mt-1 block">
                {current.energy}/5
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-purple-50 border border-purple-100 text-center">
              <span className="text-[11px] text-purple-800 font-semibold block">Social</span>
              <span className="text-xl font-bold text-purple-950 mt-1 block">
                {current.social}/5
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-sky-50 border border-sky-100 text-center">
              <span className="text-[11px] text-sky-800 font-semibold block">Focus</span>
              <span className="text-xl font-bold text-sky-950 mt-1 block">
                {current.focus}/5
              </span>
            </div>
          </div>
        )}

        {/* Pattern Engine Deterministic Output */}
        <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Brain className="w-4 h-4" />
              <span>Deterministic Pattern Engine Rationale</span>
            </span>
            <span className="text-xs font-mono text-slate-400">
              Zero Diagnostic Hallucination
            </span>
          </div>
          <div className="text-sm font-semibold text-white">
            {current.engineResult}
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {current.explanation}
          </p>
        </div>

        {/* Step 5 Special Showcase: Pitch Clincher */}
        {currentStep === 5 && (
          <div className="p-6 rounded-2xl bg-teal-50 border border-teal-200 text-center space-y-4">
            <h3 className="text-xl font-bold text-teal-950">
              "MannMitra doesn't wait for a student to ask for help. It helps institutions notice when something has changed."
            </h3>
            <p className="text-xs text-teal-800 max-w-xl mx-auto">
              By detecting multi-week pattern shifts rather than relying on flawed clinical AI diagnoses, MannMitra creates an ethical, defensible safety net.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={onSwitchToCounselor}
                className="px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs sm:text-sm shadow-md transition-colors"
              >
                Open Counselor Dashboard
              </button>
              <button
                onClick={onSwitchToStudent}
                className="px-5 py-2.5 rounded-xl bg-white border border-teal-300 text-teal-900 font-bold text-xs sm:text-sm hover:bg-teal-100 transition-colors"
              >
                Open Student Portal
              </button>
            </div>
          </div>
        )}

        {/* Step Navigation Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
              currentStep === 1
                ? 'text-slate-300 cursor-not-allowed'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous Week</span>
          </button>

          <span className="text-xs text-slate-400 font-medium">
            Week {currentStep} of {steps.length}
          </span>

          <button
            onClick={() => setCurrentStep(Math.min(steps.length, currentStep + 1))}
            disabled={currentStep === steps.length}
            className={`px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              currentStep === steps.length
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs'
            }`}
          >
            <span>Next Step</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
