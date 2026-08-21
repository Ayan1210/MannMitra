import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Sparkles, CheckCircle2, RotateCcw, AlertCircle, Play, Pause, HeartHandshake } from 'lucide-react';
import { processVoiceReflection } from '../../lib/api';

interface VoiceReflectionWidgetProps {
  studentId: string;
  onApplyToCheckIn?: (data: {
    reflectionText: string;
    ratings?: {
      overallWellbeing: number;
      academicStress: number;
      sleepQuality: number;
      energyLevel: number;
    };
    primaryTag?: string;
  }) => void;
}

export const VoiceReflectionWidget: React.FC<VoiceReflectionWidgetProps> = ({
  studentId,
  onApplyToCheckIn,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{
    sentiment: string;
    supportiveReflection: string;
    suggestedRatings?: {
      overallWellbeing: number;
      academicStress: number;
      sleepQuality: number;
      energyLevel: number;
    };
    primaryTag?: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<any>(null);

  // Initialize Speech Recognition API
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript + ' ';
        }
        setTranscript(currentTranscript.trim());
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition notice:', event.error);
        if (event.error === 'not-allowed') {
          setErrorMessage('Microphone access was denied. Please allow microphone permissions in your browser.');
        }
      };

      recognition.onend = () => {
        // Will be restarted if still recording
      };

      recognitionRef.current = recognition;
    } else {
      console.info('Web Speech API not supported in this browser; fallback to audio input.');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startVoiceCapture = async () => {
    setErrorMessage(null);
    setAnalysisResult(null);
    audioChunksRef.current = [];

    try {
      // Audio MediaRecorder for playback
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(200);
      mediaRecorderRef.current = mediaRecorder;

      // Start Web Speech dictation
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          // Already started
        }
      }

      setIsRecording(true);
      setRecordingDuration(0);
      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Microphone error:', err);
      setErrorMessage(
        'Unable to access microphone. Please ensure microphone permissions are granted in your browser.'
      );
    }
  };

  const stopVoiceCapture = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsRecording(false);
  };

  const handleAnalyzeVoice = async () => {
    if (!transcript.trim()) {
      setErrorMessage('Please speak or type a reflection note first.');
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      const result = await processVoiceReflection(transcript, studentId);
      setAnalysisResult(result);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to process voice reflection.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleTogglePlayback = () => {
    if (!audioUrl) return;
    if (!audioPlayerRef.current) {
      audioPlayerRef.current = new Audio(audioUrl);
      audioPlayerRef.current.onended = () => setIsPlayingAudio(false);
    }

    if (isPlayingAudio) {
      audioPlayerRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioPlayerRef.current.play();
      setIsPlayingAudio(true);
    }
  };

  const handleReset = () => {
    setTranscript('');
    setAudioUrl(null);
    setAnalysisResult(null);
    setErrorMessage(null);
    setRecordingDuration(0);
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      setIsPlayingAudio(false);
    }
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainder = sec % 60;
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-100 relative overflow-hidden">
      {/* Accent Background Glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-teal-100/50 to-transparent rounded-bl-full pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center shadow-xs">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <span>Voice Journal & Speech Reflection</span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                Microphone Enabled
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Speak freely about deadlines, feelings, or sleep. MannMitra transcribes and translates your voice into gentle insights.
            </p>
          </div>
        </div>

        {transcript && (
          <button
            onClick={handleReset}
            className="text-xs text-slate-400 hover:text-slate-700 flex items-center gap-1 self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {errorMessage && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Voice Controls & Visualizer */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
          {/* Main Record Button */}
          <button
            type="button"
            onClick={isRecording ? stopVoiceCapture : startVoiceCapture}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-md shrink-0 ${
              isRecording
                ? 'bg-rose-500 hover:bg-rose-600 text-white animate-pulse ring-4 ring-rose-200'
                : 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-600/30'
            }`}
          >
            {isRecording ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>

          {/* Recording Status & Waveform */}
          <div className="flex-1 text-center sm:text-left space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="text-xs font-bold text-slate-800">
                {isRecording ? 'Listening & transcribing...' : audioUrl ? 'Voice captured' : 'Tap to speak your thoughts'}
              </span>
              {isRecording && (
                <span className="text-xs font-mono font-bold text-rose-600 px-2 py-0.5 rounded-md bg-rose-100">
                  {formatSeconds(recordingDuration)}
                </span>
              )}
            </div>

            {/* Audio Wave Bars (Animated when recording) */}
            <div className="flex items-center justify-center sm:justify-start gap-1 h-6">
              {[40, 70, 30, 90, 50, 80, 45, 95, 60, 35, 80, 50, 75, 40].map((h, i) => (
                <div
                  key={i}
                  className={`w-1 rounded-full transition-all duration-150 ${
                    isRecording
                      ? 'bg-teal-500'
                      : audioUrl
                      ? 'bg-slate-400'
                      : 'bg-slate-200'
                  }`}
                  style={{
                    height: isRecording
                      ? `${Math.max(15, (h * ((i % 3) + 1)) % 100)}%`
                      : '25%',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Playback Button if audio recorded */}
          {audioUrl && !isRecording && (
            <button
              onClick={handleTogglePlayback}
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors shadow-xs"
            >
              {isPlayingAudio ? <Pause className="w-3.5 h-3.5 text-teal-600" /> : <Play className="w-3.5 h-3.5 text-teal-600" />}
              <span>{isPlayingAudio ? 'Pause' : 'Play Voice Note'}</span>
            </button>
          )}
        </div>

        {/* Live / Editable Transcript Field */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center justify-between">
            <span>Spoken Reflection Transcript</span>
            <span className="text-[11px] font-normal text-slate-400">Click to edit if needed</span>
          </label>
          <textarea
            rows={3}
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Your spoken words will appear here in real-time as you speak... (e.g. 'I was studying late for computer lab exams and feel tired today')."
            className="w-full text-xs sm:text-sm p-3.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-hidden bg-slate-50/50"
          />
        </div>

        {/* Analyze Button */}
        {transcript && !analysisResult && (
          <button
            onClick={handleAnalyzeVoice}
            disabled={isAnalyzing}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-teal-600/20 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isAnalyzing ? 'Analyzing Spoken Reflection...' : 'Process Voice & Extract Wellbeing Insights'}</span>
          </button>
        )}

        {/* AI Voice Reflection Results */}
        {analysisResult && (
          <div className="p-4 rounded-2xl bg-teal-50/80 border border-teal-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-teal-700" />
                <span className="text-xs font-bold text-teal-950 uppercase tracking-wider">
                  Voice Emotion & Wellbeing Feedback
                </span>
              </div>
              {analysisResult.primaryTag && (
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-teal-200 text-teal-900">
                  🏷️ {analysisResult.primaryTag}
                </span>
              )}
            </div>

            <p className="text-xs text-teal-900 leading-relaxed font-medium">
              "{analysisResult.supportiveReflection}"
            </p>

            {analysisResult.suggestedRatings && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-teal-200/60">
                <div className="p-2 rounded-lg bg-white/80 text-center">
                  <span className="text-[10px] text-slate-500 block">Estimated Mood</span>
                  <span className="text-xs font-bold text-teal-900">
                    {analysisResult.suggestedRatings.overallWellbeing}/5
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-white/80 text-center">
                  <span className="text-[10px] text-slate-500 block">Stress Level</span>
                  <span className="text-xs font-bold text-amber-900">
                    {analysisResult.suggestedRatings.academicStress}/5
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-white/80 text-center">
                  <span className="text-[10px] text-slate-500 block">Sleep Rest</span>
                  <span className="text-xs font-bold text-indigo-900">
                    {analysisResult.suggestedRatings.sleepQuality}/5
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-white/80 text-center">
                  <span className="text-[10px] text-slate-500 block">Energy</span>
                  <span className="text-xs font-bold text-emerald-900">
                    {analysisResult.suggestedRatings.energyLevel}/5
                  </span>
                </div>
              </div>
            )}

            {onApplyToCheckIn && (
              <button
                onClick={() =>
                  onApplyToCheckIn({
                    reflectionText: transcript,
                    ratings: analysisResult.suggestedRatings,
                    primaryTag: analysisResult.primaryTag,
                  })
                }
                className="w-full mt-2 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Apply Spoken Notes to Weekly Check-in Form</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
