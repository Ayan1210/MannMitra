import React, { useState, useEffect } from 'react';
import { Role, StudentProfile, StaffProfile, AuthSessionUser, CheckInRecord, CounselorAction } from './types';
import { INITIAL_STUDENTS } from './lib/mockData';
import { analyzeWellbeingPattern } from './lib/patternEngine';
import {
  fetchAllStudents,
  getAuthSession,
  submitCheckIn,
  updateConsentSettings,
  fetchCounselorActions,
  logCounselorAction,
  loginCounselor,
  loginAdmin,
  authStorage,
} from './lib/api';
import { Navbar } from './components/Navbar';
import { DashboardRoleSelector } from './components/Dashboard/DashboardRoleSelector';
import { StudentDashboard } from './components/StudentView/StudentDashboard';
import { StudentCheckInModal } from './components/StudentView/StudentCheckInModal';
import { RoleAuthModal } from './components/Auth/RoleAuthModal';
import { AccessDeniedGate } from './components/Auth/AccessDeniedGate';
import { CounselorDashboard } from './components/CounselorView/CounselorDashboard';
import { AdminDashboard } from './components/AdminView/AdminDashboard';
import { AaravStoryWalkthrough } from './components/StoryMode/AaravStoryWalkthrough';
import { EthicalFrameworkModal } from './components/EthicalSafeguards/EthicalFrameworkModal';

export default function App() {
  const [currentRole, setCurrentRole] = useState<Role>('student');
  const [students, setStudents] = useState<StudentProfile[]>(INITIAL_STUDENTS);
  const [activeStudentId, setActiveStudentId] = useState<string>('stu-1024');
  const [authSession, setAuthSession] = useState<AuthSessionUser | null>(null);

  const [counselorActions, setCounselorActions] = useState<CounselorAction[]>([
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
  ]);

  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [checkInInitialData, setCheckInInitialData] = useState<any>(undefined);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTargetRole, setAuthModalTargetRole] = useState<'student' | 'counselor' | 'admin'>('student');
  const [isEthicsModalOpen, setIsEthicsModalOpen] = useState(false);

  // Load students and active session from SQLite3 Express backend on startup
  useEffect(() => {
    async function initData() {
      try {
        const backendStudents = await fetchAllStudents();
        if (backendStudents && backendStudents.length > 0) {
          setStudents(backendStudents);
        }

        const backendActions = await fetchCounselorActions();
        if (backendActions && backendActions.length > 0) {
          setCounselorActions(backendActions);
        }

        const savedSession = await getAuthSession();
        if (savedSession) {
          setAuthSession(savedSession);
          if (savedSession.role === 'student') {
            setActiveStudentId(savedSession.profile.id);
          }
        }
      } catch (err) {
        console.warn('Initial data synchronization note:', err);
      }
    }
    initData();
  }, []);

  // Active student for Student View
  const currentStudent =
    students.find((s) => s.id === activeStudentId) || students[0] || INITIAL_STUDENTS[0];

  // Calculate unread alerts for counselor
  const unreadAlerts = students.filter(
    (s) => analyzeWellbeingPattern(s.checkIns).status === 'check_in_recommended'
  ).length;

  const handleStudentCheckInSubmit = async (
    newCheckInData: Omit<CheckInRecord, 'id' | 'studentId' | 'date' | 'weekNumber'>
  ) => {
    try {
      // Submit to SQLite backend API
      const result = await submitCheckIn({
        studentId: currentStudent.id,
        overallWellbeing: newCheckInData.overallWellbeing,
        academicStress: newCheckInData.academicStress,
        sleepQuality: newCheckInData.sleepQuality,
        energyLevel: newCheckInData.energyLevel,
        socialConnection: newCheckInData.socialConnection,
        concentration: newCheckInData.concentration,
        primaryTag: newCheckInData.primaryTag,
        personalReflection: newCheckInData.personalReflection,
        isPrivateNote: newCheckInData.isPrivateNote,
      });

      if (result.student) {
        setStudents((prev) =>
          prev.map((s) => (s.id === result.student.id ? result.student : s))
        );
        return;
      }
    } catch (err) {
      console.warn('Backend check-in save fallback to local state:', err);
    }

    // Local fallback
    const studentCheckIns = currentStudent.checkIns;
    const nextWeekNum = studentCheckIns.length + 1;
    const today = new Date().toISOString().split('T')[0];

    const newRecord: CheckInRecord = {
      id: `ck-${Date.now()}`,
      studentId: currentStudent.id,
      date: today,
      weekNumber: nextWeekNum,
      ...newCheckInData,
    };

    const updatedCheckIns = [...studentCheckIns, newRecord];
    const newAnalysis = analyzeWellbeingPattern(updatedCheckIns);

    setStudents((prev) =>
      prev.map((s) =>
        s.id === currentStudent.id
          ? {
              ...s,
              checkIns: updatedCheckIns,
              status: newAnalysis.status,
            }
          : s
      )
    );
  };

  const handleOpenCheckInWithData = (initialVoiceData?: any) => {
    setCheckInInitialData(initialVoiceData);
    setIsCheckInModalOpen(true);
  };

  const handleOpenAuth = (roleTarget: 'student' | 'counselor' | 'admin' = 'student') => {
    setAuthModalTargetRole(roleTarget);
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = (session: AuthSessionUser) => {
    setAuthSession(session);

    if (session.role === 'student') {
      const student = session.profile as StudentProfile;
      setStudents((prev) => {
        const exists = prev.some((s) => s.id === student.id);
        if (exists) {
          return prev.map((s) => (s.id === student.id ? student : s));
        }
        return [student, ...prev];
      });
      setActiveStudentId(student.id);
      setCurrentRole('student');
    } else if (session.role === 'counselor') {
      setCurrentRole('counselor');
    } else if (session.role === 'admin') {
      setCurrentRole('admin');
    }
  };

  const handleLogout = () => {
    authStorage.clear();
    setAuthSession(null);
    setActiveStudentId('stu-1024');
    setCurrentRole('student');
  };

  const handleUpdateConsent = async (newConsent: StudentProfile['consent']) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.id === currentStudent.id
          ? {
              ...s,
              consent: newConsent,
            }
          : s
      )
    );

    try {
      await updateConsentSettings(currentStudent.id, newConsent);
    } catch (err) {
      console.warn('Could not sync consent to backend:', err);
    }
  };

  const handleLogCounselorAction = async (
    action: Omit<CounselorAction, 'id' | 'timestamp'>
  ) => {
    try {
      const saved = await logCounselorAction(action);
      if (saved) {
        setCounselorActions((prev) => [saved, ...prev]);
        return;
      }
    } catch (err) {
      console.warn('Backend counselor log fallback to local:', err);
    }

    const newAction: CounselorAction = {
      id: `act-${Date.now()}`,
      timestamp: new Date().toLocaleString([], {
        dateStyle: 'short',
        timeStyle: 'short',
      }),
      ...action,
    };
    setCounselorActions((prev) => [newAction, ...prev]);
  };

  const handleSimulateCheckIn = (studentId: string, customCheckIn: any) => {
    const targetStudent = students.find((s) => s.id === studentId);
    if (!targetStudent) return;

    const nextWeek = targetStudent.checkIns.length + 1;
    const today = new Date().toISOString().split('T')[0];

    const simulatedRecord: CheckInRecord = {
      id: `sim-${Date.now()}`,
      studentId,
      date: today,
      weekNumber: nextWeek,
      overallWellbeing: customCheckIn.overallWellbeing,
      academicStress: customCheckIn.academicStress,
      sleepQuality: customCheckIn.sleepQuality,
      energyLevel: customCheckIn.energyLevel,
      socialConnection: customCheckIn.socialConnection,
      concentration: customCheckIn.concentration,
      primaryTag: customCheckIn.primaryTag || 'Exams',
      personalReflection: customCheckIn.personalReflection,
      isPrivateNote: false,
    };

    const updatedCheckIns = [...targetStudent.checkIns, simulatedRecord];
    const newAnalysis = analyzeWellbeingPattern(updatedCheckIns);

    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId
          ? {
              ...s,
              checkIns: updatedCheckIns,
              status: newAnalysis.status,
            }
          : s
      )
    );
  };

  const handleRequestCounselorChat = (note: string) => {
    handleLogCounselorAction({
      studentId: currentStudent.id,
      studentCode: currentStudent.anonymousCode,
      counselorName: 'Dr. Ananya Sharma',
      actionType: 'checkin_scheduled',
      note: `Student initiated touchpoint request: "${note}"`,
      status: 'pending',
    });
  };

  // Quick authorization helper for evaluation / instant role switching
  const handleQuickAuthRole = async (targetRole: 'counselor' | 'admin') => {
    try {
      if (targetRole === 'counselor') {
        const { user, token } = await loginCounselor({
          email: 'counselor.sharma@campus.edu',
          password: 'counselor123',
        });
        handleAuthSuccess({ role: 'counselor', profile: user, token });
      } else if (targetRole === 'admin') {
        const { user, token } = await loginAdmin({
          email: 'admin@campus.edu',
          password: 'admin123',
        });
        handleAuthSuccess({ role: 'admin', profile: user, token });
      }
    } catch (err) {
      console.warn('Quick demo login fallback:', err);
    }
  };

  const handleQuickAuthenticateCredentials = async (
    role: 'counselor' | 'admin',
    email: string,
    pass: string
  ) => {
    try {
      if (role === 'counselor') {
        const { user, token } = await loginCounselor({ email, password: pass });
        handleAuthSuccess({ role: 'counselor', profile: user, token });
      } else if (role === 'admin') {
        const { user, token } = await loginAdmin({ email, password: pass });
        handleAuthSuccess({ role: 'admin', profile: user, token });
      }
    } catch (err) {
      console.error('Login error:', err);
      handleOpenAuth(role);
    }
  };

  // Role Access Checks
  const isCounselorAuthorized = authSession?.role === 'counselor';
  const isAdminAuthorized = authSession?.role === 'admin';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-500/20 selection:text-emerald-900">
      {/* Top Navigation */}
      <Navbar
        currentRole={currentRole}
        onSelectRole={setCurrentRole}
        onOpenCheckIn={() => handleOpenCheckInWithData()}
        onOpenEthicsModal={() => setIsEthicsModalOpen(true)}
        unreadAlertCount={unreadAlerts}
        currentStudent={currentStudent}
        currentSession={authSession}
        onOpenAuthModal={handleOpenAuth}
        onLogout={handleLogout}
      />

      {/* Role Selection & Dashboard Perspective Switcher */}
      <DashboardRoleSelector
        currentRole={currentRole}
        onSelectRole={setCurrentRole}
        currentSession={authSession}
        onQuickAuth={handleQuickAuthRole}
        unreadAlertCount={unreadAlerts}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {currentRole === 'story_mode' && (
          <AaravStoryWalkthrough
            onSwitchToCounselor={() => {
              if (isCounselorAuthorized) {
                setCurrentRole('counselor');
              } else {
                handleQuickAuthRole('counselor');
              }
            }}
            onSwitchToStudent={() => setCurrentRole('student')}
          />
        )}

        {currentRole === 'student' && (
          <StudentDashboard
            student={currentStudent}
            onOpenCheckIn={handleOpenCheckInWithData}
            onUpdateConsent={handleUpdateConsent}
            onRequestCounselorChat={handleRequestCounselorChat}
            onOpenAuthModal={() => handleOpenAuth('student')}
          />
        )}

        {currentRole === 'counselor' && (
          isCounselorAuthorized ? (
            <CounselorDashboard
              students={students}
              counselorActions={counselorActions}
              onLogAction={handleLogCounselorAction}
              onSimulateCheckIn={handleSimulateCheckIn}
            />
          ) : (
            <AccessDeniedGate
              attemptedRole="counselor"
              currentSession={authSession}
              onOpenLoginModal={(role) => handleOpenAuth(role)}
              onQuickAuthenticate={handleQuickAuthenticateCredentials}
              onReturnToStudent={() => setCurrentRole('student')}
            />
          )
        )}

        {currentRole === 'admin' && (
          isAdminAuthorized ? (
            <AdminDashboard />
          ) : (
            <AccessDeniedGate
              attemptedRole="admin"
              currentSession={authSession}
              onOpenLoginModal={(role) => handleOpenAuth(role)}
              onQuickAuthenticate={handleQuickAuthenticateCredentials}
              onReturnToStudent={() => setCurrentRole('student')}
            />
          )
        )}
      </main>

      {/* Student Check-in Modal */}
      <StudentCheckInModal
        isOpen={isCheckInModalOpen}
        onClose={() => {
          setIsCheckInModalOpen(false);
          setCheckInInitialData(undefined);
        }}
        onSubmit={handleStudentCheckInSubmit}
        currentWeekNumber={currentStudent.checkIns.length}
        initialData={checkInInitialData}
      />

      {/* Unified Role-Based Authentication Modal */}
      <RoleAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        initialRole={authModalTargetRole}
      />

      {/* Ethical Framework & Judge Q&A Modal */}
      <EthicalFrameworkModal
        isOpen={isEthicsModalOpen}
        onClose={() => setIsEthicsModalOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white/80 backdrop-blur-xs py-6 mt-auto text-xs text-slate-500 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-emerald-800">MannMitra (मनमित्र)</span>
            <span>•</span>
            <span>Consent-Based Student Wellbeing Early-Warning System</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={() => setIsEthicsModalOpen(true)}
              className="text-slate-600 hover:text-emerald-700 underline"
            >
              WHO Guidance Compliance
            </button>
            <span>•</span>
            <span>Role-Based Access Control (RBAC)</span>
            <span>•</span>
            <span>Zero Diagnostic Claims</span>
            <span>•</span>
            <span>Node.js + Express + SQLite3 DB</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

