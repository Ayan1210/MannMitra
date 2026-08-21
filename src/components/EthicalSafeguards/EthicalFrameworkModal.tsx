import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Award,
  HelpCircle,
  CheckCircle2,
  Lock,
  Heart,
  Scale,
  Brain,
  FileText,
} from 'lucide-react';

interface EthicalFrameworkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EthicalFrameworkModal: React.FC<EthicalFrameworkModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeSection, setActiveSection] = useState<'pillars' | 'judge_qa'>('pillars');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-6 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 p-6 text-white relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-emerald-300 text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>WHO Guidance & Responsible AI Framework</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold mt-1 text-white">
            Why MannMitra is Scientifically Defensible
          </h2>
          <p className="text-emerald-100 text-xs sm:text-sm mt-1">
            Built on non-diagnostic early warning, deterministic pattern auditability, and radical privacy.
          </p>

          {/* Tab Switcher */}
          <div className="flex items-center gap-2 mt-6 border-b border-emerald-700/60 -mb-6 pb-2 text-xs font-semibold">
            <button
              onClick={() => setActiveSection('pillars')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeSection === 'pillars'
                  ? 'bg-white text-emerald-900 shadow-xs'
                  : 'text-emerald-200 hover:text-white'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>5 Core Ethical Pillars</span>
            </button>
            <button
              onClick={() => setActiveSection('judge_qa')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeSection === 'judge_qa'
                  ? 'bg-white text-emerald-900 shadow-xs'
                  : 'text-emerald-200 hover:text-white'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>Hackathon Judge Q&A Cheat Sheet</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50">
          {activeSection === 'pillars' && (
            <div className="space-y-4">
              {/* Pillar 1 */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-xs">
                    1
                  </span>
                  <span>Early Warning, NOT Psychiatric Diagnosis</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed pl-8">
                  We never claim "AI detects depression or mental illness." Instead, MannMitra detects multi-dimensional changes in self-reported wellbeing indicators (sleep, academic workload, energy, social connection) to help human counselors decide who may benefit from a check-in.
                </p>
              </div>

              {/* Pillar 2 */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1.5">
                <div className="flex items-center gap-2 text-teal-700 font-bold text-sm">
                  <span className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center text-xs">
                    2
                  </span>
                  <span>Deterministic Rule Engine for Scoring (Zero Black-Box)</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed pl-8">
                  Triage classifications (Stable → Monitor → Check-in Recommended) are calculated using mathematically transparent rules (decline streaks, academic stress divergence). Every alert produces an auditable trigger code so counselors understand exactly why a student was prioritized.
                </p>
              </div>

              {/* Pillar 3 */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1.5">
                <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm">
                  <span className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs">
                    3
                  </span>
                  <span>Safe, Non-Diagnostic AI Assistant for Counselors</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed pl-8">
                  AI (Gemini) is only utilized downstream to generate a 2-sentence briefing and non-threatening conversation openers for the certified counselor, saving prep time while maintaining clinical human oversight.
                </p>
              </div>

              {/* Pillar 4 */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1.5">
                <div className="flex items-center gap-2 text-purple-700 font-bold text-sm">
                  <span className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-xs">
                    4
                  </span>
                  <span>Consent-First, Anti-Surveillance Architecture</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed pl-8">
                  Students own 100% of their data with granular opt-in and revocation rights. College administrators only receive k-anonymized cohort aggregates (e.g. "28% of 1st years reported increased workload") and are technically barred from viewing individual student names.
                </p>
              </div>

              {/* Pillar 5 */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1.5">
                <div className="flex items-center gap-2 text-sky-700 font-bold text-sm">
                  <span className="w-6 h-6 rounded-full bg-sky-100 flex items-center justify-center text-xs">
                    5
                  </span>
                  <span>WHO Digital Wellbeing & Environmental Context Alignment</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed pl-8">
                  Aligned with WHO guidelines on young people's digital wellbeing, emphasizing school-based psychosocial support, non-punitive workload adjustments, and safe digital safeguards.
                </p>
              </div>
            </div>
          )}

          {activeSection === 'judge_qa' && (
            <div className="space-y-4">
              {/* QA 1 */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                <h4 className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 text-xs font-mono font-bold">
                    Judge Q1
                  </span>
                  <span>"How do you know your algorithm is actually accurate?"</span>
                </h4>
                <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700 leading-relaxed border border-slate-200">
                  <span className="font-bold text-emerald-800 block mb-1">
                    Defensible Answer:
                  </span>
                  "MannMitra does not claim to diagnose or predict mental illness. Our prototype detects changes in self-reported wellbeing and prioritizes counselor review. The thresholds are configurable and would need validation with qualified mental-health professionals and real-world pilot data before deployment."
                </div>
              </div>

              {/* QA 2 */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                <h4 className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-xs font-mono font-bold">
                    Judge Q2
                  </span>
                  <span>"Won't students fear being monitored or penalized by the college?"</span>
                </h4>
                <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700 leading-relaxed border border-slate-200">
                  <span className="font-bold text-emerald-800 block mb-1">
                    Defensible Answer:
                  </span>
                  "MannMitra is strictly not surveillance. We enforce role-based segregation: administrators never see individual student names or scores, only anonymized cohort trends. Participation is 100% opt-in, with instant data deletion rights."
                </div>
              </div>

              {/* QA 3 */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                <h4 className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-teal-100 text-teal-800 text-xs font-mono font-bold">
                    Judge Q3
                  </span>
                  <span>"Why not use an LLM directly to score student risk?"</span>
                </h4>
                <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700 leading-relaxed border border-slate-200">
                  <span className="font-bold text-emerald-800 block mb-1">
                    Defensible Answer:
                  </span>
                  "LLMs are probabilistic and prone to hallucination when calculating clinical scores. Using a deterministic scoring engine guarantees reproducible, auditable mathematical logic. We only deploy LLMs safely to summarize longitudinal context for counselor prep."
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500 font-medium">
            MannMitra • WHO Youth Psychosocial Guidance Compliant
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
