import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  Mail,
  User,
  BookOpen,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  LogIn,
  UserPlus,
  Stethoscope,
  Building2,
  KeyRound,
  GraduationCap,
} from 'lucide-react';
import { StudentProfile, StaffProfile, AuthSessionUser } from '../../types';
import { registerStudent, loginStudent, loginCounselor, loginAdmin } from '../../lib/api';

interface RoleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (session: AuthSessionUser) => void;
  initialRole?: 'student' | 'counselor' | 'admin';
}

export const RoleAuthModal: React.FC<RoleAuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  initialRole = 'student',
}) => {
  const [activeTab, setActiveTab] = useState<'student' | 'counselor' | 'admin'>(initialRole);
  const [studentMode, setStudentMode] = useState<'login' | 'register'>('login');

  // Student Form State
  const [studentEmail, setStudentEmail] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regDepartment, setRegDepartment] = useState('Computer Science & Engineering');
  const [regYear, setRegYear] = useState('1st Year (Semester 1)');
  const [consentOptIn, setConsentOptIn] = useState(true);
  const [consentShareIndicators, setConsentShareIndicators] = useState(true);

  // Counselor Form State
  const [counselorEmail, setCounselorEmail] = useState('');
  const [counselorPassword, setCounselorPassword] = useState('');

  // Admin Form State
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  // Status & Error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialRole);
      setError(null);
      setSuccessMsg(null);
    }
  }, [isOpen, initialRole]);

  if (!isOpen) return null;

  // 1. Submit Student Login
  const handleStudentLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { student, token } = await loginStudent({
        email: studentEmail,
        password: studentPassword,
      });
      setSuccessMsg(`Welcome back, ${student.name.split(' ')[0]}!`);
      setTimeout(() => {
        onAuthSuccess({ role: 'student', profile: student, token });
        onClose();
      }, 500);
    } catch (err: any) {
      setError(err?.message || 'Student login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Submit Student Register
  const handleStudentRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { student, token } = await registerStudent({
        name: regName,
        email: regEmail,
        password: regPassword,
        department: regDepartment,
        year: regYear,
        consent: {
          optedIn: consentOptIn,
          shareIndicatorsWithCounselor: consentShareIndicators,
          allowAggregatedAdminStats: true,
        },
      });

      setSuccessMsg(`Account created! Anonymous ID: ${student.anonymousCode}`);
      setTimeout(() => {
        onAuthSuccess({ role: 'student', profile: student, token });
        onClose();
      }, 600);
    } catch (err: any) {
      setError(err?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Submit Counselor Login
  const handleCounselorLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { user, token } = await loginCounselor({
        email: counselorEmail,
        password: counselorPassword,
      });
      setSuccessMsg(`Counselor access granted: ${user.name}`);
      setTimeout(() => {
        onAuthSuccess({ role: 'counselor', profile: user, token });
        onClose();
      }, 500);
    } catch (err: any) {
      setError(err?.message || 'Counselor authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  // 4. Submit Admin Login
  const handleAdminLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { user, token } = await loginAdmin({
        email: adminEmail,
        password: adminPassword,
      });
      setSuccessMsg(`Administrator access granted: ${user.name}`);
      setTimeout(() => {
        onAuthSuccess({ role: 'admin', profile: user, token });
        onClose();
      }, 500);
    } catch (err: any) {
      setError(err?.message || 'Administrator authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-6">
        {/* Header */}
        <div
          className={`p-6 text-white relative transition-colors duration-300 ${
            activeTab === 'student'
              ? 'bg-gradient-to-r from-emerald-800 to-teal-900'
              : activeTab === 'counselor'
              ? 'bg-gradient-to-r from-teal-800 via-cyan-900 to-slate-900'
              : 'bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900'
          }`}
        >
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider opacity-90">
            <ShieldCheck className="w-4 h-4" />
            <span>Role-Based Authentication & Access Control</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold mt-1 text-white">
            {activeTab === 'student'
              ? studentMode === 'login'
                ? 'Student Wellbeing Login'
                : 'Create Student Account'
              : activeTab === 'counselor'
              ? 'Counselor Portal Sign In'
              : 'Institutional Administrator Sign In'}
          </h2>

          <p className="text-xs sm:text-sm mt-1 opacity-90">
            {activeTab === 'student'
              ? 'Personal wellbeing check-ins, audio reflection & privacy controls'
              : activeTab === 'counselor'
              ? 'Longitudinal pattern triage, clinical touchpoints & AI summary'
              : 'Cohort-level stress heatmaps, audit logs & institutional policies'}
          </p>

          {/* Role Tabs */}
          <div className="grid grid-cols-3 gap-1 bg-black/30 p-1.5 rounded-2xl mt-4 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setActiveTab('student');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'student'
                  ? 'bg-white text-emerald-900 shadow-md font-bold'
                  : 'text-slate-200 hover:text-white'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Student</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('counselor');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'counselor'
                  ? 'bg-white text-teal-900 shadow-md font-bold'
                  : 'text-slate-200 hover:text-white'
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              <span>Counselor</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('admin');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'admin'
                  ? 'bg-white text-slate-900 shadow-md font-bold'
                  : 'text-slate-200 hover:text-white'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Admin</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">{successMsg}</span>
            </div>
          )}

          {/* TAB 1: STUDENT */}
          {activeTab === 'student' && (
            <div className="space-y-4">
              {/* Student Mode Switcher (Login vs Register) */}
              <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setStudentMode('login')}
                  className={`flex-1 py-1.5 rounded-lg transition-all ${
                    studentMode === 'login'
                      ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setStudentMode('register')}
                  className={`flex-1 py-1.5 rounded-lg transition-all ${
                    studentMode === 'register'
                      ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {studentMode === 'login' ? (
                <form onSubmit={handleStudentLoginSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Campus Student Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="email"
                        required
                        value={studentEmail}
                        onChange={(e) => setStudentEmail(e.target.value)}
                        placeholder="aarav.sharma@campus.edu"
                        className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="password"
                        required
                        value={studentPassword}
                        onChange={(e) => setStudentPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                      />
                    </div>
                  </div>

                  {/* Demo Quick Logins */}
                  <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-emerald-900">
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-emerald-600" />
                        Quick Evaluation Students
                      </span>
                      <span className="text-[10px] text-emerald-700 font-mono">pw: password123</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setStudentEmail('aarav.sharma@campus.edu');
                          setStudentPassword('password123');
                        }}
                        className="p-1.5 bg-white hover:bg-emerald-100/50 rounded-lg border border-emerald-200 text-left transition-colors"
                      >
                        <div className="font-semibold text-slate-800 text-[11px] truncate">Aarav (CS)</div>
                        <div className="text-[10px] text-rose-600 font-mono">STU-1024</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setStudentEmail('priya.patel@campus.edu');
                          setStudentPassword('password123');
                        }}
                        className="p-1.5 bg-white hover:bg-emerald-100/50 rounded-lg border border-emerald-200 text-left transition-colors"
                      >
                        <div className="font-semibold text-slate-800 text-[11px] truncate">Priya (Biotech)</div>
                        <div className="text-[10px] text-amber-600 font-mono">STU-2048</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setStudentEmail('rohan.mehta@campus.edu');
                          setStudentPassword('password123');
                        }}
                        className="p-1.5 bg-white hover:bg-emerald-100/50 rounded-lg border border-emerald-200 text-left transition-colors"
                      >
                        <div className="font-semibold text-slate-800 text-[11px] truncate">Rohan (EE)</div>
                        <div className="text-[10px] text-emerald-600 font-mono">STU-3096</div>
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? 'Authenticating...' : 'Sign In as Student'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleStudentRegisterSubmit} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          required
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          placeholder="e.g. Diya Nair"
                          className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Campus Email
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="email"
                          required
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder="diya.nair@campus.edu"
                          className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="password"
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Create a secure password"
                        className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Academic Department
                      </label>
                      <select
                        value={regDepartment}
                        onChange={(e) => setRegDepartment(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                      >
                        <option value="Computer Science & Engineering">Computer Science & Eng.</option>
                        <option value="Biotechnology & Bioinformatics">Biotechnology</option>
                        <option value="Electrical & Electronics Eng.">Electrical & Electronics</option>
                        <option value="Mechanical & Mechatronics Eng.">Mechanical Eng.</option>
                        <option value="Management Studies & Economics">Management Studies</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Current Year
                      </label>
                      <select
                        value={regYear}
                        onChange={(e) => setRegYear(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                      >
                        <option value="1st Year (Semester 1)">1st Year (Sem 1)</option>
                        <option value="1st Year (Semester 2)">1st Year (Sem 2)</option>
                        <option value="2nd Year (Semester 3)">2nd Year</option>
                        <option value="3rd Year (Semester 5)">3rd Year</option>
                        <option value="4th Year (Semester 7)">4th Year</option>
                      </select>
                    </div>
                  </div>

                  {/* Consent Checkboxes */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={consentOptIn}
                        onChange={(e) => setConsentOptIn(e.target.checked)}
                        className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-slate-700">
                        Opt into weekly multi-week longitudinal wellbeing trends.
                      </span>
                    </label>
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={consentShareIndicators}
                        onChange={(e) => setConsentShareIndicators(e.target.checked)}
                        className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-slate-700">
                        Share anonymous indicator scores (STU-XXXX) with campus counselors if a 3+ week decline occurs.
                      </span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? 'Creating Student Profile...' : 'Complete Student Registration'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: COUNSELOR */}
          {activeTab === 'counselor' && (
            <form onSubmit={handleCounselorLoginSubmit} className="space-y-4">
              <div className="p-3.5 bg-teal-50 border border-teal-200 rounded-2xl flex items-start gap-3">
                <Stethoscope className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
                <div className="text-xs text-teal-900">
                  <p className="font-bold">Campus Counseling & Wellness Division</p>
                  <p className="text-teal-800">
                    Restricted to authorized campus psychologists and mental health officers. Students attempting to sign in here will be denied access.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Counselor Staff Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={counselorEmail}
                    onChange={(e) => setCounselorEmail(e.target.value)}
                    placeholder="counselor.sharma@campus.edu"
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Counselor Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={counselorPassword}
                    onChange={(e) => setCounselorPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
              </div>

              {/* Demo Counselor Accounts */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700">
                  <span className="flex items-center gap-1">
                    <KeyRound className="w-3 h-3 text-teal-600" />
                    Demo Counselor Accounts
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">pw: counselor123</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setCounselorEmail('counselor.sharma@campus.edu');
                      setCounselorPassword('counselor123');
                    }}
                    className="p-2 bg-white hover:bg-teal-50/50 rounded-xl border border-slate-200 text-left transition-colors shadow-2xs"
                  >
                    <div className="font-bold text-slate-800 text-[11px]">Dr. Ananya Sharma</div>
                    <div className="text-[10px] text-teal-700">Lead Psychologist</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCounselorEmail('counselor.verma@campus.edu');
                      setCounselorPassword('counselor123');
                    }}
                    className="p-2 bg-white hover:bg-teal-50/50 rounded-xl border border-slate-200 text-left transition-colors shadow-2xs"
                  >
                    <div className="font-bold text-slate-800 text-[11px]">Dr. Rajesh Verma</div>
                    <div className="text-[10px] text-teal-700">Welfare Counselor</div>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                {loading ? 'Verifying Counselor Privileges...' : 'Sign In to Counselor Portal'}
              </button>
            </form>
          )}

          {/* TAB 3: ADMIN */}
          {activeTab === 'admin' && (
            <form onSubmit={handleAdminLoginSubmit} className="space-y-4">
              <div className="p-3.5 bg-slate-100 border border-slate-300 rounded-2xl flex items-start gap-3">
                <Building2 className="w-5 h-5 text-slate-800 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-800">
                  <p className="font-bold">Office of Student Affairs & Institutional Admin</p>
                  <p className="text-slate-600">
                    Restricted to University Deans, Department Chairs, and Executive Directors. Aggregated non-identifiable telemetry only.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Administrator Campus Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="admin@campus.edu"
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-700 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Admin Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-700 outline-none"
                  />
                </div>
              </div>

              {/* Demo Admin Accounts */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700">
                  <span className="flex items-center gap-1">
                    <KeyRound className="w-3 h-3 text-slate-700" />
                    Demo Administrator Accounts
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">pw: admin123</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setAdminEmail('admin@campus.edu');
                      setAdminPassword('admin123');
                    }}
                    className="p-2 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 text-left transition-colors shadow-2xs"
                  >
                    <div className="font-bold text-slate-900 text-[11px]">Prof. Meenakshi Sundaram</div>
                    <div className="text-[10px] text-slate-600">Dean of Student Affairs</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAdminEmail('director@campus.edu');
                      setAdminPassword('admin123');
                    }}
                    className="p-2 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 text-left transition-colors shadow-2xs"
                  >
                    <div className="font-bold text-slate-900 text-[11px]">Dr. Vikram Malhotra</div>
                    <div className="text-[10px] text-slate-600">Campus Director</div>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                {loading ? 'Verifying Administrator Privileges...' : 'Sign In to Institutional Admin Portal'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
