export type Role = 'landing' | 'student' | 'counselor' | 'admin';

export type UserRole = 'student' | 'counselor' | 'admin';

export interface StaffProfile {
  id: string;
  name: string;
  email: string;
  role: 'counselor' | 'admin';
  title: string;
  department?: string;
  avatar: string;
}

export type AuthSessionUser =
  | { role: 'student'; profile: StudentProfile; token: string }
  | { role: 'counselor'; profile: StaffProfile; token: string }
  | { role: 'admin'; profile: StaffProfile; token: string };

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
  voiceTranscript?: string;
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

export interface CounselorMeeting {
  id: string;
  studentId: string;
  studentCode?: string;
  studentName?: string;
  counselorId: string;
  counselorName?: string;
  date: string;
  time: string;
  duration: string;
  mode: 'In-person' | 'Online';
  note?: string;
  status: 'Scheduled' | 'Completed' | 'Rescheduled' | 'Cancelled';
  createdAt: string;
}

export interface CounselorNotification {
  id: string;
  counselorId?: string | null;
  studentId: string;
  studentCode?: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface StudentNotification {
  id: string;
  studentId: string;
  meetingId?: string;
  message: string;
  date?: string;
  time?: string;
  duration?: string;
  mode?: 'In-person' | 'Online';
  isRead: boolean;
  createdAt: string;
}

export interface StudentMeetingInfo {
  id: string;
  counselorName: string;
  date: string;
  time: string;
  duration: string;
  mode: 'In-person' | 'Online';
  status: 'Scheduled' | 'Completed' | 'Rescheduled' | 'Cancelled';
  createdAt: string;
}

export interface AISummaryResponse {
  summary: string;
  keyObservations: string[];
  suggestedOpeners: string[];
  disclaimer: string;
  generatedAt: string;
}
