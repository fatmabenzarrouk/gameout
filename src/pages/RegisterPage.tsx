import React, { useState } from 'react';
import {
  Mail,
  Lock,
  User,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  Check
} from 'lucide-react';
import { GameOutLogo } from '../components/common/GameOutLogo';
import { useAuth } from '../contexts/AuthContext';
import { ActivePage } from '../types';

interface RegisterPageProps {
  onNavigate: (page: ActivePage) => void;
  onSuccessRedirect?: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({
  onNavigate,
  onSuccessRedirect
}) => {
  const { registerWithEmail, checkUsernameAvailable, loginWithGoogle, isLoading } = useAuth();

  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live handle availability validation
  const handleUsernameBlur = async () => {
    const clean = username.trim().toLowerCase();
    if (clean.length < 3) {
      setUsernameStatus('idle');
      return;
    }
    setUsernameStatus('checking');
    const available = await checkUsernameAvailable(clean);
    setUsernameStatus(available ? 'available' : 'taken');
  };

  // Password strength indicators
  const hasMinLength = password.length >= 8;
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!displayName.trim() || !username.trim() || !email.trim() || !password || !confirmPassword) {
      setError('Please fill out all required fields.');
      return;
    }

    if (username.length < 3) {
      setError('Gamer handle must be at least 3 characters long.');
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError('Gamer handle can only contain letters, numbers, and underscores.');
      return;
    }

    if (!hasMinLength) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter your password.');
      return;
    }

    if (!agreedTerms) {
      setError('You must agree to the GameOut Terms of Service and Privacy Policy to continue.');
      return;
    }

    setIsSubmitting(true);
    try {
      await registerWithEmail({
        displayName: displayName.trim(),
        username: username.trim().toLowerCase(),
        email: email.trim(),
        password,
        dateOfBirth: dateOfBirth || undefined
      });

      if (onSuccessRedirect) onSuccessRedirect();
      else onNavigate('home');
    } catch (err: any) {
      console.error('Registration error:', err);
      let msg = 'Registration failed. Please check your information.';
      if (err.code === 'auth/email-already-in-use') {
        msg = 'This email address is already associated with an account. Try logging in instead.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'The chosen password is too weak. Please choose a stronger password.';
      } else if (err.message) {
        msg = err.message;
      }
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setIsSubmitting(true);
    try {
      await loginWithGoogle();
      if (onSuccessRedirect) onSuccessRedirect();
      else onNavigate('home');
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message || 'Google registration failed.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6FC] text-[#172033] flex flex-col justify-center py-10 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center">
        <div className="inline-block mb-3">
          <GameOutLogo size="xl" onClick={() => onNavigate('landing')} />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#10234A] tracking-tight">
          Create Your Gamer Identity
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-[#697386]">
          Claim your unique gamer handle, document your timeline, and squad up.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl border border-[#E4E9F2] shadow-xl shadow-blue-900/5">
          {error && (
            <div className="mb-5 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Display Name & Handle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-bold text-[#172033] mb-1">
                  Full Name / Display Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-[#697386]" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Alex Rivers"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-[#F4F6FC] focus:bg-white text-sm text-[#172033] rounded-xl border border-[#E4E9F2] focus:border-[#1768DF] focus:outline-hidden transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-[#172033]">
                    Gamer Handle <span className="text-red-500">*</span>
                  </label>
                  {usernameStatus === 'available' && (
                    <span className="text-[11px] font-bold text-[#16A36A] flex items-center gap-1">
                      <Check className="w-3 h-3" /> Handle available
                    </span>
                  )}
                  {usernameStatus === 'taken' && (
                    <span className="text-[11px] font-bold text-red-500">
                      Handle already taken
                    </span>
                  )}
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 font-bold text-[#697386]">@</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''));
                      setUsernameStatus('idle');
                    }}
                    onBlur={handleUsernameBlur}
                    placeholder="shadow_strike"
                    className="w-full pl-8 pr-3.5 py-2.5 bg-[#F4F6FC] focus:bg-white text-sm text-[#172033] rounded-xl border border-[#E4E9F2] focus:border-[#1768DF] focus:outline-hidden transition-colors font-mono"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block font-bold text-[#172033] mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-[#697386]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="gamer@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-[#F4F6FC] focus:bg-white text-sm text-[#172033] rounded-xl border border-[#E4E9F2] focus:border-[#1768DF] focus:outline-hidden transition-colors"
                  required
                />
              </div>
            </div>

            {/* Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-bold text-[#172033] mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-[#697386]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    className="w-full pl-10 pr-10 py-2.5 bg-[#F4F6FC] focus:bg-white text-sm text-[#172033] rounded-xl border border-[#E4E9F2] focus:border-[#1768DF] focus:outline-hidden transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-[#697386] hover:text-[#172033] cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#172033] mb-1">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-[#697386]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-[#F4F6FC] focus:bg-white text-sm text-[#172033] rounded-xl border border-[#E4E9F2] focus:border-[#1768DF] focus:outline-hidden transition-colors"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Password requirements meter */}
            <div className="flex flex-wrap gap-3 text-[11px] text-[#697386] pt-0.5">
              <span className={`flex items-center gap-1 ${hasMinLength ? 'text-[#16A36A] font-bold' : ''}`}>
                <Check className="w-3 h-3" /> 8+ chars
              </span>
              <span className={`flex items-center gap-1 ${hasNumber ? 'text-[#16A36A] font-bold' : ''}`}>
                <Check className="w-3 h-3" /> At least 1 number
              </span>
              <span className={`flex items-center gap-1 ${hasSpecial ? 'text-[#16A36A] font-bold' : ''}`}>
                <Check className="w-3 h-3" /> Special character
              </span>
            </div>

            {/* Date of Birth (Optional) */}
            <div>
              <label className="block font-bold text-[#172033] mb-1">
                Date of Birth (Optional, for community age grouping)
              </label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-3 w-4 h-4 text-[#697386]" />
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-[#F4F6FC] focus:bg-white text-sm text-[#172033] rounded-xl border border-[#E4E9F2] focus:border-[#1768DF] focus:outline-hidden transition-colors"
                />
              </div>
            </div>

            {/* Terms & Privacy checkbox */}
            <div className="pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                  className="mt-0.5 rounded text-[#1768DF] focus:ring-[#1768DF]"
                  required
                />
                <span className="text-xs text-[#697386] leading-relaxed">
                  I agree to the{' '}
                  <span className="text-[#1768DF] font-bold hover:underline">GameOut Terms of Service</span> and{' '}
                  <span className="text-[#1768DF] font-bold hover:underline">Privacy Policy</span>. My gamer identity profile will be publicly discoverable.
                </span>
              </label>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="w-full mt-3 py-3 bg-[#1768DF] hover:bg-[#1255be] disabled:opacity-60 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-blue-600/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Gamer Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Social Divider */}
          <div className="mt-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E4E9F2]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white text-[#697386] font-medium">Or quick register with</span>
            </div>
          </div>

          {/* Google Sign-in Button */}
          <div className="mt-6">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isSubmitting || isLoading}
              className="w-full py-2.5 px-4 bg-white hover:bg-[#F4F6FC] border border-[#E4E9F2] rounded-xl text-xs sm:text-sm font-bold text-[#172033] shadow-xs flex items-center justify-center gap-3 transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Register with Google</span>
            </button>
          </div>

          {/* Login Link */}
          <div className="mt-6 pt-5 border-t border-[#E4E9F2] text-center text-xs text-[#697386]">
            Already have a GameOut account?{' '}
            <button
              onClick={() => onNavigate('landing')}
              className="font-bold text-[#1768DF] hover:underline cursor-pointer"
            >
              Log in to your account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
