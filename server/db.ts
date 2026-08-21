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
  check_ins: DBCheckIn[];
  counselor_actions: DBCounselorAction[];
  voice_reflections: DBVoiceReflection[];
}

let inMemoryDB: DatabaseSchema = {
  students: [],
  check_ins: [],
  counselor_actions: [],
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
      inMemoryDB = JSON.parse(raw);
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

  // 5. UPDATE students SET ... WHERE id = ?
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

  // SELECT COUNT(*) as count FROM students
  if (normalized.includes('SELECT COUNT(*)')) {
    return { count: inMemoryDB.students.length } as unknown as T;
  }

  return undefined;
}

export async function dbAll<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const normalized = sql.trim().replace(/\s+/g, ' ');

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

  return [] as T[];
}

export async function initDatabase() {
  console.log('Initializing MannMitra persistent database store at:', DB_FILE);

  const loaded = loadFromDisk();
  if (loaded && inMemoryDB.students.length > 0) {
    console.log(`Loaded ${inMemoryDB.students.length} students from disk store.`);
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

  persistToDisk();
  console.log(`Database seeded with ${inMemoryDB.students.length} students and ${inMemoryDB.check_ins.length} check-ins.`);
}
