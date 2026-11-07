import React, { useState } from 'react';
import { Shield, AlertTriangle, X, Check, Flag } from 'lucide-react';
import { submitContentReport } from '../../services/adminService';

interface ReportContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetId: string;
  targetType: 'user' | 'post' | 'comment' | 'adventure';
  targetName?: string;
  targetContent?: string;
  currentUserId: string;
  currentUsername: string;
  onReportSuccess?: () => void;
}

export const ReportContentModal: React.FC<ReportContentModalProps> = ({
  isOpen,
  onClose,
  targetId,
  targetType,
  targetName = 'Target Content',
  targetContent,
  currentUserId,
  currentUsername,
  onReportSuccess
}) => {
  const [reason, setReason] = useState('Harassment & Toxicity');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await submitContentReport({
        reporterId: currentUserId,
        reporterUsername: currentUsername,
        targetId,
        targetType,
        targetName,
        targetContent: targetContent || '',
        reason,
        details: details.trim()
      });

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
        if (onReportSuccess) onReportSuccess();
      }, 1800);
    } catch (err) {
      console.error('Report submission failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl border border-[#E4E9F2] shadow-2xl max-w-md w-full p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-50 text-red-600">
              <Flag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base text-[#10234A]">Report {targetType.toUpperCase()}</h3>
              <p className="text-[11px] text-[#697386]">Help keep GameOut fair, respectful, and safe.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 text-[#697386] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-2 text-[#16A36A]">
            <Check className="w-8 h-8 mx-auto" />
            <h4 className="font-bold text-sm">Report Submitted for Staff Review</h4>
            <p className="text-xs text-[#697386]">
              Thank you for reporting. Our Trust & Safety team will review this item promptly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="p-3 bg-[#F8FAFC] rounded-2xl border border-[#E4E9F2]">
              <span className="font-bold text-[#697386] text-[10px] uppercase tracking-wider block">
                Flagging
              </span>
              <span className="font-bold text-[#172033] text-xs truncate block">{targetName}</span>
            </div>

            <div>
              <label className="block font-bold text-[#172033] mb-1.5">Violation Category</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#E4E9F2] text-xs bg-white focus:border-[#1768DF] focus:outline-hidden"
              >
                <option value="Harassment & Toxicity">Harassment, hate speech, or toxicity</option>
                <option value="Cheating / Third-Party Exploits">Cheating, botting, or hack selling</option>
                <option value="Spam / Phishing / Scam">Spam, malicious links, or scam promotion</option>
                <option value="Inappropriate / NSFW Content">Inappropriate, sexual, or graphic content</option>
                <option value="Impersonation / Fake Gamer">Impersonation or stolen gaming credentials</option>
                <option value="Other Policy Violation">Other policy violation</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-[#172033] mb-1.5">
                Additional Context (Optional)
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={3}
                placeholder="Describe what occurred or specify timestamps / lobby details..."
                className="w-full p-2.5 rounded-xl border border-[#E4E9F2] text-xs focus:border-[#1768DF] focus:outline-hidden"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-[#697386] hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                {isSubmitting ? 'Submitting...' : 'Send Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
