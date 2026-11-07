import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  User,
  Gamepad2,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { GameOutLogo } from '../common/GameOutLogo';
import { GamerProfile } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'register' | 'forgot';
  onClose: () => void;
  onLoginSuccess: (user?: GamerProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'login',
  onClose,
  onLoginSuccess
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (mode === 'forgot') {
      if (!email.includes('@')) {
        setError('Please provide a valid email address.');
        return;
      }
      setSuccessMsg(`Password reset instructions sent to ${email}`);
      return;
    }

    if (mode === 'register') {
      if (!username || !displayName) {
        setError('Please choose a gamer handle and display name.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }
    }

    if (mode === 'login') {
      if (!email || !password) {
        setError('Please enter your email and password.');
        return;
      }
    }

    // Success action
    onLoginSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-[#E4E9F2] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-[#E4E9F2] flex items-center justify-between">
          <GameOutLogo size="md" />
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#697386] hover:bg-[#F4F6FC] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <h2 className="text-xl font-black text-[#10234A]">
              {mode === 'login'
                ? 'Welcome back, Gamer'
                : mode === 'register'
                ? 'Create Your Gamer Identity'
                : 'Reset Your Password'}
            </h2>
            <p className="text-[#697386] text-xs mt-1">
              {mode === 'login'
                ? 'Log in to access your gaming experiences and team messages.'
                : mode === 'register'
                ? 'Claim your unique gamer handle and join the gaming network.'
                : 'Enter your registered email to receive a recovery link.'}
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 flex items-center gap-2 font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[#16A36A] flex items-center gap-2 font-semibold">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {mode === 'register' && (
            <>
              <div>
                <label className="block font-bold text-[#172033] mb-1">Gamer Handle (Username)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-[#697386] font-bold">@</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. shadow_strike"
                    className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-[#E4E9F2] text-sm focus:border-[#1768DF] focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#172033] mb-1">Display Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-[#697386]" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Alex Rivers"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#E4E9F2] text-sm focus:border-[#1768DF] focus:outline-hidden"
                    required
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block font-bold text-[#172033] mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-4 h-4 text-[#697386]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#E4E9F2] text-sm focus:border-[#1768DF] focus:outline-hidden"
                required
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-[#172033]">Password</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-[11px] text-[#1768DF] hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-[#697386]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#E4E9F2] text-sm focus:border-[#1768DF] focus:outline-hidden"
                  required
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-[#1768DF] hover:bg-[#1255be] text-white font-bold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <span>
              {mode === 'login'
                ? 'Log In to GameOut'
                : mode === 'register'
                ? 'Create Gamer Account'
                : 'Send Reset Link'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Toggle between Login and Register */}
          <div className="pt-2 text-center text-xs text-[#697386]">
            {mode === 'login' ? (
              <p>
                Don't have a GameOut account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="text-[#1768DF] font-bold hover:underline"
                >
                  Join now
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-[#1768DF] font-bold hover:underline"
                >
                  Log In
                </button>
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
