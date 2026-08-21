import React, { useState } from 'react';
import { X, Heart, Sparkles, Lock, ShieldCheck, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { CheckInRecord } from '../../types';

interface StudentCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (checkIn: Omit<CheckInRecord, 'id' | 'studentId' | 'date' | 'weekNumber'>) => void;
  currentWeekNumber: number;
}

export const StudentCheckInModal: React.FC<StudentCheckInModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  currentWeekNumber,
}) => {
  const [overallWellbeing, setOverallWellbeing] = useState<number>(4);
  const [academicStress, setAcademicStress] = useState<number>(2);
  const [sleepQuality, setSleepQuality] = useState<number>(4);
  const [energyLevel, setEnergyLevel] = useState<number>(4);
  const [socialConnection, setSocialConnection] = useState<number>(4);
  const [concentration, setConcentration] = useState<number>(4);
  const [primaryTag, setPrimaryTag] = useState<'Exams' | 'Family' | 'Health' | 'Social' | 'Projects' | 'Routine'>('Routine');
  const [personalReflection, setPersonalReflection] = useState<string>('');
  const [isPrivateNote, setIsPrivateNote] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Trigger celebratory confetti
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#10b981', '#14b8a6', '#06b6d4', '#6366f1'],
    });

    setTimeout(() => {
      onSubmit({
        overallWellbeing,
        academicStress,
        sleepQuality,
        energyLevel,
        socialConnection,
        concentration,
        primaryTag,
        personalReflection: personalReflection.trim() || undefined,
        isPrivateNote,
      });
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  const getMoodEmoji = (val: number) => {
    switch (val) {
      case 5:
        return { emoji: '🌟', label: 'Doing great', desc: 'Feeling grounded and optimistic' };
      case 4:
        return { emoji: '😊', label: 'Doing well', desc: 'Smooth week with good balance' };
      case 3:
        return { emoji: '😐', label: 'Okay / Neutral', desc: 'Managing, taking it day by day' };
      case 2:
        return { emoji: '🙁', label: 'Struggling a little', desc: 'Feeling weighed down' };
      case 1:
        return { emoji: '😫', label: 'Having a difficult time', desc: 'Need extra care and space' };
      default:
        return { emoji: '🙂', label: 'Okay', desc: '' };
    }
  };

  const currentMood = getMoodEmoji(overallWellbeing);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-emerald-200 text-xs font-semibold uppercase tracking-wider">
            <Heart className="w-4 h-4 fill-emerald-200" />
            <span>Weekly Wellbeing Check-in • Week {currentWeekNumber + 1}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold mt-1 text-white">How has your week felt?</h2>
          <p className="text-emerald-100 text-xs sm:text-sm mt-1 max-w-lg">
            Takes 60 seconds. Your answers help spot subtle shifts in workload and rest before burnout sets in.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Question 1: Overall Wellbeing */}
          <div className="bg-emerald-50/60 rounded-xl p-4 border border-emerald-100">
            <label className="block text-sm font-semibold text-emerald-950 mb-2">
              1. Overall Wellbeing
              <span className="text-xs font-normal text-emerald-700 block mt-0.5">
                How would you rate your general wellbeing this week?
              </span>
            </label>
            <div className="grid grid-cols-5 gap-2 mt-3">
              {[1, 2, 3, 4, 5].map((val) => {
                const item = getMoodEmoji(val);
                const isSelected = overallWellbeing === val;
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setOverallWellbeing(val)}
                    className={`flex flex-col items-center p-2.5 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md scale-105'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50'
                    }`}
                  >
                    <span className="text-2xl mb-1">{item.emoji}</span>
                    <span className={`text-[11px] font-medium leading-tight ${isSelected ? 'text-white' : 'text-slate-700'}`}>
                      {val}/5
                    </span>
                    <span className={`text-[9px] mt-0.5 hidden sm:block ${isSelected ? 'text-emerald-100' : 'text-slate-500'}`}>
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="mt-2 text-center text-xs text-emerald-900 font-medium">
              Selected: <span className="font-semibold">{currentMood.label}</span> ({currentMood.desc})
            </div>
          </div>

          {/* Indicators Grid */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              Core Wellbeing Dimensions (1 to 5 scale)
            </h3>

            {/* Academic Pressure */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-slate-800">
                  2. Academic Pressure & Workload
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900">
                  {academicStress === 1
                    ? '1/5 (Very Manageable)'
                    : academicStress === 3
                    ? '3/5 (Moderate Workload)'
                    : academicStress === 5
                    ? '5/5 (Overwhelming)'
                    : `${academicStress}/5`}
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-3">
                How manageable has your study, lab submissions, and lecture load felt?
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Easy</span>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={academicStress}
                  onChange={(e) => setAcademicStress(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                />
                <span className="text-xs text-slate-400">Heavy</span>
              </div>
            </div>

            {/* Sleep Quality */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-slate-800">
                  3. Sleep Restfulness & Rhythm
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-900">
                  {sleepQuality === 1
                    ? '1/5 (Poor / Insomnia)'
                    : sleepQuality === 3
                    ? '3/5 (Fair)'
                    : sleepQuality === 5
                    ? '5/5 (Deep & Refreshing)'
                    : `${sleepQuality}/5`}
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-3">
                How restorative and consistent has your sleep been recently?
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Disrupted</span>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={sleepQuality}
                  onChange={(e) => setSleepQuality(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <span className="text-xs text-slate-400">Restful</span>
              </div>
            </div>

            {/* Energy Level */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-slate-800">
                  4. Daily Energy Level
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-teal-100 text-teal-900">
                  {energyLevel === 1
                    ? '1/5 (Exhausted)'
                    : energyLevel === 3
                    ? '3/5 (Moderate)'
                    : energyLevel === 5
                    ? '5/5 (High Energy)'
                    : `${energyLevel}/5`}
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-3">
                How energetic have you felt carrying out your regular day?
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Drained</span>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={energyLevel}
                  onChange={(e) => setEnergyLevel(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                />
                <span className="text-xs text-slate-400">Energetic</span>
              </div>
            </div>

            {/* Social Connection */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-slate-800">
                  5. Social Connection
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-purple-100 text-purple-900">
                  {socialConnection === 1
                    ? '1/5 (Isolated)'
                    : socialConnection === 3
                    ? '3/5 (Neutral)'
                    : socialConnection === 5
                    ? '5/5 (Very Connected)'
                    : `${socialConnection}/5`}
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-3">
                How connected do you feel to friends, peers, or hostel mates?
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Alone</span>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={socialConnection}
                  onChange={(e) => setSocialConnection(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
                <span className="text-xs text-slate-400">Supported</span>
              </div>
            </div>

            {/* Concentration */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-slate-800">
                  6. Focus & Concentration
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-sky-100 text-sky-900">
                  {concentration === 1
                    ? '1/5 (Hard to Focus)'
                    : concentration === 3
                    ? '3/5 (Average)'
                    : concentration === 5
                    ? '5/5 (Sharp & Clear)'
                    : `${concentration}/5`}
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-3">
                How manageable has it been to maintain attention in class and study sessions?
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Scattered</span>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={concentration}
                  onChange={(e) => setConcentration(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
                />
                <span className="text-xs text-slate-400">Sharp</span>
              </div>
            </div>
          </div>

          {/* Primary Factor Tag */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Primary theme on your mind this week (optional)
            </label>
            <div className="flex flex-wrap gap-2">
              {(['Routine', 'Projects', 'Exams', 'Social', 'Health', 'Family'] as const).map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setPrimaryTag(tag)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    primaryTag === tag
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Optional Reflection Note */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Optional Reflection Note
              </label>
              <button
                type="button"
                onClick={() => setIsPrivateNote(!isPrivateNote)}
                className={`text-[11px] flex items-center gap-1 font-medium transition-colors ${
                  isPrivateNote ? 'text-amber-700 font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Lock className="w-3 h-3" />
                <span>{isPrivateNote ? 'Private: Only visible to me' : 'Shared with counselor'}</span>
              </button>
            </div>
            <textarea
              rows={2}
              value={personalReflection}
              onChange={(e) => setPersonalReflection(e.target.value)}
              placeholder="Any context you'd like to remember? e.g., 'Late night lab assignment submissions due Friday'..."
              className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          {/* Consent / Privacy Reminder */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-800">Consent & Privacy Safe:</span> You can withdraw consent or edit sharing preferences anytime. Counselors only review multi-week aggregate trend signals to offer timely support.
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving...' : 'Save Check-in'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
