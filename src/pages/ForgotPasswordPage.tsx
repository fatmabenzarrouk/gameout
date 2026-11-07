import React, { useState } from 'react';
import {
  Mail,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { GameOutLogo } from '../components/common/GameOutLogo';
import { useAuth } from '../contexts/AuthContext';
import { ActivePage } from '../types';

interface ForgotPasswordPageProps {
  onNavigate: (page: ActivePage) => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onNavigate }) => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid registered email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPassword(email.trim());
      setSuccess(true);
    } catch (err: any) {
      console.error('Password reset error:', err);
      let msg = 'Failed to send password reset email. Please verify the email address.';
      if (err.code === 'auth/user-not-found') {
        msg = 'No GameOut gamer account exists with this email address.';
      } else if (err.message) {
        msg = err.message;
      }
      setError(msg);
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
          Reset Your Password
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm text-[#697386]">
          Enter your email to receive an official recovery link.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl border border-[#E4E9F2] shadow-xl shadow-blue-900/5">
          {error && (
            <div className="mb-5 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success ? (
            <div className="text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 text-[#16A36A] flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-lg font-bold text-[#10234A]">Reset Link Sent!</h2>
              <p className="text-xs text-[#697386] leading-relaxed">
                We've sent a password reset email to <strong className="text-[#172033]">{email}</strong>. Check your inbox and follow the instructions to choose a new password.
              </p>
              <button
                onClick={() => onNavigate('landing')}
                className="w-full mt-4 py-2.5 bg-[#1768DF] hover:bg-[#1255be] text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Return to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#172033] mb-1">
                  Registered Email Address
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

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3 bg-[#1768DF] hover:bg-[#1255be] disabled:opacity-60 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Send Reset Email</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-4 border-t border-[#E4E9F2] text-center">
                <button
                  type="button"
                  onClick={() => onNavigate('landing')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#697386] hover:text-[#1768DF] transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
