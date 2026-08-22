import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { dbRun, dbGet, dbAll, initDatabase } from './server/db';
import { analyzeWellbeingPattern } from './src/lib/patternEngine';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'mannmitra-secret-key-2026';
const PORT = Number(process.env.PORT) || 3000;

const app = express();
app.use(express.json({ limit: '15mb' }));

// Helper to format student profile from DB row + checkins
function formatStudentProfile(row: any, checkIns: any[] = []) {
  return {
    id: row.id,
    anonymousCode: row.anonymous_code,
    name: row.name,
    email: row.email,
    avatar: row.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    department: row.department,
    year: row.year,
    consent: {
      optedIn: Boolean(row.opted_in),
      shareIndicatorsWithCounselor: Boolean(row.share_indicators),
      allowAggregatedAdminStats: Boolean(row.allow_stats),
      consentDate: row.consent_date || new Date().toISOString().split('T')[0],
    },
    counselorNotes: row.counselor_notes || '',
    status: row.status || 'stable',
    checkIns: checkIns.map((c) => ({
      id: c.id,
      studentId: c.student_id,
      date: c.date,
      weekNumber: c.week_number,
      overallWellbeing: c.overall_wellbeing,
      academicStress: c.academic_stress,
      sleepQuality: c.sleep_quality,
      energyLevel: c.energy_level,
      socialConnection: c.social_connection,
      concentration: c.concentration,
      primaryTag: c.primary_tag,
      personalReflection: c.personal_reflection,
      isPrivateNote: Boolean(c.is_private_note),
      voiceTranscript: c.voice_transcript,
    })),
  };
}

// -------------------------------------------------------------
// Auth Middleware
// -------------------------------------------------------------
interface AuthUserToken {
  id: string;
  email: string;
  role: 'student' | 'counselor' | 'admin';
  name?: string;
}

interface AuthRequest extends Request {
  user?: AuthUserToken;
}

function authenticateToken(req: AuthRequest, res: Response, next: Function) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = decoded;
    next();
  });
}

function requireRole(allowedRoles: ('student' | 'counselor' | 'admin')[]) {
  return (req: AuthRequest, res: Response, next: Function) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access Denied: Requires authorized [${allowedRoles.join(', ')}] privileges.`,
      });
    }
    next();
  };
}

// -------------------------------------------------------------
// API Routes
// -------------------------------------------------------------

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', engine: 'Node + Express + SQLite3', timestamp: new Date().toISOString() });
});

// 1. Student Registration
const handleStudentRegister = async (req: Request, res: Response) => {
  try {
    const { name, email, password, department, year, consent } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    // Check if email already exists
    const existing = await dbGet('SELECT id FROM students WHERE email = ?', [email.toLowerCase().trim()]);
    if (existing) {
      return res.status(409).json({ error: 'An account with this campus email already exists.' });
    }

    const studentId = `stu-${Date.now()}`;
    const randDigits = Math.floor(1000 + Math.random() * 9000);
    const anonymousCode = `STU-${randDigits}`;
    const passwordHash = await bcrypt.hash(password, 10);
    const avatar = `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`;
    const today = new Date().toISOString().split('T')[0];

    await dbRun(
      `INSERT INTO students (
        id, anonymous_code, name, email, password_hash, avatar, department, year,
        opted_in, share_indicators, allow_stats, consent_date, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        studentId,
        anonymousCode,
        name.trim(),
        email.toLowerCase().trim(),
        passwordHash,
        avatar,
        department || 'Computer Science & Engineering',
        year || '1st Year (Semester 1)',
        consent?.optedIn !== false ? 1 : 0,
        consent?.shareIndicatorsWithCounselor !== false ? 1 : 0,
        consent?.allowAggregatedAdminStats !== false ? 1 : 0,
        today,
        'stable',
      ]
    );

    // Initial baseline check-in
    const initCheckInId = `ck-${Date.now()}`;
    await dbRun(
      `INSERT INTO check_ins (
        id, student_id, date, week_number, overall_wellbeing, academic_stress,
        sleep_quality, energy_level, social_connection, concentration,
        primary_tag, personal_reflection, is_private_note
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        initCheckInId,
        studentId,
        today,
        1,
        4,
        2,
        4,
        4,
        4,
        4,
        'Routine',
        'Account created. Ready for first semester check-ins.',
        0,
      ]
    );

    const newStudentRow = await dbGet('SELECT * FROM students WHERE id = ?', [studentId]);
    const checkIns = await dbAll('SELECT * FROM check_ins WHERE student_id = ? ORDER BY week_number ASC', [studentId]);
    const studentProfile = formatStudentProfile(newStudentRow, checkIns);

    const token = jwt.sign(
      { id: studentProfile.id, email: studentProfile.email, role: 'student', name: studentProfile.name },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.status(201).json({
      message: 'Student account created successfully',
      role: 'student',
      user: studentProfile,
      student: studentProfile,
      token,
    });
  } catch (err: any) {
    console.error('Error during student registration:', err);
    return res.status(500).json({ error: err?.message || 'Failed to create student account' });
  }
};

app.post('/api/auth/register', handleStudentRegister);
app.post('/api/auth/student/register', handleStudentRegister);

// 2. Student Login
const handleStudentLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const studentRow = await dbGet('SELECT * FROM students WHERE LOWER(email) = ?', [email.toLowerCase().trim()]);
    if (!studentRow) {
      return res.status(401).json({ error: 'Invalid student email or password.' });
    }

    const isValid = await bcrypt.compare(password, studentRow.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid student email or password.' });
    }

    const checkIns = await dbAll('SELECT * FROM check_ins WHERE student_id = ? ORDER BY week_number ASC', [studentRow.id]);
    const studentProfile = formatStudentProfile(studentRow, checkIns);

    const token = jwt.sign(
      { id: studentProfile.id, email: studentProfile.email, role: 'student', name: studentProfile.name },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.json({
      message: 'Student login successful',
      role: 'student',
      user: studentProfile,
      student: studentProfile,
      token,
    });
  } catch (err: any) {
    console.error('Error during student login:', err);
    return res.status(500).json({ error: 'Student login failed' });
  }
};

app.post('/api/auth/login', handleStudentLogin);
app.post('/api/auth/student/login', handleStudentLogin);

// 3. Counselor Login (Dedicated endpoint)
app.post('/api/auth/counselor/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Counselor email and password are required' });
    }

    const staffRow = await dbGet('SELECT * FROM staff_users WHERE LOWER(email) = ?', [email.toLowerCase().trim()]);
    if (!staffRow) {
      // Check if user is a student trying to enter counselor portal
      const studentMatch = await dbGet('SELECT id FROM students WHERE LOWER(email) = ?', [email.toLowerCase().trim()]);
      if (studentMatch) {
        return res.status(403).json({
          error: 'Access Denied: This is a student account. Students are not authorized to access the Counselor portal.',
        });
      }
      return res.status(401).json({ error: 'Invalid counselor credentials' });
    }

    if (staffRow.role !== 'counselor') {
      return res.status(403).json({
        error: 'Access Denied: This account is not authorized as a Counselor.',
      });
    }

    const isValid = await bcrypt.compare(password, staffRow.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid counselor credentials' });
    }

    const staffProfile = {
      id: staffRow.id,
      name: staffRow.name,
      email: staffRow.email,
      role: staffRow.role,
      title: staffRow.title,
      department: staffRow.department,
      avatar: staffRow.avatar,
    };

    const token = jwt.sign(
      { id: staffRow.id, email: staffRow.email, role: 'counselor', name: staffRow.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      message: 'Counselor authentication successful',
      role: 'counselor',
      user: staffProfile,
      token,
    });
  } catch (err: any) {
    console.error('Error during counselor login:', err);
    return res.status(500).json({ error: 'Counselor authentication failed' });
  }
});

// 4. Admin Login (Dedicated endpoint)
app.post('/api/auth/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Administrator email and password are required' });
    }

    const staffRow = await dbGet('SELECT * FROM staff_users WHERE LOWER(email) = ?', [email.toLowerCase().trim()]);
    if (!staffRow) {
      // Check if user is a student trying to enter admin portal
      const studentMatch = await dbGet('SELECT id FROM students WHERE LOWER(email) = ?', [email.toLowerCase().trim()]);
      if (studentMatch) {
        return res.status(403).json({
          error: 'Access Denied: This is a student account. Students are not authorized to access Institutional Admin controls.',
        });
      }
      return res.status(401).json({ error: 'Invalid administrator credentials' });
    }

    if (staffRow.role !== 'admin') {
      return res.status(403).json({
        error: 'Access Denied: This account is not authorized as an Administrator.',
      });
    }

    const isValid = await bcrypt.compare(password, staffRow.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid administrator credentials' });
    }

    const adminProfile = {
      id: staffRow.id,
      name: staffRow.name,
      email: staffRow.email,
      role: staffRow.role,
      title: staffRow.title,
      department: staffRow.department,
      avatar: staffRow.avatar,
    };

    const token = jwt.sign(
      { id: staffRow.id, email: staffRow.email, role: 'admin', name: staffRow.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      message: 'Administrator authentication successful',
      role: 'admin',
      user: adminProfile,
      token,
    });
  } catch (err: any) {
    console.error('Error during admin login:', err);
    return res.status(500).json({ error: 'Administrator authentication failed' });
  }
});

// 5. Get Authenticated Session Profile
app.get('/api/auth/session', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const role = req.user?.role;
    const userId = req.user?.id;

    if (role === 'student') {
      const studentRow = await dbGet('SELECT * FROM students WHERE id = ?', [userId]);
      if (!studentRow) {
        return res.status(404).json({ error: 'Student account not found' });
      }
      const checkIns = await dbAll('SELECT * FROM check_ins WHERE student_id = ? ORDER BY week_number ASC', [userId]);
      const studentProfile = formatStudentProfile(studentRow, checkIns);
      return res.json({
        authenticated: true,
        role: 'student',
        user: studentProfile,
        student: studentProfile,
      });
    }

    if (role === 'counselor' || role === 'admin') {
      const staffRow = await dbGet('SELECT * FROM staff_users WHERE id = ?', [userId]);
      if (!staffRow) {
        return res.status(404).json({ error: 'Staff account not found' });
      }
      const staffProfile = {
        id: staffRow.id,
        name: staffRow.name,
        email: staffRow.email,
        role: staffRow.role,
        title: staffRow.title,
        department: staffRow.department,
        avatar: staffRow.avatar,
      };
      return res.json({
        authenticated: true,
        role: staffRow.role,
        user: staffProfile,
      });
    }

    return res.status(400).json({ error: 'Unknown role in session token' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to verify session' });
  }
});

// Legacy /me route
app.get('/api/auth/me', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const studentRow = await dbGet('SELECT * FROM students WHERE id = ?', [userId]);
    if (!studentRow) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const checkIns = await dbAll('SELECT * FROM check_ins WHERE student_id = ? ORDER BY week_number ASC', [userId]);
    const studentProfile = formatStudentProfile(studentRow, checkIns);

    return res.json({ student: studentProfile });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch student profile' });
  }
});

// 4. Get all students (For Counselor and Admin view)
app.get('/api/students', async (_req, res) => {
  try {
    const studentsRows = await dbAll('SELECT * FROM students ORDER BY name ASC');
    const allCheckIns = await dbAll('SELECT * FROM check_ins ORDER BY week_number ASC');

    const students = studentsRows.map((row) => {
      const studentCheckIns = allCheckIns.filter((c) => c.student_id === row.id);
      return formatStudentProfile(row, studentCheckIns);
    });

    return res.json({ students });
  } catch (err: any) {
    console.error('Error fetching students:', err);
    return res.status(500).json({ error: 'Failed to load students' });
  }
});

// 5. Submit Check-in Record
app.post('/api/checkins', async (req, res) => {
  try {
    const {
      studentId,
      overallWellbeing,
      academicStress,
      sleepQuality,
      energyLevel,
      socialConnection,
      concentration,
      primaryTag,
      personalReflection,
      isPrivateNote,
      voiceTranscript,
    } = req.body;

    if (!studentId) {
      return res.status(400).json({ error: 'studentId is required' });
    }

    // Get current check-in count for this student
    const existingCheckIns = await dbAll('SELECT * FROM check_ins WHERE student_id = ? ORDER BY week_number ASC', [studentId]);
    const weekNumber = existingCheckIns.length + 1;
    const today = new Date().toISOString().split('T')[0];
    const checkInId = `ck-${Date.now()}`;

    await dbRun(
      `INSERT INTO check_ins (
        id, student_id, date, week_number, overall_wellbeing, academic_stress,
        sleep_quality, energy_level, social_connection, concentration,
        primary_tag, personal_reflection, is_private_note, voice_transcript
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        checkInId,
        studentId,
        today,
        weekNumber,
        overallWellbeing || 3,
        academicStress || 3,
        sleepQuality || 3,
        energyLevel || 3,
        socialConnection || 3,
        concentration || 3,
        primaryTag || 'Routine',
        personalReflection || null,
        isPrivateNote ? 1 : 0,
        voiceTranscript || null,
      ]
    );

    // Refresh student record
    const updatedCheckIns = await dbAll('SELECT * FROM check_ins WHERE student_id = ? ORDER BY week_number ASC', [studentId]);
    const studentRow = await dbGet('SELECT * FROM students WHERE id = ?', [studentId]);
    const updatedProfile = formatStudentProfile(studentRow, updatedCheckIns);

    // If analysis indicates a concern requiring counselor review, generate a counselor notification
    try {
      const analysis = analyzeWellbeingPattern(updatedProfile.checkIns);
      if (analysis.status === 'check_in_recommended') {
        const notifId = `notif-${Date.now()}`;
        await dbRun(
          `INSERT INTO counselor_notifications (id, counselor_id, student_id, student_code, message, is_read, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            notifId,
            'csl-1',
            studentId,
            studentRow?.anonymous_code || 'STU-1000',
            'New wellbeing concern requires review.',
            0,
            new Date().toISOString(),
          ]
        );
      }
    } catch (notifErr) {
      console.warn('Could not automatically create counselor notification:', notifErr);
    }

    return res.status(201).json({
      message: 'Check-in recorded successfully',
      checkIn: {
        id: checkInId,
        studentId,
        date: today,
        weekNumber,
        overallWellbeing,
        academicStress,
        sleepQuality,
        energyLevel,
        socialConnection,
        concentration,
        primaryTag,
        personalReflection,
        isPrivateNote: Boolean(isPrivateNote),
        voiceTranscript,
      },
      student: updatedProfile,
    });
  } catch (err: any) {
    console.error('Error recording check-in:', err);
    return res.status(500).json({ error: 'Failed to record check-in' });
  }
});

// 6. Update Student Consent Settings
app.put('/api/students/:id/consent', async (req, res) => {
  try {
    const { id } = req.params;
    const { optedIn, shareIndicatorsWithCounselor, allowAggregatedAdminStats, consentDate } = req.body;

    await dbRun(
      `UPDATE students SET
        opted_in = ?,
        share_indicators = ?,
        allow_stats = ?,
        consent_date = ?
       WHERE id = ?`,
      [
        optedIn ? 1 : 0,
        shareIndicatorsWithCounselor ? 1 : 0,
        allowAggregatedAdminStats ? 1 : 0,
        consentDate || new Date().toISOString().split('T')[0],
        id,
      ]
    );

    return res.json({ message: 'Consent preferences updated successfully' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to update consent preferences' });
  }
});

// 7. Counselor Notifications (Get & Read)
app.get('/api/counselor/notifications', async (_req, res) => {
  try {
    const notifications = await dbAll('SELECT * FROM counselor_notifications');
    const formatted = notifications.map((n) => ({
      id: n.id,
      counselorId: n.counselor_id,
      studentId: n.student_id,
      studentCode: n.student_code,
      message: n.message,
      isRead: Boolean(n.is_read),
      createdAt: n.created_at,
    }));
    const unreadCount = formatted.filter((n) => !n.isRead).length;

    return res.json({
      notifications: formatted,
      unreadCount,
    });
  } catch (err: any) {
    console.error('Error fetching counselor notifications:', err);
    return res.status(500).json({ error: 'Failed to fetch counselor notifications' });
  }
});

app.put('/api/counselor/notifications/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    await dbRun('UPDATE counselor_notifications SET is_read = ? WHERE id = ?', [1, id]);
    const updated = await dbGet('SELECT * FROM counselor_notifications WHERE id = ?', [id]);
    if (updated) {
      return res.json({
        notification: {
          id: updated.id,
          counselorId: updated.counselor_id,
          studentId: updated.student_id,
          studentCode: updated.student_code,
          message: updated.message,
          isRead: Boolean(updated.is_read),
          createdAt: updated.created_at,
        },
      });
    }
    return res.json({ success: true });
  } catch (err: any) {
    console.error('Error marking notification as read:', err);
    return res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

app.put('/api/counselor/notifications/read-all', async (_req, res) => {
  try {
    await dbRun('UPDATE counselor_notifications SET is_read = ?', [1]);
    return res.json({ success: true, message: 'All counselor notifications marked as read' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
});

// 8. Counselor Meetings (Get, Post & Put)
app.get('/api/counselor/meetings', async (req, res) => {
  try {
    const { studentId } = req.query;
    let meetings;
    if (studentId) {
      meetings = await dbAll('SELECT * FROM counselor_meetings WHERE student_id = ?', [studentId]);
    } else {
      meetings = await dbAll('SELECT * FROM counselor_meetings');
    }

    const formatted = meetings.map((m) => ({
      id: m.id,
      studentId: m.student_id,
      studentCode: m.student_code,
      studentName: m.student_name,
      counselorId: m.counselor_id,
      counselorName: m.counselor_name,
      date: m.date,
      time: m.time,
      duration: m.duration,
      mode: m.mode,
      note: m.note,
      status: m.status,
      createdAt: m.created_at,
    }));

    return res.json({ meetings: formatted });
  } catch (err: any) {
    console.error('Error fetching counselor meetings:', err);
    return res.status(500).json({ error: 'Failed to fetch counselor meetings' });
  }
});

app.post('/api/counselor/meetings', async (req, res) => {
  try {
    const {
      studentId,
      studentCode,
      studentName,
      counselorId,
      counselorName,
      date,
      time,
      duration,
      mode,
      note,
      status,
    } = req.body;

    if (!studentId || !date || !time) {
      return res.status(400).json({ error: 'studentId, date, and time are required' });
    }

    // Resolve student info if missing
    let targetCode = studentCode;
    let targetName = studentName;
    if (!targetCode || !targetName) {
      const stu = await dbGet('SELECT * FROM students WHERE id = ?', [studentId]);
      if (stu) {
        targetCode = targetCode || stu.anonymous_code;
        targetName = targetName || stu.name;
      }
    }

    const meetingId = `meet-${Date.now()}`;
    const createdAt = new Date().toISOString();
    const meetingMode = mode || 'In-person';
    const meetingDuration = duration || '20 minutes';
    const meetingStatus = status || 'Scheduled';
    const finalCounselorName = counselorName || 'Dr. Ananya Sharma';

    await dbRun(
      `INSERT INTO counselor_meetings (
        id, student_id, student_code, student_name, counselor_id, counselor_name,
        date, time, duration, mode, note, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        meetingId,
        studentId,
        targetCode || 'STU-1000',
        targetName || 'Student',
        counselorId || 'csl-1',
        finalCounselorName,
        date,
        time,
        meetingDuration,
        meetingMode,
        note || '',
        meetingStatus,
        createdAt,
      ]
    );

    // Also record a corresponding action in counselor action history
    const actionId = `act-${Date.now()}`;
    const timestamp = new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
    const actionNote = `Scheduled 1-on-1 Gentle Check-in (${meetingMode}, ${date} at ${time}, ${meetingDuration})${
      note ? `: "${note}"` : '.'
    }`;

    await dbRun(
      `INSERT INTO counselor_actions (id, student_id, student_code, counselor_name, action_type, note, timestamp, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        actionId,
        studentId,
        targetCode || 'STU-1000',
        finalCounselorName,
        'checkin_scheduled',
        actionNote,
        timestamp,
        'completed',
      ]
    );

    // Notify the student about the scheduled 1-on-1 meeting
    try {
      const studentNotifId = `st-notif-${Date.now()}`;
      const studentNotifMsg = `Your counselor has scheduled a 1-on-1 check-in for ${date} at ${time}.`;
      await dbRun(
        `INSERT INTO student_notifications (
          id, student_id, meeting_id, message, date, time, duration, mode, general_message, is_read, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          studentNotifId,
          studentId,
          meetingId,
          studentNotifMsg,
          date,
          time,
          meetingDuration,
          meetingMode,
          note || '1-on-1 gentle wellbeing check-in',
          0,
          createdAt,
        ]
      );
    } catch (notifErr) {
      console.warn('Could not automatically create student notification:', notifErr);
    }

    const createdMeeting = {
      id: meetingId,
      studentId,
      studentCode: targetCode,
      studentName: targetName,
      counselorId: counselorId || 'csl-1',
      counselorName: finalCounselorName,
      date,
      time,
      duration: meetingDuration,
      mode: meetingMode,
      note: note || '',
      status: meetingStatus,
      createdAt,
    };

    return res.status(201).json({
      message: 'Meeting scheduled successfully',
      meeting: createdMeeting,
    });
  } catch (err: any) {
    console.error('Error creating counselor meeting:', err);
    return res.status(500).json({ error: 'Failed to schedule meeting' });
  }
});

app.put('/api/counselor/meetings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { date, time, duration, mode, note, status } = req.body;

    const existing = await dbGet('SELECT * FROM counselor_meetings WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    const updatedDate = date !== undefined ? date : existing.date;
    const updatedTime = time !== undefined ? time : existing.time;
    const updatedDuration = duration !== undefined ? duration : existing.duration;
    const updatedMode = mode !== undefined ? mode : existing.mode;
    const updatedNote = note !== undefined ? note : existing.note;
    const updatedStatus = status !== undefined ? status : existing.status;

    await dbRun(
      `UPDATE counselor_meetings SET date = ?, time = ?, duration = ?, mode = ?, note = ?, status = ? WHERE id = ?`,
      [updatedDate, updatedTime, updatedDuration, updatedMode, updatedNote, updatedStatus, id]
    );

    // If status is updated or follow-up note added, record into counselor_actions audit history
    if (updatedStatus === 'Completed') {
      const actionId = `act-${Date.now()}`;
      const timestamp = new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
      const actionNote = updatedNote
        ? `Completed 1-on-1 Check-in (${updatedMode}, ${updatedDate} at ${updatedTime}): "${updatedNote}"`
        : `Completed 1-on-1 Check-in (${updatedMode}, ${updatedDate} at ${updatedTime}).`;

      await dbRun(
        `INSERT INTO counselor_actions (id, student_id, student_code, counselor_name, action_type, note, timestamp, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          actionId,
          existing.student_id,
          existing.student_code || 'STU-1000',
          existing.counselor_name || 'Dr. Ananya Sharma',
          'touchpoint_logged',
          actionNote,
          timestamp,
          'completed',
        ]
      );
    } else if (updatedStatus === 'Rescheduled' && status !== undefined && status !== existing.status) {
      const actionId = `act-${Date.now()}`;
      const timestamp = new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
      const actionNote = `Rescheduled 1-on-1 Check-in to ${updatedDate} at ${updatedTime} (${updatedMode})${
        updatedNote ? `: "${updatedNote}"` : '.'
      }`;

      await dbRun(
        `INSERT INTO counselor_actions (id, student_id, student_code, counselor_name, action_type, note, timestamp, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          actionId,
          existing.student_id,
          existing.student_code || 'STU-1000',
          existing.counselor_name || 'Dr. Ananya Sharma',
          'checkin_scheduled',
          actionNote,
          timestamp,
          'completed',
        ]
      );
    } else if (updatedStatus === 'Cancelled' && status !== undefined && status !== existing.status) {
      const actionId = `act-${Date.now()}`;
      const timestamp = new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
      const actionNote = `Cancelled 1-on-1 Check-in for ${updatedDate} at ${updatedTime}${
        updatedNote ? `: "${updatedNote}"` : '.'
      }`;

      await dbRun(
        `INSERT INTO counselor_actions (id, student_id, student_code, counselor_name, action_type, note, timestamp, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          actionId,
          existing.student_id,
          existing.student_code || 'STU-1000',
          existing.counselor_name || 'Dr. Ananya Sharma',
          'status_override',
          actionNote,
          timestamp,
          'completed',
        ]
      );
    }

    const updated = await dbGet('SELECT * FROM counselor_meetings WHERE id = ?', [id]);
    return res.json({
      message: 'Meeting updated successfully',
      meeting: {
        id: updated.id,
        studentId: updated.student_id,
        studentCode: updated.student_code,
        studentName: updated.student_name,
        counselorId: updated.counselor_id,
        counselorName: updated.counselor_name,
        date: updated.date,
        time: updated.time,
        duration: updated.duration,
        mode: updated.mode,
        note: updated.note,
        status: updated.status,
        createdAt: updated.created_at,
      },
    });
  } catch (err: any) {
    console.error('Error updating counselor meeting:', err);
    return res.status(500).json({ error: 'Failed to update meeting' });
  }
});

// 9. Student Notifications (Get & Mark Read)
app.get('/api/student/notifications', async (req, res) => {
  try {
    const { studentId } = req.query;
    if (!studentId || typeof studentId !== 'string') {
      return res.status(400).json({ error: 'studentId query parameter is required' });
    }

    const rows = await dbAll('SELECT * FROM student_notifications WHERE student_id = ?', [studentId]);
    const formatted = rows.map((n) => ({
      id: n.id,
      studentId: n.student_id,
      meetingId: n.meeting_id,
      message: n.message,
      date: n.date,
      time: n.time,
      duration: n.duration,
      mode: n.mode,
      isRead: Boolean(n.is_read),
      createdAt: n.created_at,
    }));

    const unreadCount = formatted.filter((n) => !n.isRead).length;
    return res.json({ notifications: formatted, unreadCount });
  } catch (err: any) {
    console.error('Error fetching student notifications:', err);
    return res.status(500).json({ error: 'Failed to fetch student notifications' });
  }
});

app.put('/api/student/notifications/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    await dbRun('UPDATE student_notifications SET is_read = ? WHERE id = ?', [1, id]);
    return res.json({ success: true, message: 'Notification marked as read' });
  } catch (err: any) {
    console.error('Error marking student notification as read:', err);
    return res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// 10. Student Scheduled Meetings (Sanitized - Student sees only their own meeting appointment details without counselor follow-up notes/risk data)
app.get('/api/student/meetings', async (req, res) => {
  try {
    const { studentId } = req.query;
    if (!studentId || typeof studentId !== 'string') {
      return res.status(400).json({ error: 'studentId query parameter is required' });
    }

    const rows = await dbAll('SELECT * FROM counselor_meetings WHERE student_id = ?', [studentId]);
    const formatted = rows.map((m) => ({
      id: m.id,
      counselorName: m.counselor_name || 'Dr. Ananya Sharma',
      date: m.date,
      time: m.time,
      duration: m.duration,
      mode: m.mode,
      status: m.status,
      createdAt: m.created_at,
    }));

    return res.json({ meetings: formatted });
  } catch (err: any) {
    console.error('Error fetching student meetings:', err);
    return res.status(500).json({ error: 'Failed to fetch student meetings' });
  }
});

// 11. Counselor Actions (Get & Post)
app.get('/api/counselor/actions', async (_req, res) => {
  try {
    const actions = await dbAll('SELECT * FROM counselor_actions ORDER BY created_at DESC');
    return res.json({
      actions: actions.map((a) => ({
        id: a.id,
        studentId: a.student_id,
        studentCode: a.student_code,
        counselorName: a.counselor_name,
        actionType: a.action_type,
        note: a.note,
        timestamp: a.timestamp,
        status: a.status,
      })),
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch counselor actions' });
  }
});

app.post('/api/counselor/actions', async (req, res) => {
  try {
    const { studentId, studentCode, counselorName, actionType, note, status } = req.body;
    const actionId = `act-${Date.now()}`;
    const timestamp = new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });

    await dbRun(
      `INSERT INTO counselor_actions (id, student_id, student_code, counselor_name, action_type, note, timestamp, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        actionId,
        studentId,
        studentCode || 'STU-1000',
        counselorName || 'Dr. Ananya Sharma',
        actionType || 'checkin_scheduled',
        note,
        timestamp,
        status || 'completed',
      ]
    );

    return res.status(201).json({
      action: {
        id: actionId,
        studentId,
        studentCode,
        counselorName,
        actionType,
        note,
        timestamp,
        status,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to log counselor action' });
  }
});

function safeParseGeminiJson(raw: string | undefined): any {
  if (!raw) return null;
  let text = raw.trim();
  if (text.startsWith('```json')) {
    text = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '');
  } else if (text.startsWith('```')) {
    text = text.replace(/^```\s*/i, '').replace(/\s*```$/i, '');
  }
  try {
    return JSON.parse(text);
  } catch (e) {
    console.warn('Failed to parse Gemini JSON output:', text.slice(0, 100));
    return null;
  }
}

// 8. Voice Speech Reflection & Processing ("speak")
app.post('/api/voice/process-speech', async (req, res) => {
  try {
    const { transcript, studentId } = req.body;
    if (!transcript || typeof transcript !== 'string') {
      return res.status(400).json({ error: 'Speech transcript is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const systemInstruction = `You are a supportive campus wellbeing reflection assistant. 
Analyze the student's spoken voice note and provide supportive empathetic feedback and estimated wellbeing ratings.
Output JSON only with keys:
- "sentiment": brief string (e.g. "Overwhelmed with deadlines", "Optimistic", "Exhausted"),
- "supportiveReflection": a warm 2-sentence empathetic validation message,
- "suggestedRatings": {
    "overallWellbeing": 1 to 5,
    "academicStress": 1 to 5,
    "sleepQuality": 1 to 5,
    "energyLevel": 1 to 5
  },
- "primaryTag": one of ["Exams", "Projects", "Routine", "Health", "Social", "Family"]`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: `Spoken reflection by student: "${transcript}"`,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            temperature: 0.2,
          },
        });

        const parsed = safeParseGeminiJson(response.text);
        if (parsed) {
          return res.json({
            transcript,
            sentiment: parsed.sentiment || 'Reflective state',
            supportiveReflection: parsed.supportiveReflection || 'Thank you for sharing your thoughts.',
            suggestedRatings: parsed.suggestedRatings || { overallWellbeing: 3, academicStress: 3, sleepQuality: 3, energyLevel: 3 },
            primaryTag: parsed.primaryTag || 'Routine',
          });
        }
      } catch (geminiErr) {
        console.info('Using local heuristic voice analysis fallback:', geminiErr);
      }
    }

    // Heuristic sentiment & speech analysis fallback
    const lower = transcript.toLowerCase();
    let stress = 3;
    let wellbeing = 3;
    let sleep = 3;
    let energy = 3;
    let tag = 'Routine';

    if (lower.includes('exam') || lower.includes('test') || lower.includes('midterm') || lower.includes('grade')) {
      stress = 5;
      tag = 'Exams';
    } else if (lower.includes('assignment') || lower.includes('project') || lower.includes('deadline') || lower.includes('submission')) {
      stress = 4;
      tag = 'Projects';
    }

    if (lower.includes('tired') || lower.includes('exhausted') || lower.includes('drained') || lower.includes('sleep') || lower.includes('night')) {
      sleep = 2;
      energy = 2;
      wellbeing = 2;
    } else if (lower.includes('good') || lower.includes('great') || lower.includes('happy') || lower.includes('excited')) {
      wellbeing = 5;
      energy = 4;
    }

    return res.json({
      transcript,
      sentiment: stress >= 4 ? 'Experiencing elevated academic pressure' : 'Steady day-to-day rhythm',
      supportiveReflection:
        'Thank you for speaking your mind. Giving voice to how you are feeling helps acknowledge when things get busy.',
      suggestedRatings: {
        overallWellbeing: wellbeing,
        academicStress: stress,
        sleepQuality: sleep,
        energyLevel: energy,
      },
      primaryTag: tag,
    });
  } catch (err: any) {
    console.error('Error processing voice reflection:', err);
    return res.status(500).json({ error: 'Failed to process voice reflection' });
  }
});

// 9. Counselor AI Briefing Synthesis
app.post('/api/generate-summary', async (req, res) => {
  try {
    const { student, analysis } = req.body;
    if (!student || !analysis) {
      return res.status(400).json({ error: 'Missing student or analysis payload' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({ error: 'GEMINI_API_KEY is not configured on server' });
    }

    const checkIns = student.checkIns || [];
    const timelineSummary = checkIns
      .map(
        (c: any) =>
          `Week ${c.weekNumber} (${c.date}): Wellbeing ${c.overallWellbeing}/5, Academic Stress ${c.academicStress}/5, Sleep ${c.sleepQuality}/5, Energy ${c.energyLevel}/5, Social ${c.socialConnection}/5, Focus ${c.concentration}/5. Note: "${c.personalReflection || 'None provided'}"`
      )
      .join('\n');

    const systemInstruction = `You are an ethical assistant for university wellbeing counselors. 
Your goal is to synthesize self-reported student wellbeing check-in patterns over time into a concise, empathetic, non-diagnostic counselor briefing.
CRITICAL SAFEGUARDS:
- NEVER use psychiatric or diagnostic labels (e.g. do NOT say depression, anxiety disorder, MDD, insomnia disorder).
- DO focus on environmental factors, workload pacing, sleep routines, social connectedness, and observed score shifts.
- Keep tone professional, supportive, and action-oriented for a 1-on-1 counselor check-in.
- Provide JSON output format with:
  "summary": concise 2-sentence overview of the observed change over time,
  "keyObservations": list of 3 bullet points highlighting specific pattern shifts,
  "suggestedOpeners": list of 2 gentle, non-threatening conversation starters the counselor can use.`;

    const userPrompt = `Student Code: ${student.anonymousCode}
Department: ${student.department} (${student.year})
Longitudinal Check-in History (Oldest to Newest):
${timelineSummary}

Deterministic Engine Flags:
Status: ${analysis.status}
Decline Streak: ${analysis.consecutiveDeclines} weeks
Primary Drivers: ${(analysis.primaryDrivers || []).join(', ')}
Engine Explanation: ${analysis.explanation}

Generate the structured counselor synthesis.`;

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        temperature: 0.3,
      },
    });

    const parsed = safeParseGeminiJson(response.text);
    if (parsed && parsed.summary) {
      return res.json({
        summary: parsed.summary,
        keyObservations: parsed.keyObservations || analysis.ruleTriggers || [],
        suggestedOpeners: parsed.suggestedOpeners || [],
        disclaimer:
          'AI-generated briefing for qualified counselor review only. This is an early-warning communication aid, NOT a clinical or psychiatric diagnosis.',
        generatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    }

    return res.status(500).json({ error: 'Could not structure counselor synthesis from AI output' });
  } catch (err: any) {
    console.error('Error generating counselor summary:', err);
    return res.status(500).json({ error: err?.message || 'Internal Server Error' });
  }
});

// Vite middleware in development vs static serve in production
async function startServer() {
  await initDatabase();

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MannMitra backend server running on http://0.0.0.0:${PORT} with SQLite3`);
  });
}

startServer();
