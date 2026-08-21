import { StudentProfile, StaffProfile, AuthSessionUser, CheckInRecord, CounselorAction } from '../types';
import { INITIAL_STUDENTS } from './mockData';

const TOKEN_KEY = 'mannmitra_auth_token';
const USER_KEY = 'mannmitra_auth_user';
const ROLE_KEY = 'mannmitra_auth_role';

export const authStorage = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },
  getRole(): 'student' | 'counselor' | 'admin' | null {
    return localStorage.getItem(ROLE_KEY) as any;
  },
  setSession(token: string, role: 'student' | 'counselor' | 'admin', user: StudentProfile | StaffProfile) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(ROLE_KEY, role);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem('mannmitra_student_token');
    localStorage.removeItem('mannmitra_student_profile');
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
    localStorage.setItem(USER_KEY, JSON.stringify(student));
    localStorage.setItem(ROLE_KEY, 'student');
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
  const res = await fetch('/api/auth/student/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Registration failed');
  }

  authStorage.setSession(data.token, 'student', data.student);
  return data;
}

// 2. Student Login
export async function loginStudent(payload: {
  email: string;
  password: string;
}): Promise<{ student: StudentProfile; token: string }> {
  const res = await fetch('/api/auth/student/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Student login failed');
  }

  authStorage.setSession(data.token, 'student', data.student);
  return data;
}

// 3. Counselor Login
export async function loginCounselor(payload: {
  email: string;
  password: string;
}): Promise<{ user: StaffProfile; token: string }> {
  const res = await fetch('/api/auth/counselor/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Counselor login failed');
  }

  authStorage.setSession(data.token, 'counselor', data.user);
  return data;
}

// 4. Administrator Login
export async function loginAdmin(payload: {
  email: string;
  password: string;
}): Promise<{ user: StaffProfile; token: string }> {
  const res = await fetch('/api/auth/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Administrator login failed');
  }

  authStorage.setSession(data.token, 'admin', data.user);
  return data;
}

// 5. Get Current Session from server
export async function getAuthSession(): Promise<AuthSessionUser | null> {
  const token = authStorage.getToken();
  if (!token) return null;

  try {
    const res = await fetch('/api/auth/session', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      if (data.authenticated && data.role && data.user) {
        authStorage.setSession(token, data.role, data.user);
        return {
          role: data.role,
          profile: data.user,
          token,
        } as AuthSessionUser;
      }
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
    if (res.ok) {
      const data = await res.json();
      if (data.students && data.students.length > 0) {
        return data.students;
      }
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
  primaryTag?: string;
  personalReflection?: string;
  isPrivateNote?: boolean;
  voiceTranscript?: string;
}): Promise<{ checkIn: CheckInRecord; student: StudentProfile }> {
  const res = await fetch('/api/checkins', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to submit check-in');
  }
  return data;
}

export async function updateConsentSettings(
  studentId: string,
  consent: StudentProfile['consent']
): Promise<void> {
  await fetch(`/api/students/${studentId}/consent`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(consent),
  });
}

export async function fetchCounselorActions(): Promise<CounselorAction[]> {
  try {
    const res = await fetch('/api/counselor/actions');
    if (res.ok) {
      const data = await res.json();
      return data.actions || [];
    }
  } catch (err) {
    console.warn('Could not fetch counselor actions:', err);
  }
  return [];
}

export async function logCounselorAction(
  action: Omit<CounselorAction, 'id' | 'timestamp'>
): Promise<CounselorAction> {
  const res = await fetch('/api/counselor/actions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(action),
  });
  const data = await res.json();
  return data.action;
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
  const res = await fetch('/api/voice/process-speech', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transcript, studentId }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to analyze speech');
  }
  return data;
}
