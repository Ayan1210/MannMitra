import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import { INITIAL_STUDENTS } from '../src/lib/mockData';

const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_FILE = path.join(DATA_DIR, 'mannmitra_db.json');

export interface DBStudent {
  id: string;
  anonymous_code: string;
  name: string;
  email: string;
  password_hash: string;
  avatar: string;
  department: string;
  year: string;
  opted_in: number;
  share_indicators: number;
  allow_stats: number;
  consent_date: string;
  counselor_notes?: string;
  status: string;
}

export interface DBStaffUser {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: 'counselor' | 'admin';
  title: string;
  department?: string;
  avatar: string;
}

export interface DBCheckIn {
  id: string;
  student_id: string;
  date: string;
  week_number: number;
  overall_wellbeing: number;
  academic_stress: number;
  sleep_quality: number;
  energy_level: number;
  social_connection: number;
  concentration: number;
  primary_tag: string;
  personal_reflection?: string | null;
  is_private_note: number;
  voice_transcript?: string | null;
}

export interface DBCounselorAction {
  id: string;
  student_id: string;
  student_code: string;
  counselor_name: string;
  action_type: string;
  note: string;
  timestamp: string;
  status: string;
  created_at?: string;
}

export interface DBCounselorMeeting {
  id: string;
  student_id: string;
  student_code?: string;
  student_name?: string;
  counselor_id: string;
  counselor_name?: string;
  date: string;
  time: string;
  duration: string;
  mode: string;
  note?: string;
  status: string;
  created_at: string;
}

export interface DBCounselorNotification {
  id: string;
  counselor_id?: string | null;
  student_id: string;
  student_code?: string | null;
  message: string;
  is_read: number;
  created_at: string;
}

export interface DBStudentNotification {
  id: string;
  student_id: string;
  meeting_id?: string | null;
  message: string;
  date?: string | null;
  time?: string | null;
  duration?: string | null;
  mode?: string | null;
  general_message?: string | null;
  is_read: number;
  created_at: string;
}

export interface DBVoiceReflection {
  id: string;
  student_id?: string;
  transcript: string;
  sentiment: string;
  supportive_reflection: string;
  created_at: string;
}

interface DatabaseSchema {
  students: DBStudent[];
  staff_users: DBStaffUser[];
  check_ins: DBCheckIn[];
  counselor_actions: DBCounselorAction[];
  counselor_meetings: DBCounselorMeeting[];
  counselor_notifications: DBCounselorNotification[];
  student_notifications: DBStudentNotification[];
  voice_reflections: DBVoiceReflection[];
}

let inMemoryDB: DatabaseSchema = {
  students: [],
  staff_users: [],
  check_ins: [],
  counselor_actions: [],
  counselor_meetings: [],
  counselor_notifications: [],
  student_notifications: [],
  voice_reflections: [],
};

// Save to disk atomically
function persistToDisk() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(inMemoryDB, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write database file to disk:', err);
  }
}

// Load from disk if exists
function loadFromDisk(): boolean {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const data = JSON.parse(raw);
      inMemoryDB = {
        students: data.students || [],
        staff_users: data.staff_users || [],
        check_ins: data.check_ins || [],
        counselor_actions: data.counselor_actions || [],
        counselor_meetings: data.counselor_meetings || [],
        counselor_notifications: data.counselor_notifications || [],
        student_notifications: data.student_notifications || [],
        voice_reflections: data.voice_reflections || [],
      };
      return true;
    }
  } catch (err) {
    console.warn('Could not read existing DB file, using fresh schema:', err);
  }
  return false;
}

// Promisified SQL query executor
export async function dbRun(sql: string, params: any[] = []): Promise<{ lastID: number; changes: number }> {
  const normalized = sql.trim().replace(/\s+/g, ' ');

  // 1. INSERT INTO students
  if (normalized.startsWith('INSERT INTO students')) {
    const [
      id, anonymous_code, name, email, password_hash, avatar, department, year,
      opted_in, share_indicators, allow_stats, consent_date, status
    ] = params;

    const newStudent: DBStudent = {
      id,
      anonymous_code,
      name,
      email: email.toLowerCase().trim(),
      password_hash,
      avatar,
      department,
      year,
      opted_in: Number(opted_in),
      share_indicators: Number(share_indicators),
      allow_stats: Number(allow_stats),
      consent_date,
      status: status || 'stable',
    };

    inMemoryDB.students.push(newStudent);
    persistToDisk();
    return { lastID: inMemoryDB.students.length, changes: 1 };
  }

  // 2. INSERT INTO check_ins
  if (normalized.startsWith('INSERT INTO check_ins')) {
    const [
      id, student_id, date, week_number, overall_wellbeing, academic_stress,
      sleep_quality, energy_level, social_connection, concentration,
      primary_tag, personal_reflection, is_private_note, voice_transcript
    ] = params;

    const newCheckIn: DBCheckIn = {
      id,
      student_id,
      date,
      week_number: Number(week_number),
      overall_wellbeing: Number(overall_wellbeing),
      academic_stress: Number(academic_stress),
      sleep_quality: Number(sleep_quality),
      energy_level: Number(energy_level),
      social_connection: Number(social_connection),
      concentration: Number(concentration),
      primary_tag: primary_tag || 'Routine',
      personal_reflection: personal_reflection || null,
      is_private_note: Number(is_private_note),
      voice_transcript: voice_transcript || null,
    };

    inMemoryDB.check_ins.push(newCheckIn);
    persistToDisk();
    return { lastID: inMemoryDB.check_ins.length, changes: 1 };
  }

  // 3. INSERT INTO counselor_actions
  if (normalized.startsWith('INSERT INTO counselor_actions')) {
    const [id, student_id, student_code, counselor_name, action_type, note, timestamp, status] = params;
    const newAction: DBCounselorAction = {
      id,
      student_id,
      student_code,
      counselor_name,
      action_type,
      note,
      timestamp,
      status: status || 'completed',
      created_at: new Date().toISOString(),
    };
    inMemoryDB.counselor_actions.unshift(newAction);
    persistToDisk();
    return { lastID: inMemoryDB.counselor_actions.length, changes: 1 };
  }

  // 4. INSERT INTO voice_reflections
  if (normalized.startsWith('INSERT INTO voice_reflections')) {
    const [id, student_id, transcript, sentiment, supportive_reflection] = params;
    const newVR: DBVoiceReflection = {
      id,
      student_id,
      transcript,
      sentiment,
      supportive_reflection,
      created_at: new Date().toISOString(),
    };
    inMemoryDB.voice_reflections.unshift(newVR);
    persistToDisk();
    return { lastID: inMemoryDB.voice_reflections.length, changes: 1 };
  }

  // 5. INSERT INTO counselor_notifications
  if (normalized.startsWith('INSERT INTO counselor_notifications')) {
    const [id, counselor_id, student_id, student_code, message, is_read, created_at] = params;
    const newNotif: DBCounselorNotification = {
      id,
      counselor_id: counselor_id || null,
      student_id,
      student_code: student_code || null,
      message: message || 'New wellbeing concern requires review.',
      is_read: Number(is_read) || 0,
      created_at: created_at || new Date().toISOString(),
    };
    if (!inMemoryDB.counselor_notifications) {
      inMemoryDB.counselor_notifications = [];
    }
    inMemoryDB.counselor_notifications.unshift(newNotif);
    persistToDisk();
    return { lastID: inMemoryDB.counselor_notifications.length, changes: 1 };
  }

  // 6. INSERT INTO counselor_meetings
  if (normalized.startsWith('INSERT INTO counselor_meetings')) {
    const [
      id,
      student_id,
      student_code,
      student_name,
      counselor_id,
      counselor_name,
      date,
      time,
      duration,
      mode,
      note,
      status,
      created_at,
    ] = params;
    const newMeeting: DBCounselorMeeting = {
      id,
      student_id,
      student_code: student_code || undefined,
      student_name: student_name || undefined,
      counselor_id: counselor_id || 'csl-1',
      counselor_name: counselor_name || 'Dr. Ananya Sharma',
      date,
      time,
      duration: duration || '20 minutes',
      mode: mode || 'In-person',
      note: note || '',
      status: status || 'Scheduled',
      created_at: created_at || new Date().toISOString(),
    };
    if (!inMemoryDB.counselor_meetings) {
      inMemoryDB.counselor_meetings = [];
    }
    inMemoryDB.counselor_meetings.unshift(newMeeting);
    persistToDisk();
    return { lastID: inMemoryDB.counselor_meetings.length, changes: 1 };
  }

  // 7. UPDATE counselor_meetings SET ... WHERE id = ?
  if (normalized.includes('UPDATE counselor_meetings SET') && normalized.includes('WHERE id = ?')) {
    if (!inMemoryDB.counselor_meetings) {
      inMemoryDB.counselor_meetings = [];
    }
    const targetId = params[params.length - 1];
    const meeting = inMemoryDB.counselor_meetings.find((m) => m.id === targetId);
    if (meeting) {
      if (normalized.includes('date = ?') && params.length >= 7) {
        const [date, time, duration, mode, note, status] = params;
        if (date !== undefined) meeting.date = date;
        if (time !== undefined) meeting.time = time;
        if (duration !== undefined) meeting.duration = duration;
        if (mode !== undefined) meeting.mode = mode;
        if (note !== undefined) meeting.note = note;
        if (status !== undefined) meeting.status = status;
      } else if (normalized.includes('status = ?') && normalized.includes('note = ?') && params.length === 3) {
        const [status, note] = params;
        if (status !== undefined) meeting.status = status;
        if (note !== undefined) meeting.note = note;
      } else if (normalized.includes('status = ?') && params.length === 2) {
        meeting.status = params[0];
      } else if (normalized.includes('note = ?') && params.length === 2) {
        meeting.note = params[0];
      }
      persistToDisk();
      return { lastID: 0, changes: 1 };
    }
  }

  // 8. UPDATE counselor_notifications SET is_read = ? WHERE id = ?
  if (normalized.includes('UPDATE counselor_notifications SET is_read = ? WHERE id = ?')) {
    const [is_read, id] = params;
    if (inMemoryDB.counselor_notifications) {
      const notif = inMemoryDB.counselor_notifications.find((n) => n.id === id);
      if (notif) {
        notif.is_read = Number(is_read);
        persistToDisk();
        return { lastID: 0, changes: 1 };
      }
    }
  }

  // 9. UPDATE counselor_notifications SET is_read = ? (e.g. read all)
  if (normalized.includes('UPDATE counselor_notifications SET is_read = ?') && !normalized.includes('WHERE id = ?')) {
    const [is_read] = params;
    if (inMemoryDB.counselor_notifications) {
      inMemoryDB.counselor_notifications.forEach((n) => {
        n.is_read = Number(is_read);
      });
      persistToDisk();
      return { lastID: 0, changes: inMemoryDB.counselor_notifications.length };
    }
  }

  // 10. INSERT INTO student_notifications
  if (normalized.startsWith('INSERT INTO student_notifications')) {
    const [
      id,
      student_id,
      meeting_id,
      message,
      date,
      time,
      duration,
      mode,
      general_message,
      is_read,
      created_at,
    ] = params;
    const newNotif: DBStudentNotification = {
      id,
      student_id,
      meeting_id: meeting_id || null,
      message,
      date: date || null,
      time: time || null,
      duration: duration || null,
      mode: mode || null,
      general_message: general_message || null,
      is_read: Number(is_read || 0),
      created_at: created_at || new Date().toISOString(),
    };
    if (!inMemoryDB.student_notifications) {
      inMemoryDB.student_notifications = [];
    }
    inMemoryDB.student_notifications.unshift(newNotif);
    persistToDisk();
    return { lastID: inMemoryDB.student_notifications.length, changes: 1 };
  }

  // 11. UPDATE student_notifications SET is_read = ? WHERE id = ?
  if (normalized.includes('UPDATE student_notifications SET is_read = ? WHERE id = ?')) {
    const [is_read, id] = params;
    if (inMemoryDB.student_notifications) {
      const notif = inMemoryDB.student_notifications.find((n) => n.id === id);
      if (notif) {
        notif.is_read = Number(is_read);
        persistToDisk();
        return { lastID: 0, changes: 1 };
      }
    }
  }

  // 12. UPDATE students SET ... WHERE id = ?
  if (normalized.includes('UPDATE students SET')) {
    const [opted_in, share_indicators, allow_stats, consent_date, id] = params;
    const student = inMemoryDB.students.find((s) => s.id === id);
    if (student) {
      student.opted_in = Number(opted_in);
      student.share_indicators = Number(share_indicators);
      student.allow_stats = Number(allow_stats);
      student.consent_date = consent_date;
      persistToDisk();
      return { lastID: 0, changes: 1 };
    }
  }

  return { lastID: 0, changes: 0 };
}

export async function dbGet<T = any>(sql: string, params: any[] = []): Promise<T | undefined> {
  const normalized = sql.trim().replace(/\s+/g, ' ');

  // SELECT * FROM staff_users WHERE email = ?
  if (normalized.includes('FROM staff_users WHERE email = ?') || normalized.includes('FROM staff_users WHERE LOWER(email) = ?')) {
    const targetEmail = String(params[0]).toLowerCase().trim();
    const found = inMemoryDB.staff_users.find((s) => s.email.toLowerCase() === targetEmail);
    return found as unknown as T;
  }

  // SELECT * FROM staff_users WHERE id = ?
  if (normalized.includes('FROM staff_users WHERE id = ?')) {
    const targetId = params[0];
    const found = inMemoryDB.staff_users.find((s) => s.id === targetId);
    return found as unknown as T;
  }

  // SELECT id FROM students WHERE email = ?
  if (normalized.includes('FROM students WHERE email = ?') || normalized.includes('FROM students WHERE LOWER(email) = ?')) {
    const targetEmail = String(params[0]).toLowerCase().trim();
    const found = inMemoryDB.students.find((s) => s.email.toLowerCase() === targetEmail);
    return found as unknown as T;
  }

  // SELECT * FROM students WHERE id = ?
  if (normalized.includes('FROM students WHERE id = ?')) {
    const targetId = params[0];
    const found = inMemoryDB.students.find((s) => s.id === targetId);
    return found as unknown as T;
  }

  // SELECT * FROM counselor_notifications WHERE id = ?
  if (normalized.includes('FROM counselor_notifications WHERE id = ?')) {
    const targetId = params[0];
    const found = inMemoryDB.counselor_notifications?.find((n) => n.id === targetId);
    return found as unknown as T;
  }

  // SELECT * FROM counselor_meetings WHERE id = ?
  if (normalized.includes('FROM counselor_meetings WHERE id = ?')) {
    const targetId = params[0];
    const found = inMemoryDB.counselor_meetings?.find((m) => m.id === targetId);
    return found as unknown as T;
  }

  // SELECT COUNT(*) as count FROM students
  if (normalized.includes('SELECT COUNT(*)')) {
    return { count: inMemoryDB.students.length } as unknown as T;
  }

  return undefined;
}

export async function dbAll<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const normalized = sql.trim().replace(/\s+/g, ' ');

  // SELECT * FROM staff_users
  if (normalized.startsWith('SELECT * FROM staff_users')) {
    return inMemoryDB.staff_users as unknown as T[];
  }

  // SELECT * FROM students
  if (normalized.startsWith('SELECT * FROM students')) {
    const sorted = [...inMemoryDB.students].sort((a, b) => a.name.localeCompare(b.name));
    return sorted as unknown as T[];
  }

  // SELECT * FROM check_ins WHERE student_id = ?
  if (normalized.includes('FROM check_ins WHERE student_id = ?')) {
    const targetStudentId = params[0];
    const checkIns = inMemoryDB.check_ins
      .filter((c) => c.student_id === targetStudentId)
      .sort((a, b) => a.week_number - b.week_number);
    return checkIns as unknown as T[];
  }

  // SELECT * FROM check_ins
  if (normalized.startsWith('SELECT * FROM check_ins')) {
    const sorted = [...inMemoryDB.check_ins].sort((a, b) => a.week_number - b.week_number);
    return sorted as unknown as T[];
  }

  // SELECT * FROM counselor_actions
  if (normalized.startsWith('SELECT * FROM counselor_actions')) {
    return inMemoryDB.counselor_actions as unknown as T[];
  }

  // SELECT * FROM counselor_meetings WHERE student_id = ?
  if (normalized.includes('FROM counselor_meetings WHERE student_id = ?')) {
    const targetStudentId = params[0];
    if (!inMemoryDB.counselor_meetings) {
      inMemoryDB.counselor_meetings = [];
    }
    const filtered = inMemoryDB.counselor_meetings
      .filter((m) => m.student_id === targetStudentId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return filtered as unknown as T[];
  }

  // SELECT * FROM counselor_meetings
  if (normalized.startsWith('SELECT * FROM counselor_meetings')) {
    if (!inMemoryDB.counselor_meetings) {
      inMemoryDB.counselor_meetings = [];
    }
    const sorted = [...inMemoryDB.counselor_meetings].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    return sorted as unknown as T[];
  }

  // SELECT * FROM counselor_notifications
  if (normalized.startsWith('SELECT * FROM counselor_notifications')) {
    if (!inMemoryDB.counselor_notifications) {
      inMemoryDB.counselor_notifications = [];
    }
    const sorted = [...inMemoryDB.counselor_notifications].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    return sorted as unknown as T[];
  }

  // SELECT * FROM student_notifications WHERE student_id = ?
  if (normalized.includes('FROM student_notifications WHERE student_id = ?')) {
    const targetStudentId = params[0];
    if (!inMemoryDB.student_notifications) {
      inMemoryDB.student_notifications = [];
    }
    const filtered = inMemoryDB.student_notifications
      .filter((n) => n.student_id === targetStudentId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return filtered as unknown as T[];
  }

  // SELECT * FROM student_notifications
  if (normalized.startsWith('SELECT * FROM student_notifications')) {
    if (!inMemoryDB.student_notifications) {
      inMemoryDB.student_notifications = [];
    }
    const sorted = [...inMemoryDB.student_notifications].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    return sorted as unknown as T[];
  }

  return [] as T[];
}

export async function initDatabase() {
  console.log('Initializing MannMitra persistent database store at:', DB_FILE);

  const loaded = loadFromDisk();

  // If staff_users is missing in previously persisted DB, initialize them
  if (!inMemoryDB.staff_users || inMemoryDB.staff_users.length === 0) {
    inMemoryDB.staff_users = [];
    const counselorHash = await bcrypt.hash('counselor123', 10);
    const adminHash = await bcrypt.hash('admin123', 10);

    inMemoryDB.staff_users.push(
      {
        id: 'csl-1',
        name: 'Dr. Ananya Sharma',
        email: 'counselor.sharma@campus.edu',
        password_hash: counselorHash,
        role: 'counselor',
        title: 'Lead Clinical Psychologist & Counselor',
        department: 'Student Mental Health & Wellness Centre',
        avatar: 'https://images.unsplash.com/photo-1594824813580-ff6774a3502c?w=150&auto=format&fit=crop&q=80',
      },
      {
        id: 'csl-2',
        name: 'Dr. Rajesh Verma',
        email: 'counselor.verma@campus.edu',
        password_hash: counselorHash,
        role: 'counselor',
        title: 'Student Welfare & Academic Stress Specialist',
        department: 'Counseling & Guidance Division',
        avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
      },
      {
        id: 'adm-1',
        name: 'Prof. Meenakshi Sundaram',
        email: 'admin@campus.edu',
        password_hash: adminHash,
        role: 'admin',
        title: 'Dean of Student Affairs & Institutional Admin',
        department: 'Office of Dean (Student Affairs)',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      },
      {
        id: 'adm-2',
        name: 'Dr. Vikram Malhotra',
        email: 'director@campus.edu',
        password_hash: adminHash,
        role: 'admin',
        title: 'Campus Director & Institutional Oversight',
        department: 'Executive Leadership Board',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      }
    );
    persistToDisk();
  }

  if (loaded && inMemoryDB.students.length > 0) {
    console.log(`Loaded ${inMemoryDB.students.length} students and ${inMemoryDB.staff_users.length} staff accounts from disk.`);
    return;
  }

  // Seed default students
  const defaultPasswordHash = await bcrypt.hash('password123', 10);

  for (const student of INITIAL_STUDENTS) {
    const dbStudent: DBStudent = {
      id: student.id,
      anonymous_code: student.anonymousCode,
      name: student.name,
      email: `${student.name.toLowerCase().replace(/\s+/g, '.')}@campus.edu`,
      password_hash: defaultPasswordHash,
      avatar: student.avatar,
      department: student.department,
      year: student.year,
      opted_in: student.consent.optedIn ? 1 : 0,
      share_indicators: student.consent.shareIndicatorsWithCounselor ? 1 : 0,
      allow_stats: student.consent.allowAggregatedAdminStats ? 1 : 0,
      consent_date: student.consent.consentDate,
      counselor_notes: student.counselorNotes,
      status: student.status,
    };

    inMemoryDB.students.push(dbStudent);

    for (const ck of student.checkIns) {
      const dbCheckIn: DBCheckIn = {
        id: ck.id,
        student_id: student.id,
        date: ck.date,
        week_number: ck.weekNumber,
        overall_wellbeing: ck.overallWellbeing,
        academic_stress: ck.academicStress,
        sleep_quality: ck.sleepQuality,
        energy_level: ck.energyLevel,
        social_connection: ck.socialConnection,
        concentration: ck.concentration,
        primary_tag: ck.primaryTag || 'Routine',
        personal_reflection: ck.personalReflection,
        is_private_note: ck.isPrivateNote ? 1 : 0,
        voice_transcript: ck.voiceTranscript || null,
      };

      inMemoryDB.check_ins.push(dbCheckIn);
    }
  }

  // Seed initial counselor action
  inMemoryDB.counselor_actions.push({
    id: 'act-1',
    student_id: 'stu-1024',
    student_code: 'STU-1024',
    counselor_name: 'Dr. Ananya Sharma',
    action_type: 'checkin_scheduled',
    note: 'Scheduled 15-min gentle check-in regarding lab assignment workload pacing.',
    timestamp: '2026-08-21 10:30 AM',
    status: 'completed',
    created_at: new Date().toISOString(),
  });

  // Seed initial counselor meetings
  if (!inMemoryDB.counselor_meetings || inMemoryDB.counselor_meetings.length === 0) {
    inMemoryDB.counselor_meetings = [
      {
        id: 'meet-seed-1',
        student_id: 'stu-1024',
        student_code: 'STU-1024',
        student_name: 'Aarav Patel',
        counselor_id: 'csl-1',
        counselor_name: 'Dr. Ananya Sharma',
        date: '2026-08-25',
        time: '11:30 AM',
        duration: '20 minutes',
        mode: 'In-person',
        note: 'Proactive check-in regarding lab workload pacing and routine stabilization.',
        status: 'Scheduled',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      },
      {
        id: 'meet-seed-2',
        student_id: 'stu-2048',
        student_code: 'STU-2048',
        student_name: 'Priya Iyer',
        counselor_id: 'csl-1',
        counselor_name: 'Dr. Ananya Sharma',
        date: '2026-08-21',
        time: '09:30 AM',
        duration: '20 minutes',
        mode: 'In-person',
        note: 'Discussed academic workload and sleep routine. Follow-up recommended next week.',
        status: 'Completed',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
      },
      {
        id: 'meet-seed-3',
        student_id: 'stu-3096',
        student_code: 'STU-3096',
        student_name: 'Rohan Verma',
        counselor_id: 'csl-1',
        counselor_name: 'Dr. Ananya Sharma',
        date: '2026-08-26',
        time: '02:00 PM',
        duration: '30 minutes',
        mode: 'Online',
        note: 'Rescheduled per student request to avoid lab midterm clash.',
        status: 'Rescheduled',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      },
    ];
  }

  // Seed initial counselor notifications for students requiring review
  if (!inMemoryDB.counselor_notifications || inMemoryDB.counselor_notifications.length === 0) {
    inMemoryDB.counselor_notifications = [
      {
        id: 'notif-seed-1',
        counselor_id: 'csl-1',
        student_id: 'stu-1024',
        student_code: 'STU-1024',
        message: 'New wellbeing concern requires review.',
        is_read: 0,
        created_at: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
      },
      {
        id: 'notif-seed-2',
        counselor_id: 'csl-1',
        student_id: 'stu-2048',
        student_code: 'STU-2048',
        message: 'New wellbeing concern requires review.',
        is_read: 0,
        created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      },
    ];
  }

  // Seed initial student notifications
  if (!inMemoryDB.student_notifications || inMemoryDB.student_notifications.length === 0) {
    inMemoryDB.student_notifications = [
      {
        id: 'st-notif-seed-1',
        student_id: 'stu-1024',
        meeting_id: 'meet-seed-1',
        message: 'Your counselor has scheduled a 1-on-1 check-in for 25 August at 11:30 AM.',
        date: '2026-08-25',
        time: '11:30 AM',
        duration: '20 minutes',
        mode: 'In-person',
        general_message: 'Gentle check-in regarding lab assignment workload pacing and sleep rhythm.',
        is_read: 0,
        created_at: new Date().toISOString(),
      },
    ];
  }

  persistToDisk();
  console.log(`Database seeded with ${inMemoryDB.students.length} students, ${inMemoryDB.staff_users.length} staff, and ${inMemoryDB.check_ins.length} check-ins.`);
}
