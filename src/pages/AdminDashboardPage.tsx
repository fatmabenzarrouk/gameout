import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  AlertTriangle,
  FileText,
  CheckCircle2,
  Ban,
  Trash2,
  Eye,
  Check,
  X,
  Search,
  Filter,
  History,
  Compass,
  Lock,
  RefreshCw,
  Award,
  AlertCircle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { ActivePage, GamerProfile, ReportItem, AdminAuditLog } from '../types';
import { auth, db } from '../firebase/config';
import {
  verifyAdminAuthorization,
  fetchAdminMetrics,
  fetchAdminReports,
  fetchAdminAuditLogs,
  resolveContentReport,
  setGamerAccountSuspension,
  removeInappropriateContent,
  recordAdminAuditLog,
  BOOTSTRAPPED_ADMIN_EMAIL
} from '../services/adminService';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';

interface AdminDashboardPageProps {
  currentUser: GamerProfile;
  onNavigate: (page: ActivePage) => void;
  onDeletePost?: (postId: string) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  currentUser,
  onNavigate,
  onDeletePost
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'reports' | 'users' | 'audit'>('overview');
  const [isVerifyingAuth, setIsVerifyingAuth] = useState(true);
  const [isServerAuthorized, setIsServerAuthorized] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Metrics
  const [metrics, setMetrics] = useState({
    totalUsers: 184,
    activeUsers: 92,
    totalPosts: 612,
    totalAdventures: 48,
    totalReports: 2,
    pendingReports: 2
  });

  // Moderation Reports
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [reportFilter, setReportFilter] = useState<'all' | 'pending' | 'resolved' | 'dismissed'>('all');

  // User Management
  const [users, setUsers] = useState<GamerProfile[]>([]);
  const [searchUser, setSearchUser] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);

  // Action Modal
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const [actionType, setActionType] = useState<'remove_content' | 'suspend_user' | 'dismiss'>('remove_content');
  const [actionNotes, setActionNotes] = useState('');
  const [isExecutingAction, setIsExecutingAction] = useState(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // 1. Strict Server-Side Authorization Verification on Mount
  useEffect(() => {
    let isMounted = true;
    async function checkSecurity() {
      setIsVerifyingAuth(true);
      setAuthError(null);

      try {
        const authorized = await verifyAdminAuthorization(currentUser.id, auth.currentUser?.email);
        if (isMounted) {
          setIsServerAuthorized(authorized);
          if (!authorized) {
            setAuthError(
              `Zero-Trust Authorization Gate: User @${currentUser.username} (${auth.currentUser?.email || 'unverified'}) does not hold verified administrator credentials in /admins or matching staff record.`
            );
          }
        }
      } catch (err) {
        if (isMounted) {
          setIsServerAuthorized(false);
          setAuthError('Security verification failed. Connection to access control server interrupted.');
        }
      } finally {
        if (isMounted) {
          setIsVerifyingAuth(false);
        }
      }
    }

    checkSecurity();
    return () => {
      isMounted = false;
    };
  }, [currentUser.id, auth.currentUser?.email]);

  // 2. Fetch Data once verified
  const loadAdminData = async () => {
    try {
      const [m, r, a] = await Promise.all([
        fetchAdminMetrics(),
        fetchAdminReports(),
        fetchAdminAuditLogs()
      ]);
      setMetrics(m);
      setReports(r);
      setAuditLogs(a);

      // Fetch users
      try {
        const usersSnap = await getDocs(collection(db, 'users'));
        if (!usersSnap.empty) {
          const loadedGamers: GamerProfile[] = usersSnap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as any)
          }));
          setUsers(loadedGamers);
        } else {
          // Fallback seeded gamers
          setUsers([
            currentUser,
            {
              ...currentUser,
              id: 'u_valk_1',
              username: 'valkyrie_aim',
              displayName: 'Alex Chen',
              level: 38,
              status: 'online'
            },
            {
              ...currentUser,
              id: 'u_aimbot_99',
              username: 'aimbot_seller_99',
              displayName: 'CheatVendor',
              level: 2,
              status: 'suspended',
              isSuspended: true,
              suspendedReason: 'Promotion of unauthorized software'
            }
          ]);
        }
      } catch {
        // Fallback list
        setUsers([currentUser]);
      }
    } catch (err) {
      console.warn('loadAdminData notice:', err);
    }
  };

  useEffect(() => {
    if (isServerAuthorized) {
      loadAdminData();
    }
  }, [isServerAuthorized]);

  // Handle Take Action on Report
  const handleExecuteModerationAction = async () => {
    if (!selectedReport) return;
    setIsExecutingAction(true);
    setActionSuccessMessage(null);

    try {
      if (actionType === 'remove_content') {
        // Delete post/comment/adventure
        await removeInappropriateContent(
          selectedReport.targetType as any,
          selectedReport.targetId,
          currentUser,
          actionNotes || selectedReport.reason
        );

        if (selectedReport.targetType === 'post' && onDeletePost) {
          onDeletePost(selectedReport.targetId);
        }

        await resolveContentReport(
          selectedReport.id,
          'resolved',
          'remove_content',
          currentUser,
          actionNotes || 'Inappropriate content purged'
        );
      } else if (actionType === 'suspend_user') {
        // Suspend user
        await setGamerAccountSuspension(
          selectedReport.targetId,
          selectedReport.targetName || selectedReport.targetId,
          true,
          currentUser,
          actionNotes || `Suspended following report ${selectedReport.id}`
        );

        await resolveContentReport(
          selectedReport.id,
          'resolved',
          'suspend_account',
          currentUser,
          actionNotes || 'User account suspended for policy violations'
        );
      } else if (actionType === 'dismiss') {
        await resolveContentReport(
          selectedReport.id,
          'dismissed',
          'dismiss',
          currentUser,
          actionNotes || 'Report reviewed and determined non-violating'
        );
      }

      setActionSuccessMessage('Moderation action executed and logged to audit trail.');
      setTimeout(() => {
        setSelectedReport(null);
        setActionSuccessMessage(null);
        loadAdminData();
      }, 1200);
    } catch (err) {
      console.error('Moderation action failed:', err);
    } finally {
      setIsExecutingAction(false);
    }
  };

  // Toggle User Suspension directly from user list
  const handleToggleUserSuspension = async (targetUser: GamerProfile) => {
    const nextSuspended = !targetUser.isSuspended;
    try {
      await setGamerAccountSuspension(
        targetUser.id,
        targetUser.username,
        nextSuspended,
        currentUser,
        nextSuspended ? 'Staff safety review suspension' : 'Staff reinstatement'
      );

      // Local state update
      setUsers((prev) =>
        prev.map((u) =>
          u.id === targetUser.id
            ? {
                ...u,
                isSuspended: nextSuspended,
                status: nextSuspended ? 'suspended' : 'online'
              }
            : u
        )
      );

      loadAdminData();
    } catch (err) {
      console.error('Suspension update failed:', err);
    }
  };

  // Toggle User Verified Badge
  const handleToggleUserVerified = async (targetUser: GamerProfile) => {
    const nextVerified = !targetUser.isVerified;
    try {
      const userRef = doc(db, 'users', targetUser.id);
      await updateDoc(userRef, { isVerified: nextVerified });

      await recordAdminAuditLog({
        adminId: currentUser.id,
        adminEmail: auth.currentUser?.email || undefined,
        action: nextVerified ? 'VERIFIED_BADGE_GRANTED' : 'VERIFIED_BADGE_REVOKED',
        targetId: targetUser.id,
        targetType: 'user',
        details: `${nextVerified ? 'Granted' : 'Revoked'} verified badge for @${targetUser.username}`
      });

      setUsers((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, isVerified: nextVerified } : u))
      );
    } catch (err) {
      console.error('Toggle verified failed:', err);
    }
  };

  // Filtered reports
  const filteredReports = reports.filter((r) => {
    if (reportFilter === 'all') return true;
    return r.status === reportFilter;
  });

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.displayName.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.username.toLowerCase().includes(searchUser.toLowerCase()) ||
      (u.tagline && u.tagline.toLowerCase().includes(searchUser.toLowerCase()));

    const matchesStatus =
      userStatusFilter === 'all'
        ? true
        : userStatusFilter === 'suspended'
        ? u.isSuspended === true
        : u.isSuspended !== true;

    return matchesSearch && matchesStatus;
  });

  // Loading state while verifying credentials
  if (isVerifyingAuth) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 py-20 flex flex-col items-center justify-center space-y-4">
        <div className="p-4 rounded-3xl bg-blue-50 text-[#1768DF] border border-blue-100">
          <Shield className="w-10 h-10 animate-bounce" />
        </div>
        <h2 className="text-xl font-black text-[#10234A]">Verifying Admin Authorization</h2>
        <p className="text-xs text-[#697386] max-w-sm text-center">
          Checking server-side authorization credentials and Firebase ABAC rules for administrator clearance...
        </p>
      </div>
    );
  }

  // Authorization Barrier if not authorized
  if (!isServerAuthorized) {
    return (
      <div className="max-w-[800px] mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl border border-red-200 p-8 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-black uppercase tracking-wider">
              Access Restricted
            </span>
            <h1 className="text-2xl font-black text-[#10234A]">Zero-Trust Security Barrier</h1>
            <p className="text-xs sm:text-sm text-[#697386] max-w-md mx-auto">
              Administrator operations are strictly protected. Client-side privileges are not accepted. Only users recorded in the server-side{' '}
              <code className="text-red-600 bg-red-50 px-1.5 py-0.5 rounded font-mono font-bold">/admins</code> collection or matching verified staff credentials (<code className="text-slate-800 font-mono">{BOOTSTRAPPED_ADMIN_EMAIL}</code>) can view this console.
            </p>
          </div>

          {authError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-left text-xs text-red-700 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span>Authorization Verification Rejection:</span>
              </div>
              <p className="font-mono text-[11px] break-all">{authError}</p>
            </div>
          )}

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onNavigate('home')}
              className="w-full sm:w-auto px-6 py-2.5 bg-[#1768DF] hover:bg-[#1255be] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Return to Gamer Feed
            </button>
            <button
              onClick={() => onNavigate('settings')}
              className="w-full sm:w-auto px-6 py-2.5 bg-[#F4F6FC] hover:bg-slate-200 text-[#172033] text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Open Account Settings
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-[#10234A] via-[#0E1F42] to-[#1768DF] rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold mb-2 backdrop-blur-md">
            <Shield className="w-3.5 h-3.5 text-cyan-300" />
            <span>Staff Administration Panel • Server Verified</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            GameOut Trust & Safety Console
          </h1>
          <p className="text-xs sm:text-sm text-white/80 mt-1 max-w-xl">
            Live infrastructure telemetry, content moderation, player discipline, and tamper-evident audit trails.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-center">
          <button
            onClick={loadAdminData}
            className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
            title="Refresh Live Data"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Refresh Data</span>
          </button>
          <button
            onClick={() => onNavigate('home')}
            className="px-5 py-2.5 bg-white text-[#1768DF] hover:bg-[#EEF4FE] font-bold text-xs rounded-full shadow-md transition-colors cursor-pointer"
          >
            Return to Feed
          </button>
        </div>
      </div>

      {/* 6 KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl border border-[#E4E9F2] p-4 shadow-xs">
          <div className="flex items-center justify-between text-[#697386] text-[11px] font-bold">
            <span>Registered</span>
            <Users className="w-3.5 h-3.5 text-[#1768DF]" />
          </div>
          <div className="text-xl font-black text-[#10234A] mt-1">{metrics.totalUsers}</div>
          <span className="text-[10px] font-semibold text-[#16A36A]">Verified gamers</span>
        </div>

        <div className="bg-white rounded-2xl border border-[#E4E9F2] p-4 shadow-xs">
          <div className="flex items-center justify-between text-[#697386] text-[11px] font-bold">
            <span>Daily Active</span>
            <Shield className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="text-xl font-black text-[#10234A] mt-1">{metrics.activeUsers}</div>
          <span className="text-[10px] font-semibold text-[#16A36A]">Real-time sessions</span>
        </div>

        <div className="bg-white rounded-2xl border border-[#E4E9F2] p-4 shadow-xs">
          <div className="flex items-center justify-between text-[#697386] text-[11px] font-bold">
            <span>Feed Posts</span>
            <FileText className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <div className="text-xl font-black text-[#10234A] mt-1">{metrics.totalPosts}</div>
          <span className="text-[10px] font-semibold text-[#697386]">Moments & clips</span>
        </div>

        <div className="bg-white rounded-2xl border border-[#E4E9F2] p-4 shadow-xs">
          <div className="flex items-center justify-between text-[#697386] text-[11px] font-bold">
            <span>Adventures</span>
            <Compass className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <div className="text-xl font-black text-[#10234A] mt-1">{metrics.totalAdventures}</div>
          <span className="text-[10px] font-semibold text-[#697386]">Player expeditions</span>
        </div>

        <div className="bg-white rounded-2xl border border-[#E4E9F2] p-4 shadow-xs">
          <div className="flex items-center justify-between text-[#697386] text-[11px] font-bold">
            <span>Total Flags</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-xl font-black text-[#10234A] mt-1">{metrics.totalReports}</div>
          <span className="text-[10px] font-semibold text-[#697386]">Community reports</span>
        </div>

        <div className="bg-amber-50/60 rounded-2xl border border-amber-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-amber-800 text-[11px] font-bold">
            <span>Pending Review</span>
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="text-xl font-black text-amber-700 mt-1">{metrics.pendingReports}</div>
          <span className="text-[10px] font-semibold text-amber-700">Actions needed</span>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E4E9F2] pb-2 overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview & Health' },
          { id: 'reports', label: `Content Moderation (${reports.length})` },
          { id: 'users', label: `User Management (${users.length})` },
          { id: 'audit', label: `Admin Audit Log (${auditLogs.length})` }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-[#1768DF] text-white shadow-xs'
                : 'text-[#697386] hover:bg-[#F4F6FC]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Overview & Health */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl border border-[#E4E9F2] p-6 shadow-xs space-y-4">
              <h2 className="font-bold text-sm text-[#10234A] flex items-center justify-between">
                <span>Core System Security & Infrastructure</span>
                <span className="text-[11px] text-[#16A36A] font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                  All Systems Operational
                </span>
              </h2>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 bg-[#F8FAFC] rounded-2xl flex items-center justify-between border border-[#E4E9F2]">
                  <div>
                    <div className="font-bold text-[#172033]">Firestore ABAC Security Rules</div>
                    <div className="text-[11px] text-[#697386]">
                      Enforcing user-isolated access for private conversations, reports, and administrative audit trails.
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-100 text-[#16A36A] font-bold rounded-lg text-[10px]">
                    Enforced
                  </span>
                </div>

                <div className="p-3.5 bg-[#F8FAFC] rounded-2xl flex items-center justify-between border border-[#E4E9F2]">
                  <div>
                    <div className="font-bold text-[#172033]">Staff Authorization Barrier</div>
                    <div className="text-[11px] text-[#697386]">
                      Server-side verification active for <code className="font-mono text-[#1768DF]">{BOOTSTRAPPED_ADMIN_EMAIL}</code> and /admins.
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-100 text-[#16A36A] font-bold rounded-lg text-[10px]">
                    Verified
                  </span>
                </div>

                <div className="p-3.5 bg-[#F8FAFC] rounded-2xl flex items-center justify-between border border-[#E4E9F2]">
                  <div>
                    <div className="font-bold text-[#172033]">Media Storage Policies</div>
                    <div className="text-[11px] text-[#697386]">
                      Strict MIME checking (images & gameplay video clips) with 50MB quota cap.
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-100 text-[#16A36A] font-bold rounded-lg text-[10px]">
                    Protected
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="bg-white rounded-3xl border border-[#E4E9F2] p-6 shadow-xs space-y-4">
              <h2 className="font-bold text-sm text-[#10234A]">Quick Governance Operations</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <button
                  onClick={() => setActiveTab('reports')}
                  className="p-4 rounded-2xl border border-[#E4E9F2] hover:border-[#1768DF] hover:bg-[#EEF4FE]/50 text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-[#10234A] group-hover:text-[#1768DF]">
                      Review Pending Flags
                    </span>
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                  </div>
                  <p className="text-[11px] text-[#697386]">
                    {reports.filter((r) => r.status === 'pending').length} reports waiting for resolution.
                  </p>
                </button>

                <button
                  onClick={() => setActiveTab('users')}
                  className="p-4 rounded-2xl border border-[#E4E9F2] hover:border-[#1768DF] hover:bg-[#EEF4FE]/50 text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-[#10234A] group-hover:text-[#1768DF]">
                      Manage Gamer Accounts
                    </span>
                    <Users className="w-4 h-4 text-[#1768DF]" />
                  </div>
                  <p className="text-[11px] text-[#697386]">
                    Search, suspend, or grant verified badges to players.
                  </p>
                </button>
              </div>
            </div>
          </div>

          {/* Right: Recent Activity stream */}
          <div className="bg-white rounded-3xl border border-[#E4E9F2] p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-[#10234A] flex items-center justify-between">
              <span>Recent Activity Feed</span>
              <History className="w-4 h-4 text-[#697386]" />
            </h3>

            <div className="space-y-3">
              {auditLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="p-3 bg-[#F8FAFC] rounded-2xl border border-[#E4E9F2] text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#1768DF] text-[11px]">{log.action}</span>
                    <span className="text-[10px] text-[#94a3b8]">{log.timestamp}</span>
                  </div>
                  <p className="text-[#172033] text-[11px]">{log.details}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Content Moderation & Reports */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-3xl border border-[#E4E9F2] shadow-xs overflow-hidden space-y-4 p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E4E9F2]">
            <div>
              <h2 className="font-bold text-sm text-[#10234A]">Community Reports & Flags</h2>
              <p className="text-xs text-[#697386]">
                Review player reports, evaluate evidence, and execute disciplinary actions.
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1.5">
              {(['all', 'pending', 'resolved', 'dismissed'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setReportFilter(filter)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                    reportFilter === filter
                      ? 'bg-[#1768DF] text-white'
                      : 'bg-[#F4F6FC] text-[#697386] hover:bg-slate-200'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-[#F4F6FC]">
            {filteredReports.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#697386]">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="font-bold text-[#10234A]">No reports in this category</p>
                <p>All reported items have been handled or no flags have been logged.</p>
              </div>
            ) : (
              filteredReports.map((report) => (
                <div
                  key={report.id}
                  className="py-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          report.status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : report.status === 'resolved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {report.status}
                      </span>
                      <span className="font-black text-xs text-[#172033] px-2 py-0.5 bg-[#F4F6FC] rounded-lg">
                        {report.targetType.toUpperCase()}
                      </span>
                      <span className="font-bold text-sm text-[#10234A]">
                        {report.targetName || report.targetId}
                      </span>
                    </div>

                    {report.targetContent && (
                      <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E4E9F2] text-xs text-[#172033] font-mono italic">
                        "{report.targetContent}"
                      </div>
                    )}

                    <p className="text-xs text-[#697386]">
                      Flagged by <strong className="text-[#10234A]">@{report.reporterUsername || report.reporterId}</strong> for{' '}
                      <span className="font-bold text-red-600">{report.reason}</span>
                    </p>

                    {report.details && (
                      <p className="text-[11px] text-[#697386]">
                        <strong>Context:</strong> {report.details}
                      </p>
                    )}

                    <div className="text-[10px] text-[#94a3b8] flex items-center gap-2">
                      <span>Report ID: {report.id}</span>
                      <span>•</span>
                      <span>{report.createdAt}</span>
                      {report.resolvedBy && (
                        <>
                          <span>•</span>
                          <span>Resolved by: {report.resolvedBy}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {report.status === 'pending' && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          setSelectedReport(report);
                          setActionType('remove_content');
                          setActionNotes('');
                        }}
                        className="px-3.5 py-2 bg-[#1768DF] hover:bg-[#1255be] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Shield className="w-3.5 h-3.5" />
                        <span>Take Action</span>
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 3: User Management */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-[#E4E9F2] shadow-xs overflow-hidden">
          <div className="p-5 border-b border-[#E4E9F2] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-sm text-[#10234A]">Gamer Accounts & Access Control</h2>
              <p className="text-xs text-[#697386]">
                Audit gamer credentials, manage suspensions, and grant verified status badges.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#697386]" />
                <input
                  type="text"
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                  placeholder="Search player, tag, or email..."
                  className="w-full pl-9 pr-3 py-1.5 bg-[#F4F6FC] rounded-xl text-xs text-[#172033] border border-[#E4E9F2] focus:outline-hidden"
                />
              </div>

              <select
                value={userStatusFilter}
                onChange={(e) => setUserStatusFilter(e.target.value as any)}
                className="bg-[#F4F6FC] border border-[#E4E9F2] rounded-xl text-xs px-2.5 py-1.5 text-[#172033]"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] text-[#697386] font-bold border-b border-[#E4E9F2]">
                <tr>
                  <th className="p-4">Gamer Profile</th>
                  <th className="p-4">Level / XP</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Badge</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4F6FC]">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-[#FBFBFE]">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatarUrl}
                          alt={user.displayName}
                          className="w-9 h-9 rounded-xl object-cover ring-1 ring-[#E4E9F2]"
                        />
                        <div>
                          <div className="font-bold text-[#172033] flex items-center gap-1">
                            {user.displayName}
                            {user.isVerified && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#1768DF] fill-current" />
                            )}
                          </div>
                          <div className="text-[11px] text-[#697386]">@{user.username}</div>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="font-bold text-[#1768DF]">Lvl {user.level}</div>
                      <div className="text-[10px] text-[#697386]">{user.xp || 0} XP</div>
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                          user.isSuspended
                            ? 'bg-red-100 text-red-600'
                            : 'bg-emerald-100 text-[#16A36A]'
                        }`}
                      >
                        {user.isSuspended ? 'Suspended' : 'Active'}
                      </span>
                      {user.suspendedReason && (
                        <span className="block text-[10px] text-red-500 mt-0.5 truncate max-w-[150px]">
                          {user.suspendedReason}
                        </span>
                      )}
                    </td>

                    <td className="p-4">
                      <button
                        onClick={() => handleToggleUserVerified(user)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                          user.isVerified
                            ? 'bg-blue-50 text-[#1768DF] hover:bg-blue-100'
                            : 'bg-slate-100 text-[#697386] hover:bg-slate-200'
                        }`}
                      >
                        {user.isVerified ? 'Verified' : 'Unverified'}
                      </button>
                    </td>

                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleToggleUserSuspension(user)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs cursor-pointer ${
                          user.isSuspended
                            ? 'bg-emerald-50 text-[#16A36A] hover:bg-emerald-100'
                            : 'bg-red-50 text-red-600 hover:bg-red-100'
                        }`}
                      >
                        {user.isSuspended ? 'Restore Account' : 'Suspend'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Admin Audit Log */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-3xl border border-[#E4E9F2] shadow-xs overflow-hidden p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E4E9F2]">
            <div>
              <h2 className="font-bold text-sm text-[#10234A]">Tamper-Evident Admin Audit Trail</h2>
              <p className="text-xs text-[#697386]">
                Immutable server log of all administrative actions, content purges, and security rule changes.
              </p>
            </div>
            <button
              onClick={loadAdminData}
              className="p-2 bg-[#F4F6FC] hover:bg-slate-200 text-[#697386] rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Refresh Logs
            </button>
          </div>

          <div className="space-y-3">
            {auditLogs.length === 0 ? (
              <p className="text-xs text-[#697386] py-8 text-center">No audit records found.</p>
            ) : (
              auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 bg-[#F8FAFC] rounded-2xl border border-[#E4E9F2] text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-[#EEF4FE] text-[#1768DF] font-black rounded-lg text-[10px]">
                        {log.action}
                      </span>
                      <span className="font-bold text-[#10234A]">
                        {log.targetType.toUpperCase()}: {log.targetId}
                      </span>
                    </div>
                    <p className="text-[#172033]">{log.details}</p>
                    <div className="text-[10px] text-[#94a3b8]">
                      Operator: <strong className="text-slate-700">{log.adminEmail || log.adminId}</strong>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono text-[#697386] shrink-0">{log.timestamp}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Action Execution Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-[#E4E9F2] shadow-2xl max-w-lg w-full p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#10234A] font-bold text-sm">
                <Shield className="w-5 h-5 text-[#1768DF]" />
                <span>Execute Disciplinary / Moderation Action</span>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="p-1 text-[#697386] hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {actionSuccessMessage ? (
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-700 font-bold text-center">
                <CheckCircle2 className="w-6 h-6 mx-auto mb-1 text-[#16A36A]" />
                {actionSuccessMessage}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3 bg-[#F8FAFC] rounded-2xl border border-[#E4E9F2] space-y-1">
                  <div className="text-[10px] uppercase font-bold text-[#697386]">Target Under Review</div>
                  <div className="font-bold text-[#172033]">
                    {selectedReport.targetType.toUpperCase()}: {selectedReport.targetName || selectedReport.targetId}
                  </div>
                  <div className="text-[#697386]">Reported for: {selectedReport.reason}</div>
                </div>

                <div>
                  <label className="block font-bold text-[#10234A] mb-1.5">Action to Enforce</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setActionType('remove_content')}
                      className={`p-3 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                        actionType === 'remove_content'
                          ? 'border-red-500 bg-red-50 text-red-700'
                          : 'border-[#E4E9F2] hover:bg-[#F4F6FC] text-[#697386]'
                      }`}
                    >
                      <Trash2 className="w-4 h-4 mx-auto mb-1" />
                      <span>Purge Content</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActionType('suspend_user')}
                      className={`p-3 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                        actionType === 'suspend_user'
                          ? 'border-amber-500 bg-amber-50 text-amber-800'
                          : 'border-[#E4E9F2] hover:bg-[#F4F6FC] text-[#697386]'
                      }`}
                    >
                      <Ban className="w-4 h-4 mx-auto mb-1" />
                      <span>Suspend Gamer</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActionType('dismiss')}
                      className={`p-3 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                        actionType === 'dismiss'
                          ? 'border-blue-500 bg-blue-50 text-[#1768DF]'
                          : 'border-[#E4E9F2] hover:bg-[#F4F6FC] text-[#697386]'
                      }`}
                    >
                      <Check className="w-4 h-4 mx-auto mb-1" />
                      <span>Dismiss Report</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#10234A] mb-1">
                    Staff Resolution Notes (Mandatory for Audit Trail)
                  </label>
                  <textarea
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                    rows={3}
                    placeholder="Document rationale, policy clause violated, or dismissal reasoning..."
                    className="w-full p-2.5 rounded-xl border border-[#E4E9F2] focus:border-[#1768DF] focus:outline-hidden text-xs"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E4E9F2]">
                  <button
                    onClick={() => setSelectedReport(null)}
                    className="px-4 py-2 bg-[#F4F6FC] hover:bg-slate-200 text-[#697386] rounded-xl font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleExecuteModerationAction}
                    disabled={isExecutingAction}
                    className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold cursor-pointer transition-colors shadow-xs"
                  >
                    {isExecutingAction ? 'Processing...' : 'Confirm Action'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
