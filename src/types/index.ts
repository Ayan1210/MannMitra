export type Role = 'student' | 'counselor' | 'admin' | 'story_mode';

export type WellBeingStatus = 'stable' | 'monitor' | 'check_in_recommended';

export type TrendDirection = 'improving' | 'stable' | 'declining';

export interface CheckInRecord {
  id: string;
  studentId: string;
  date: string; // ISO or YYYY-MM-DD
  weekNumber: number;
  // 1-5 scales:
  overallWellbeing: number; // 1 (struggling) to 5 (doing great)
  academicStress: number;   // 1 (very manageable) to 5 (overwhelming)
  sleepQuality: number;     // 1 (very poor) to 5 (excellent)
  energyLevel: number;      // 1 (exhausted) to 5 (energetic)
  socialConnection: number; // 1 (isolated) to 5 (connected)
  concentration: number;    // 1 (very difficult) to 5 (sharp)
  // Context
  primaryTag?: 'Exams' | 'Family' | 'Health' | 'Social' | 'Projects' | 'Routine';
  personalReflection?: string;
  isPrivateNote?: boolean; // Only visible to student, not counselor
}

export interface StudentProfile {
  id: string;
  anonymousCode: string; // e.g. STU-1024
  name: string;
  email: string;
  avatar: string;
  department: string;
  year: string;
  consent: {
    optedIn: boolean;
    shareIndicatorsWithCounselor: boolean;
    allowAggregatedAdminStats: boolean;
    consentDate: string;
  };
  checkIns: CheckInRecord[];
  counselorNotes?: string;
  status: WellBeingStatus;
}

export interface PatternAnalysisResult {
  studentId: string;
  computedScore: number; // 0 - 100
  status: WellBeingStatus;
  trend: TrendDirection;
  consecutiveDeclines: number;
  scoreDelta: number; // e.g. -1.8
  primaryDrivers: string[];
  explanation: string;
  ruleTriggers: string[];
  recommendedAction: string;
  calculatedAt: string;
}

export interface CounselorAction {
  id: string;
  studentId: string;
  studentCode: string;
  counselorName: string;
  actionType: 'checkin_scheduled' | 'touchpoint_logged' | 'peer_support' | 'wellness_resource' | 'status_override';
  note: string;
  timestamp: string;
  status: 'pending' | 'completed';
}

export interface AISummaryResponse {
  summary: string;
  keyObservations: string[];
  suggestedOpeners: string[];
  disclaimer: string;
  generatedAt: string;
}
