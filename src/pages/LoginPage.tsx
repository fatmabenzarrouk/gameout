import React, { useState } from 'react';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Gamepad2
} from 'lucide-react';
import { GameOutLogo } from '../components/common/GameOutLogo';
import { useAuth } from '../contexts/AuthContext';
import { ActivePage } from '../types';

interface LoginPageProps {
  onNavigate: (page: ActivePage) => void;
  onSuccessRedirect?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onNavigate,
  onSuccessRedirect
}) => {
  const { loginWithEmail, loginWithGoogle, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both your email address and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await loginWithEmail(email, password);
      if (onSuccessRedirect) onSuccessRedirect();
      else onNavigate('home');
    } catch (err: any) {
      console.error('Login error:', err);
      let msg = 'Failed to sign in. Please verify your credentials.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        msg = 'Invalid email or password. Please check your credentials and try again.';
      } else if (err.code === 'auth/too-many-requests') {
        msg = 'Too many failed login attempts. Please reset your password or try again later.';
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
      console.error('Google Sign-in error:', err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message || 'Google authentication was cancelled or failed.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6FC] text-[#172033] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-block mb-3">
          <GameOutLogo size="xl" onClick={() => onNavigate('landing')} />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#10234A] tracking-tight">
          Welcome Back to GameOut
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm text-[#697386]">
          Your Gaming Life. Your Identity. Your Community.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl border border-[#E4E9F2] shadow-xl shadow-blue-900/5">
          {error && (
            <div className="mb-5 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Email Field */}
            <div>
              <label className="block font-bold text-[#172033] mb-1">
                Email Address
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
                  autoFocus
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-[#172033]">Password</label>
                <button
                  type="button"
                  onClick={() => onNavigate('privacy')}
                  className="text-[11px] font-semibold text-[#1768DF] hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-[#697386]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-[#F4F6FC] focus:bg-white text-sm text-[#172033] rounded-xl border border-[#E4E9F2] focus:border-[#1768DF] focus:outline-hidden transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-[#697386] hover:text-[#172033] cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-[#1768DF] focus:ring-[#1768DF]"
                />
                <span className="text-xs text-[#697386] font-medium">Remember this device</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="w-full mt-2 py-3 bg-[#1768DF] hover:bg-[#1255be] disabled:opacity-60 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-blue-600/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
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
              <span className="px-3 bg-white text-[#697386] font-medium">Or continue with</span>
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
              <span>Continue with Google</span>
            </button>
          </div>

          {/* Registration Link */}
          <div className="mt-6 pt-5 border-t border-[#E4E9F2] text-center text-xs text-[#697386]">
            New to GameOut?{' '}
            <button
              onClick={() => onNavigate('landing')}
              className="font-bold text-[#1768DF] hover:underline cursor-pointer"
            >
              Create a free Gamer Identity
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
