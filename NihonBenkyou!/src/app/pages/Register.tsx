import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuthStore } from '../store/useAuthStore';
import type { JLPTLevel } from '../types';

const levels: { value: JLPTLevel; label: string; description: string }[] = [
  { value: 'N5', label: 'N5 — Beginner', description: 'Basic greetings & simple sentences' },
  { value: 'N4', label: 'N4 — Elementary', description: 'Daily conversation & basic reading' },
  { value: 'N3', label: 'N3 — Intermediate', description: 'Everyday situations & general topics' },
  { value: 'N2', label: 'N2 — Upper Intermediate', description: 'News, articles & natural conversation' },
  { value: 'N1', label: 'N1 — Advanced', description: 'Complex texts & native-level comprehension' },
];

export const Register = () => {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuthStore();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<JLPTLevel>('N5');
  const [userType, setUserType] = useState<'STUDENT' | 'PROFESSIONAL'>('STUDENT');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (password.length < 8) {
      setValidationError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }

    try {
      await register({
        email,
        password,
        displayName,
        currentJlptLevel: selectedLevel,
        userType,
      });
      navigate('/', { replace: true });
    } catch {
      // Error is set in store
    }
  };

  const displayError = validationError || error;

  return (
    <div className="min-h-screen bg-brand-100 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex items-center justify-center space-x-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-brand-700 flex items-center justify-center text-white shadow-md">
            <span className="text-2xl font-bold leading-none mt-0.5">日</span>
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-800">NihonBenkyou!</span>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl border border-brand-200/50 shadow-sm p-8">
          <h1 className="text-2xl font-bold text-slate-800 text-center mb-1">Start your journey</h1>
          <p className="text-sm text-slate-500 text-center mb-6">Create your account to begin learning Japanese</p>

          {displayError && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4"
            >
              {displayError}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Display Name */}
            <div>
              <label htmlFor="displayName" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Display Name
              </label>
              <input
                id="displayName"
                type="text"
                required
                autoComplete="name"
                value={displayName}
                onChange={(e) => { setDisplayName(e.target.value); clearError(); }}
                placeholder="Your name"
                className="w-full px-4 py-3 rounded-xl border border-brand-200 bg-brand-100/50 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all text-sm"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); clearError(); }}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border border-brand-200 bg-brand-100/50 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all text-sm"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setValidationError(''); clearError(); }}
                  placeholder="Min. 8 characters"
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-brand-200 bg-brand-100/50 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setValidationError(''); }}
                placeholder="Repeat your password"
                className="w-full px-4 py-3 rounded-xl border border-brand-200 bg-brand-100/50 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all text-sm"
              />
            </div>

            {/* JLPT Level */}
            <div>
              <label htmlFor="level" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Starting Level
              </label>
              <select
                id="level"
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value as JLPTLevel)}
                className="w-full px-4 py-3 rounded-xl border border-brand-200 bg-brand-100/50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all text-sm appearance-none"
              >
                {levels.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-400 mt-1">
                {levels.find(l => l.value === selectedLevel)?.description}
              </p>
            </div>

            {/* User Type */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                I am a...
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setUserType('STUDENT')}
                  className={`py-3 px-4 rounded-xl border text-sm font-semibold transition-all ${
                    userType === 'STUDENT'
                      ? 'border-brand-500 bg-brand-500/10 text-brand-700'
                      : 'border-brand-200 text-slate-500 hover:border-brand-300'
                  }`}
                >
                  🎓 Student
                </button>
                <button
                  type="button"
                  onClick={() => setUserType('PROFESSIONAL')}
                  className={`py-3 px-4 rounded-xl border text-sm font-semibold transition-all ${
                    userType === 'PROFESSIONAL'
                      ? 'border-brand-500 bg-brand-500/10 text-brand-700'
                      : 'border-brand-200 text-slate-500 hover:border-brand-300'
                  }`}
                >
                  💼 Professional
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-semibold text-sm shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Create Account</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-brand-200/50" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-slate-400">Already have an account?</span>
            </div>
          </div>

          {/* Login Link */}
          <Link
            to="/login"
            className="block w-full text-center py-3 px-4 rounded-xl border border-brand-200 text-brand-700 font-semibold text-sm hover:bg-brand-100/50 transition-all"
          >
            Sign in instead
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
