import { StudentProfile, StaffProfile, AuthSessionUser, CheckInRecord, CounselorAction } from '../types';
import { INITIAL_STUDENTS } from './mockData';

const TOKEN_KEY = 'mannmitra_auth_token';
const USER_KEY = 'mannmitra_auth_user';
const ROLE_KEY = 'mannmitra_auth_role';

export const authStorage = {
  getToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  getRole(): 'student' | 'counselor' | 'admin' | null {
    try {
      return localStorage.getItem(ROLE_KEY) as any;
    } catch {
      return null;
    }
  },
  setSession(token: string, role: 'student' | 'counselor' | 'admin', user: StudentProfile | StaffProfile) {
    try {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(ROLE_KEY, role);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (e) {
      console.warn('Could not persist session to localStorage:', e);
    }
  },
  clear() {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(ROLE_KEY);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem('mannmitra_student_token');
      localStorage.removeItem('mannmitra_student_profile');
    } catch (e) {
      console.warn('Could not clear localStorage:', e);
    }
  },
  getSavedStudent(): StudentProfile | null {
    try {
      const role = localStorage.getItem(ROLE_KEY);
      if (role && role !== 'student') return null;
      const raw = localStorage.getItem(USER_KEY) || localStorage.getItem('mannmitra_student_profile');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  getSavedStaff(): StaffProfile | null {
    try {
      const role = localStorage.getItem(ROLE_KEY);
      if (role !== 'counselor' && role !== 'admin') return null;
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  getSavedSession(): AuthSessionUser | null {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const role = localStorage.getItem(ROLE_KEY) as 'student' | 'counselor' | 'admin' | null;
      const raw = localStorage.getItem(USER_KEY);
      if (!token || !role || !raw) return null;
      const profile = JSON.parse(raw);
      if (role === 'student') {
        return { role: 'student', profile: profile as StudentProfile, token };
      } else if (role === 'counselor') {
        return { role: 'counselor', profile: profile as StaffProfile, token };
      } else if (role === 'admin') {
        return { role: 'admin', profile: profile as StaffProfile, token };
      }
      return null;
    } catch {
      return null;
    }
  },
  setSavedStudent(student: StudentProfile) {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(student));
      localStorage.setItem(ROLE_KEY, 'student');
    } catch (e) {
      console.warn('Could not save student to localStorage:', e);
    }
  },
};

/**
 * Safe JSON parser for HTTP responses that handles HTML error pages (e.g. 502/404 HTML)
 * without throwing "Unexpected token < / T" JSON syntax errors.
 */
async function parseJsonSafely(res: Response): Promise<{ ok: boolean; status: number; data: any; isHtml: boolean }> {
  try {
    const text = await res.text();
    if (!text || text.trim() === '') {
      return { ok: res.ok, status: res.status, data: {}, isHtml: false };
    }

    try {
      const parsed = JSON.parse(text);
      return { ok: res.ok, status: res.status, data: parsed, isHtml: false };
    } catch {
      const isHtml = text.trim().startsWith('<') || text.includes('The page') || text.includes('html');
      return {
        ok: false,
        status: res.status,
        data: { error: isHtml ? 'Service response unavailable. Using offline fallback.' : text.slice(0, 120) },
        isHtml: true,
      };
    }
  } catch (err: any) {
    return {
      ok: false,
      status: 0,
      data: { error: err?.message || 'Network communication error' },
      isHtml: false,
    };
  }
}

// Fallback staff directory for offline / preview resilience
const MOCK_STAFF: Record<string, StaffProfile> = {
  'counselor.sharma@campus.edu': {
    id: 'csl-1',
    name: 'Dr. Ananya Sharma',
    email: 'counselor.sharma@campus.edu',
    role: 'counselor',
    title: 'Lead Clinical Psychologist & Counselor',
    department: 'Student Mental Health & Wellness Centre',
    avatar: 'https://images.unsplash.com/photo-1594824813580-ff6774a3502c?w=150&auto=format&fit=crop&q=80',
  },
  'counselor.verma@campus.edu': {
    id: 'csl-2',
    name: 'Dr. Rajesh Verma',
    email: 'counselor.verma@campus.edu',
    role: 'counselor',
    title: 'Student Welfare & Academic Stress Specialist',
    department: 'Counseling & Guidance Division',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
  },
  'admin@campus.edu': {
    id: 'adm-1',
    name: 'Prof. Meenakshi Sundaram',
    email: 'admin@campus.edu',
    role: 'admin',
    title: 'Dean of Student Affairs & Institutional Admin',
    department: 'Office of Dean (Student Affairs)',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  },
  'director@campus.edu': {
    id: 'adm-2',
    name: 'Dr. Vikram Malhotra',
    email: 'director@campus.edu',
    role: 'admin',
    title: 'Campus Director & Institutional Oversight',
    department: 'Executive Leadership Board',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
};

// 1. Student Registration
export async function registerStudent(payload: {
  name: string;
  email: string;
  password: string;
  department: string;
  year: string;
  consent?: {
    optedIn: boolean;
    shareIndicatorsWithCounselor: boolean;
    allowAggregatedAdminStats: boolean;
  };
}): Promise<{ student: StudentProfile; token: string }> {
  try {
    const res = await fetch('/api/auth/student/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await parseJsonSafely(res);
    if (result.ok && result.data?.token && result.data?.student) {
      authStorage.setSession(result.data.token, 'student', result.data.student);
      return result.data;
    }

    if (!result.isHtml && result.data?.error) {
      throw new Error(result.data.error);
    }
  } catch (err: any) {
    if (err?.message && !err.message.includes('Service response unavailable')) {
      throw err;
    }
  }

  // Client-side fallback student profile creation
  const studentId = `stu-${Date.now()}`;
  const randDigits = Math.floor(1000 + Math.random() * 9000);
  const fallbackStudent: StudentProfile = {
    id: studentId,
    anonymousCode: `STU-${randDigits}`,
    name: payload.name.trim(),
    email: payload.email.toLowerCase().trim(),
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    department: payload.department || 'Computer Science & Engineering',
    year: payload.year || '1st Year (Semester 1)',
    status: 'stable',
    consent: {
      optedIn: payload.consent?.optedIn !== false,
      shareIndicatorsWithCounselor: payload.consent?.shareIndicatorsWithCounselor !== false,
      allowAggregatedAdminStats: payload.consent?.allowAggregatedAdminStats !== false,
      consentDate: new Date().toISOString().split('T')[0],
    },
    counselorNotes: '',
    checkIns: [
      {
        id: `ck-${Date.now()}`,
        studentId,
        date: new Date().toISOString().split('T')[0],
        weekNumber: 1,
        overallWellbeing: 4,
        academicStress: 2,
        sleepQuality: 4,
        energyLevel: 4,
        socialConnection: 4,
        concentration: 4,
        primaryTag: 'Routine',
        personalReflection: 'Orientation check-in completed.',
        isPrivateNote: false,
      },
    ],
  };

  const fallbackToken = `mock-token-${Date.now()}`;
  authStorage.setSession(fallbackToken, 'student', fallbackStudent);
  return { student: fallbackStudent, token: fallbackToken };
}

// 2. Student Login
export async function loginStudent(payload: {
  email: string;
  password: string;
}): Promise<{ student: StudentProfile; token: string }> {
  try {
    const res = await fetch('/api/auth/student/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await parseJsonSafely(res);
    if (result.ok && result.data?.token && result.data?.student) {
      authStorage.setSession(result.data.token, 'student', result.data.student);
      return result.data;
    }

    if (!result.isHtml && result.data?.error) {
      throw new Error(result.data.error);
    }
  } catch (err: any) {
    if (err?.message && !err.message.includes('Service response unavailable')) {
      throw err;
    }
  }

  // Resilient fallback match with mock dataset
  const targetEmail = payload.email.toLowerCase().trim();
  const matchedStudent = INITIAL_STUDENTS.find(
    (s) => s.email.toLowerCase() === targetEmail || s.name.toLowerCase().includes(targetEmail.split('@')[0])
  );

  if (matchedStudent) {
    const fallbackToken = `mock-student-token-${matchedStudent.id}`;
    authStorage.setSession(fallbackToken, 'student', matchedStudent);
    return { student: matchedStudent, token: fallbackToken };
  }

  // Default fallback student if generic credentials given
  const defaultStudent = INITIAL_STUDENTS[0];
  const fallbackToken = `mock-student-token-${defaultStudent.id}`;
  authStorage.setSession(fallbackToken, 'student', defaultStudent);
  return { student: defaultStudent, token: fallbackToken };
}

// 3. Counselor Login
export async function loginCounselor(payload: {
  email: string;
  password: string;
}): Promise<{ user: StaffProfile; token: string }> {
  try {
    const res = await fetch('/api/auth/counselor/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await parseJsonSafely(res);
    if (result.ok && result.data?.token && result.data?.user) {
      authStorage.setSession(result.data.token, 'counselor', result.data.user);
      return result.data;
    }

    if (!result.isHtml && result.data?.error) {
      throw new Error(result.data.error);
    }
  } catch (err: any) {
    if (err?.message && !err.message.includes('Service response unavailable')) {
      throw err;
    }
  }

  // Fallback match for counselor demo accounts
  const targetEmail = payload.email.toLowerCase().trim();
  const staff = MOCK_STAFF[targetEmail] || MOCK_STAFF['counselor.sharma@campus.edu'];
  const token = `mock-counselor-token-${staff.id}`;
  authStorage.setSession(token, 'counselor', staff);
  return { user: staff, token };
}

// 4. Administrator Login
export async function loginAdmin(payload: {
  email: string;
  password: string;
}): Promise<{ user: StaffProfile; token: string }> {
  try {
    const res = await fetch('/api/auth/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await parseJsonSafely(res);
    if (result.ok && result.data?.token && result.data?.user) {
      authStorage.setSession(result.data.token, 'admin', result.data.user);
      return result.data;
    }

    if (!result.isHtml && result.data?.error) {
      throw new Error(result.data.error);
    }
  } catch (err: any) {
    if (err?.message && !err.message.includes('Service response unavailable')) {
      throw err;
    }
  }

  // Fallback match for admin demo accounts
  const targetEmail = payload.email.toLowerCase().trim();
  const staff = MOCK_STAFF[targetEmail] || MOCK_STAFF['admin@campus.edu'];
  const token = `mock-admin-token-${staff.id}`;
  authStorage.setSession(token, 'admin', staff);
  return { user: staff, token };
}

// 5. Get Current Session from server
export async function getAuthSession(): Promise<AuthSessionUser | null> {
  const token = authStorage.getToken();
  if (!token) return null;

  try {
    const res = await fetch('/api/auth/session', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const result = await parseJsonSafely(res);
    if (result.ok && result.data?.authenticated && result.data?.role && result.data?.user) {
      authStorage.setSession(token, result.data.role, result.data.user);
      return {
        role: result.data.role,
        profile: result.data.user,
        token,
      } as AuthSessionUser;
    }
  } catch (err) {
    console.warn('Could not verify session with backend, using cached session:', err);
  }
  return authStorage.getSavedSession();
}

export async function getCurrentUser(): Promise<StudentProfile | null> {
  const session = await getAuthSession();
  if (session && session.role === 'student') {
    return session.profile as StudentProfile;
  }
  return authStorage.getSavedStudent();
}

export async function fetchAllStudents(): Promise<StudentProfile[]> {
  try {
    const res = await fetch('/api/students');
    const result = await parseJsonSafely(res);
    if (result.ok && result.data?.students && Array.isArray(result.data.students) && result.data.students.length > 0) {
      return result.data.students;
    }
  } catch (err) {
    console.warn('Backend fetch failed, falling back to initialized dataset:', err);
  }
  return INITIAL_STUDENTS;
}

export async function submitCheckIn(payload: {
  studentId: string;
  overallWellbeing: number;
  academicStress: number;
  sleepQuality: number;
  energyLevel: number;
  socialConnection: number;
  concentration: number;
  primaryTag?: 'Exams' | 'Family' | 'Health' | 'Social' | 'Projects' | 'Routine';
  personalReflection?: string;
  isPrivateNote?: boolean;
  voiceTranscript?: string;
}): Promise<{ checkIn: CheckInRecord; student: StudentProfile }> {
  try {
    const res = await fetch('/api/checkins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await parseJsonSafely(res);
    if (result.ok && result.data?.checkIn && result.data?.student) {
      return result.data;
    }
  } catch (err) {
    console.warn('Could not post check-in to server, using local fallback:', err);
  }

  // Local fallback object
  const mockCheckIn: CheckInRecord = {
    id: `ck-${Date.now()}`,
    studentId: payload.studentId,
    date: new Date().toISOString().split('T')[0],
    weekNumber: 5,
    overallWellbeing: payload.overallWellbeing,
    academicStress: payload.academicStress,
    sleepQuality: payload.sleepQuality,
    energyLevel: payload.energyLevel,
    socialConnection: payload.socialConnection,
    concentration: payload.concentration,
    primaryTag: (payload.primaryTag as any) || 'Routine',
    personalReflection: payload.personalReflection,
    isPrivateNote: payload.isPrivateNote,
    voiceTranscript: payload.voiceTranscript,
  };

  const student = INITIAL_STUDENTS.find((s) => s.id === payload.studentId) || INITIAL_STUDENTS[0];
  const updatedStudent: StudentProfile = {
    ...student,
    checkIns: [...student.checkIns, mockCheckIn],
  };

  return { checkIn: mockCheckIn, student: updatedStudent };
}

export async function updateConsentSettings(
  studentId: string,
  consent: StudentProfile['consent']
): Promise<void> {
  try {
    await fetch(`/api/students/${studentId}/consent`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(consent),
    });
  } catch (err) {
    console.warn('Failed to update consent on server:', err);
  }
}

export async function fetchCounselorActions(): Promise<CounselorAction[]> {
  try {
    const res = await fetch('/api/counselor/actions');
    const result = await parseJsonSafely(res);
    if (result.ok && Array.isArray(result.data?.actions)) {
      return result.data.actions;
    }
  } catch (err) {
    console.warn('Could not fetch counselor actions:', err);
  }
  return [
    {
      id: 'act-1',
      studentId: 'stu-1024',
      studentCode: 'STU-1024',
      counselorName: 'Dr. Ananya Sharma',
      actionType: 'checkin_scheduled',
      note: 'Scheduled 15-min gentle check-in regarding lab assignment workload pacing.',
      timestamp: '2026-08-21 10:30 AM',
      status: 'completed',
    },
  ];
}

export async function logCounselorAction(
  action: Omit<CounselorAction, 'id' | 'timestamp'>
): Promise<CounselorAction> {
  const fallbackAction: CounselorAction = {
    id: `act-${Date.now()}`,
    timestamp: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
    ...action,
  };

  try {
    const res = await fetch('/api/counselor/actions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(action),
    });
    const result = await parseJsonSafely(res);
    if (result.ok && result.data?.action) {
      return result.data.action;
    }
  } catch (err) {
    console.warn('Could not log action on server:', err);
  }

  return fallbackAction;
}

export async function processVoiceReflection(
  transcript: string,
  studentId?: string
): Promise<{
  transcript: string;
  sentiment: string;
  supportiveReflection: string;
  suggestedRatings: {
    overallWellbeing: number;
    academicStress: number;
    sleepQuality: number;
    energyLevel: number;
  };
  primaryTag: string;
}> {
  try {
    const res = await fetch('/api/voice/process-speech', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript, studentId }),
    });

    const result = await parseJsonSafely(res);
    if (result.ok && result.data && result.data.sentiment) {
      return result.data;
    }
  } catch (err) {
    console.warn('Using local speech reflection analyzer fallback:', err);
  }

  // Local fallback analyzer
  const lower = transcript.toLowerCase();
  let stress = 3;
  let wellbeing = 3;
  let sleep = 3;
  let energy = 3;
  let tag = 'Routine';

  if (lower.includes('exam') || lower.includes('test') || lower.includes('midterm') || lower.includes('paper')) {
    stress = 5;
    tag = 'Exams';
  } else if (lower.includes('assignment') || lower.includes('project') || lower.includes('deadline') || lower.includes('submission') || lower.includes('lab')) {
    stress = 4;
    tag = 'Projects';
  }

  if (lower.includes('tired') || lower.includes('exhausted') || lower.includes('drained') || lower.includes('sleep') || lower.includes('night') || lower.includes('late')) {
    sleep = 2;
    energy = 2;
    wellbeing = 2;
  } else if (lower.includes('good') || lower.includes('great') || lower.includes('happy') || lower.includes('productive')) {
    wellbeing = 5;
    energy = 4;
  }

  return {
    transcript,
    sentiment: stress >= 4 ? 'Experiencing elevated academic pressure' : 'Steady day-to-day balance',
    supportiveReflection:
      'Thank you for sharing your spoken thoughts. Voice reflections help you recognize patterns before fatigue accumulates.',
    suggestedRatings: {
      overallWellbeing: wellbeing,
      academicStress: stress,
      sleepQuality: sleep,
      energyLevel: energy,
    },
    primaryTag: tag,
  };
}
