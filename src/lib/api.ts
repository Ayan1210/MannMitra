import { StudentProfile, CheckInRecord, CounselorAction } from '../types';
import { INITIAL_STUDENTS } from './mockData';

const TOKEN_KEY = 'mannmitra_student_token';
const USER_KEY = 'mannmitra_student_profile';

export const authStorage = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },
  setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
  getSavedStudent(): StudentProfile | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  setSavedStudent(student: StudentProfile) {
    localStorage.setItem(USER_KEY, JSON.stringify(student));
  },
};

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
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Registration failed');
  }

  authStorage.setToken(data.token);
  authStorage.setSavedStudent(data.student);
  return data;
}

export async function loginStudent(payload: {
  email: string;
  password: string;
}): Promise<{ student: StudentProfile; token: string }> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Login failed');
  }

  authStorage.setToken(data.token);
  authStorage.setSavedStudent(data.student);
  return data;
}

export async function getCurrentUser(): Promise<StudentProfile | null> {
  const token = authStorage.getToken();
  if (!token) return null;

  try {
    const res = await fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      if (data.student) {
        authStorage.setSavedStudent(data.student);
        return data.student;
      }
    }
  } catch (err) {
    console.warn('Could not verify session with backend, using cached profile:', err);
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
