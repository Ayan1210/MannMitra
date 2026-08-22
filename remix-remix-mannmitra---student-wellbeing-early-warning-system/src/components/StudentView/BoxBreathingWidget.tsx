import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Wind } from 'lucide-react';

export const BoxBreathingWidget: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<'Inhale' | 'Hold (Full)' | 'Exhale' | 'Hold (Empty)'>('Inhale');
  const [timer, setTimer] = useState(4);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev > 1) {
            return prev - 1;
          } else {
            // Next phase
            setPhase((currentPhase) => {
              switch (currentPhase) {
                case 'Inhale':
                  return 'Hold (Full)';
                case 'Hold (Full)':
                  return 'Exhale';
                case 'Exhale':
                  return 'Hold (Empty)';
                case 'Hold (Empty)':
                  setCyclesCompleted((c) => c + 1);
                  return 'Inhale';
              }
            });
            return 4;
          }
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const handleReset = () => {
    setIsActive(false);
    setPhase('Inhale');
    setTimer(4);
    setCyclesCompleted(0);
  };

  const getPhaseInstruction = () => {
    switch (phase) {
      case 'Inhale':
        return 'Breathe in slowly through your nose...';
      case 'Hold (Full)':
        return 'Hold lungs comfortably full...';
      case 'Exhale':
        return 'Release breath slowly through mouth...';
      case 'Hold (Empty)':
        return 'Rest comfortably before next breath...';
    }
  };

  const getScaleClass = () => {
    if (!isActive) return 'scale-100 bg-emerald-500/20';
    if (phase === 'Inhale') return 'scale-125 bg-emerald-500/40 duration-4000';
    if (phase === 'Hold (Full)') return 'scale-125 bg-teal-500/40 duration-1000';
    if (phase === 'Exhale') return 'scale-90 bg-sky-500/40 duration-4000';
    return 'scale-90 bg-indigo-500/20 duration-1000';
  };

  return (
    <div className="bg-gradient-to-br from-emerald-900 to-teal-950 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-white/10 text-emerald-300">
            <Wind className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">Box Breathing (Sama Vritti)</h3>
            <p className="text-xs text-emerald-200/80">4-4-4-4 physiological reset for high study stress</p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/10 text-emerald-200">
          Cycles: {cyclesCompleted}
        </span>
      </div>

      <div className="flex flex-col items-center justify-center py-6">
        {/* Animated breathing circle */}
        <div className="relative flex items-center justify-center w-44 h-44">
          <div
            className={`absolute inset-0 rounded-full transition-transform ease-in-out border-2 border-emerald-400/30 ${getScaleClass()}`}
          />
          <div className="z-10 text-center">
            <span className="text-4xl font-extrabold tracking-tight text-white block">
              {isActive ? timer : '4s'}
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 mt-1 block">
              {isActive ? phase : 'Ready'}
            </span>
          </div>
        </div>

        <p className="text-xs text-emerald-100 mt-4 text-center min-h-[1.5rem] font-medium">
          {isActive ? getPhaseInstruction() : 'Press start to begin a calm 4-second box breathing cycle.'}
        </p>

        {/* Controls */}
        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={() => setIsActive(!isActive)}
            className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md shadow-emerald-500/20"
          >
            {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isActive ? 'Pause' : 'Start Breathing'}</span>
          </button>
          <button
            onClick={handleReset}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
