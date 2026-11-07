import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  UserPlus,
  UserCheck,
  Gamepad2,
  Shield,
  MessageSquare,
  Check,
  X,
  UserMinus,
  AlertTriangle,
  Send,
  Zap,
  MapPin,
  Monitor,
  Flame,
  Award,
  Sparkles,
  Ban,
  SlidersHorizontal,
  ChevronDown,
  Info
} from 'lucide-react';
import { SuggestedGamer, ActivePage, FriendRequest } from '../types';
import {
  sendFriendRequest as apiSendFriendRequest,
  acceptFriendRequest as apiAcceptFriendRequest,
  rejectFriendRequest as apiRejectFriendRequest,
  cancelFriendRequest as apiCancelFriendRequest,
  reportGamer,
  followGamer,
  unfollowGamer
} from '../services/socialService';

interface ExtendedGamer extends SuggestedGamer {
  level?: number;
  role?: string;
  platform?: string;
  location?: string;
  bio?: string;
  mutualFriends?: number;
  isFriend?: boolean;
}

interface GamingFriendsPageProps {
  suggestedGamers: ExtendedGamer[];
  onNavigate: (page: ActivePage) => void;
  onOpenDirectMessage?: (participantId: string) => void;
  currentUserId?: string;
  currentUserName?: string;
}

export const GamingFriendsPage: React.FC<GamingFriendsPageProps> = ({
  suggestedGamers: initialGamers,
  onNavigate,
  onOpenDirectMessage,
  currentUserId = 'user_fatma',
  currentUserName = 'Fatma Ben Zarrouk'
}) => {
  // Navigation tabs within Gaming Friends
  const [activeTab, setActiveTab] = useState<'discover' | 'incoming' | 'sent' | 'friends' | 'blocked'>('discover');

  // Directory state
  const [gamers, setGamers] = useState<ExtendedGamer[]>(initialGamers);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGame, setSelectedGame] = useState('All');
  const [selectedPlatform, setSelectedPlatform] = useState('All');
  const [selectedRole, setSelectedRole] = useState('All');
  const [selectedLevelBracket, setSelectedLevelBracket] = useState('All');
  const [locationQuery, setLocationQuery] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [showFiltersDrawer, setShowFiltersDrawer] = useState(false);

  // Incoming and sent friend requests
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([
    {
      id: 'req_1',
      senderId: 'gamer_zack',
      senderName: 'Zack Chrono',
      senderUsername: 'zackfps',
      senderAvatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      senderLevel: 28,
      senderGame: 'Valorant',
      receiverId: currentUserId,
      status: 'pending',
      note: 'Saw your Ascent clutch clip! Looking for a tactical initiator for our tournament 5-stack.',
      gameTag: 'Valorant',
      createdAt: '2 hours ago'
    },
    {
      id: 'req_2',
      senderId: 'user_elena',
      senderName: 'Elena Rostova',
      senderUsername: 'elena_builds',
      senderAvatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
      senderLevel: 22,
      senderGame: 'Minecraft',
      receiverId: currentUserId,
      status: 'pending',
      note: 'Would love to collaborate on the cathedral project on your SMP realm.',
      gameTag: 'Minecraft',
      createdAt: '1 day ago'
    }
  ]);

  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([
    {
      id: 'req_sent_1',
      senderId: currentUserId,
      senderName: currentUserName,
      senderUsername: 'fatmabenz',
      senderAvatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      senderLevel: 24,
      senderGame: 'Valorant',
      receiverId: 'gamer_maya',
      receiverName: 'Maya Lin',
      receiverUsername: 'rivals_maya',
      receiverAvatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      status: 'pending',
      note: 'Hey Maya! Would love to team up for Marvel Rivals Vanguard comps.',
      gameTag: 'Marvel Rivals',
      createdAt: '3 days ago'
    }
  ]);

  // Connected friends roster
  const [connectedFriends, setConnectedFriends] = useState<ExtendedGamer[]>([
    {
      id: 'user_alex',
      name: 'Alex Rivers',
      username: 'shadow_ninja',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      isVerified: false,
      followersCount: '4.8K followers',
      isFollowing: true,
      primaryGame: 'Apex Legends',
      level: 19,
      role: 'Competitive Player',
      platform: 'PC',
      location: 'Austin, Texas',
      mutualFriends: 8,
      isFriend: true
    },
    {
      id: 'user_sarah',
      name: 'Sarah Vance',
      username: 'valkyrie_aim',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      isVerified: true,
      followersCount: '32.1K followers',
      isFollowing: true,
      primaryGame: 'Valorant',
      level: 24,
      role: 'Streamer',
      platform: 'PC',
      location: 'Toronto, Canada',
      mutualFriends: 15,
      isFriend: true
    }
  ]);

  // Blocked gamers list
  const [blockedUsers, setBlockedUsers] = useState<{ id: string; name: string; username: string; blockedAt: string }[]>([]);

  // Send request modal state
  const [requestModalGamer, setRequestModalGamer] = useState<ExtendedGamer | null>(null);
  const [requestNote, setRequestNote] = useState('');
  const [requestGame, setRequestGame] = useState('Valorant');

  // Report modal state
  const [reportModalGamer, setReportModalGamer] = useState<ExtendedGamer | null>(null);
  const [reportReason, setReportReason] = useState('Toxic Comms & Flame');
  const [reportDetails, setReportDetails] = useState('');
  const [actionSuccessToast, setActionSuccessToast] = useState<string | null>(null);

  // Trigger feedback banner
  const triggerToast = (msg: string) => {
    setActionSuccessToast(msg);
    setTimeout(() => setActionSuccessToast(null), 3500);
  };

  // Toggle follow action with anti-self-follow safeguard
  const handleToggleFollow = async (gamer: ExtendedGamer) => {
    if (gamer.id === currentUserId) return;
    const isCurrentlyFollowing = gamer.isFollowing;

    setGamers((prev) =>
      prev.map((g) => (g.id === gamer.id ? { ...g, isFollowing: !isCurrentlyFollowing } : g))
    );

    try {
      if (isCurrentlyFollowing) {
        await unfollowGamer(currentUserId, gamer.id);
        triggerToast(`Unfollowed @${gamer.username}`);
      } else {
        await followGamer(currentUserId, gamer.id);
        triggerToast(`Now following @${gamer.username}!`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Accept incoming request
  const handleAcceptRequest = async (req: FriendRequest) => {
    setFriendRequests((prev) => prev.filter((r) => r.id !== req.id));

    // Add to connected friends
    const newFriend: ExtendedGamer = {
      id: req.senderId,
      name: req.senderName,
      username: req.senderUsername,
      avatarUrl: req.senderAvatarUrl,
      isVerified: false,
      followersCount: '1.2K followers',
      isFollowing: true,
      primaryGame: req.senderGame,
      level: req.senderLevel,
      role: 'Competitive Player',
      platform: 'PC',
      isFriend: true
    };
    setConnectedFriends((prev) => [newFriend, ...prev]);

    try {
      await apiAcceptFriendRequest(req.id);
      triggerToast(`Accepted squad invitation from @${req.senderUsername}!`);
    } catch (e) {
      console.error(e);
    }
  };

  // Decline incoming request
  const handleDeclineRequest = async (reqId: string) => {
    setFriendRequests((prev) => prev.filter((r) => r.id !== reqId));
    try {
      await apiRejectFriendRequest(reqId);
      triggerToast('Declined request.');
    } catch (e) {
      console.error(e);
    }
  };

  // Cancel sent request
  const handleCancelSentRequest = async (reqId: string) => {
    setSentRequests((prev) => prev.filter((r) => r.id !== reqId));
    try {
      await apiCancelFriendRequest(reqId);
      triggerToast('Cancelled outgoing friend request.');
    } catch (e) {
      console.error(e);
    }
  };

  // Remove connection
  const handleRemoveFriend = (friendId: string, friendName: string) => {
    setConnectedFriends((prev) => prev.filter((f) => f.id !== friendId));
    triggerToast(`Removed ${friendName} from Squad roster.`);
  };

  // Submit new friend request
  const handleSendFriendRequestSubmit = async () => {
    if (!requestModalGamer) return;

    const newReq: FriendRequest = {
      id: `req_${Date.now()}`,
      senderId: currentUserId,
      senderName: currentUserName,
      senderUsername: 'fatmabenz',
      senderAvatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      senderLevel: 24,
      senderGame: requestGame,
      receiverId: requestModalGamer.id,
      receiverName: requestModalGamer.name,
      receiverUsername: requestModalGamer.username,
      receiverAvatarUrl: requestModalGamer.avatarUrl,
      status: 'pending',
      note: requestNote || `Squad up for ${requestGame}!`,
      gameTag: requestGame,
      createdAt: 'Just now'
    };

    setSentRequests([newReq, ...sentRequests]);
    setRequestModalGamer(null);
    setRequestNote('');
    triggerToast(`Friend request sent to @${requestModalGamer.username}!`);

    try {
      await apiSendFriendRequest({
        senderId: currentUserId,
        senderName: currentUserName,
        senderUsername: 'fatmabenz',
        senderAvatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        senderLevel: 24,
        senderGame: requestGame,
        receiverId: requestModalGamer.id,
        receiverName: requestModalGamer.name,
        receiverUsername: requestModalGamer.username,
        receiverAvatarUrl: requestModalGamer.avatarUrl,
        note: requestNote,
        gameTag: requestGame
      });
    } catch (e) {
      console.error(e);
    }
  };

  // Block User action
  const handleBlockUser = (gamer: ExtendedGamer) => {
    setGamers((prev) => prev.filter((g) => g.id !== gamer.id));
    setConnectedFriends((prev) => prev.filter((f) => f.id !== gamer.id));
    setFriendRequests((prev) => prev.filter((r) => r.senderId !== gamer.id));
    setBlockedUsers((prev) => [
      ...prev,
      {
        id: gamer.id,
        name: gamer.name,
        username: gamer.username,
        blockedAt: 'Just now'
      }
    ]);
    triggerToast(`Blocked @${gamer.username}. They cannot message or squad with you.`);
  };

  // Unblock user
  const handleUnblockUser = (id: string, username: string) => {
    setBlockedUsers((prev) => prev.filter((u) => u.id !== id));
    triggerToast(`Unblocked @${username}.`);
  };

  // Submit Report
  const handleSubmitReport = async () => {
    if (!reportModalGamer) return;
    try {
      await reportGamer(currentUserId, reportModalGamer.id, reportModalGamer.username, reportReason, reportDetails);
      triggerToast(`Report against @${reportModalGamer.username} submitted for moderation review.`);
      setReportModalGamer(null);
      setReportDetails('');
    } catch (e) {
      console.error(e);
    }
  };

  // Filter logic for Module B: Gamer Discovery
  const filteredGamers = gamers.filter((gamer) => {
    // Exclude blocked users and self
    if (gamer.id === currentUserId) return false;
    if (blockedUsers.some((b) => b.id === gamer.id)) return false;

    // Search query matches username or display name or game
    const matchesSearch =
      gamer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gamer.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gamer.primaryGame.toLowerCase().includes(searchQuery.toLowerCase());

    // Game filter
    const matchesGame = selectedGame === 'All' || gamer.primaryGame === selectedGame;

    // Platform filter
    const matchesPlatform = selectedPlatform === 'All' || gamer.platform === selectedPlatform;

    // Role filter
    const matchesRole = selectedRole === 'All' || gamer.role === selectedRole;

    // Level bracket
    const lvl = gamer.level || 1;
    let matchesLevel = true;
    if (selectedLevelBracket === 'Lvl 1-10') matchesLevel = lvl >= 1 && lvl <= 10;
    else if (selectedLevelBracket === 'Lvl 11-20') matchesLevel = lvl >= 11 && lvl <= 20;
    else if (selectedLevelBracket === 'Lvl 21-30') matchesLevel = lvl >= 21 && lvl <= 30;
    else if (selectedLevelBracket === 'Lvl 30+') matchesLevel = lvl > 30;

    // Location query
    const matchesLocation =
      !locationQuery || (gamer.location && gamer.location.toLowerCase().includes(locationQuery.toLowerCase()));

    // Verified only
    const matchesVerified = !verifiedOnly || gamer.isVerified;

    return matchesSearch && matchesGame && matchesPlatform && matchesRole && matchesLevel && matchesLocation && matchesVerified;
  });

  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Toast notification */}
      {actionSuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#10234A] text-white px-5 py-3 rounded-2xl shadow-2xl border border-cyan-400 flex items-center gap-3 glitch-box">
          <Zap className="w-4 h-4 text-cyan-300 animate-pulse" />
          <span className="text-xs font-bold font-mono tracking-tight">{actionSuccessToast}</span>
        </div>
      )}

      {/* Cyber/Glitch HUD Header Banner */}
      <div className="bg-white rounded-3xl border border-[#E4E9F2] p-6 sm:p-8 shadow-xs relative overflow-hidden">
        {/* Subtle Cyber contrast corner badges */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-cyan-500/10 via-magenta-500/5 to-transparent pointer-events-none rounded-tr-3xl" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EEF4FE] text-[#1768DF] text-xs font-bold mb-2.5 border border-blue-100">
              <Users className="w-3.5 h-3.5 text-cyan-600" />
              <span className="font-mono text-[11px] tracking-wider uppercase">Gamer Matrix & Squad Discovery</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#10234A] tracking-tight flex items-center gap-2">
              <span>Gaming Friends & Discovery</span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-[#10234A] text-cyan-300">
                PRO-TACTICAL
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-[#697386] mt-1 max-w-2xl leading-relaxed">
              Find teammates by competitive rank, game role, and hardware ecosystem. Send squad requests, manage connections, and coordinate your next tournament victory.
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-3 bg-[#F8FAFD] p-2.5 rounded-2xl border border-[#E4E9F2] self-start lg:self-center">
            <div className="text-center px-3 py-1">
              <span className="block text-base font-black text-[#10234A] font-mono">{connectedFriends.length}</span>
              <span className="text-[10px] text-[#697386] font-semibold uppercase tracking-wider">Squad Mates</span>
            </div>
            <div className="w-px h-8 bg-[#E4E9F2]" />
            <div className="text-center px-3 py-1">
              <span className="block text-base font-black text-[#1768DF] font-mono">{friendRequests.length}</span>
              <span className="text-[10px] text-[#697386] font-semibold uppercase tracking-wider">Pending Invites</span>
            </div>
            <div className="w-px h-8 bg-[#E4E9F2]" />
            <button
              onClick={() => onNavigate('messages')}
              className="px-4 py-2 bg-[#1768DF] hover:bg-[#1255be] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Squad Chat</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="mt-8 pt-4 border-t border-[#E4E9F2] flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('discover')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'discover'
                ? 'bg-[#10234A] text-white shadow-xs'
                : 'bg-[#F4F6FC] text-[#697386] hover:bg-[#EEF4FE] hover:text-[#1768DF]'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Discover Gamers ({filteredGamers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('incoming')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer relative ${
              activeTab === 'incoming'
                ? 'bg-[#10234A] text-white shadow-xs'
                : 'bg-[#F4F6FC] text-[#697386] hover:bg-[#EEF4FE] hover:text-[#1768DF]'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Pending Requests</span>
            {friendRequests.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-[#1768DF] text-white text-[10px] font-mono font-bold">
                {friendRequests.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('sent')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'sent'
                ? 'bg-[#10234A] text-white shadow-xs'
                : 'bg-[#F4F6FC] text-[#697386] hover:bg-[#EEF4FE] hover:text-[#1768DF]'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Sent Requests ({sentRequests.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('friends')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'friends'
                ? 'bg-[#10234A] text-white shadow-xs'
                : 'bg-[#F4F6FC] text-[#697386] hover:bg-[#EEF4FE] hover:text-[#1768DF]'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>My Squad Connections ({connectedFriends.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('blocked')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'blocked'
                ? 'bg-[#10234A] text-white shadow-xs'
                : 'bg-[#F4F6FC] text-[#697386] hover:bg-[#EEF4FE] hover:text-[#1768DF]'
            }`}
          >
            <Ban className="w-3.5 h-3.5" />
            <span>Privacy & Blocked ({blockedUsers.length})</span>
          </button>
        </div>
      </div>

      {/* ================= TAB 1: DISCOVER GAMERS (MODULE A & B) ================= */}
      {activeTab === 'discover' && (
        <div className="space-y-6">
          {/* Search and Filter Controls */}
          <div className="bg-white rounded-3xl border border-[#E4E9F2] p-5 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row items-center gap-3">
              {/* Keyword Search */}
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-[#697386]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by gamer handle (@username), display name, or game title..."
                  className="w-full pl-10 pr-4 py-3 bg-[#F4F6FC] rounded-2xl text-xs text-[#172033] border border-[#E4E9F2] focus:border-[#1768DF] focus:outline-hidden transition-all"
                />
              </div>

              {/* Location Input */}
              <div className="relative w-full md:w-56">
                <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-[#697386]" />
                <input
                  type="text"
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  placeholder="Location / Region..."
                  className="w-full pl-10 pr-4 py-3 bg-[#F4F6FC] rounded-2xl text-xs text-[#172033] border border-[#E4E9F2] focus:border-[#1768DF] focus:outline-hidden"
                />
              </div>

              {/* Advanced filter toggle button */}
              <button
                onClick={() => setShowFiltersDrawer(!showFiltersDrawer)}
                className={`px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 border transition-all cursor-pointer whitespace-nowrap ${
                  showFiltersDrawer
                    ? 'bg-[#EEF4FE] text-[#1768DF] border-[#1768DF]'
                    : 'bg-[#F4F6FC] text-[#172033] border-[#E4E9F2] hover:bg-[#EEF4FE]'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filters</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showFiltersDrawer ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Quick Game Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
              <span className="text-[11px] font-bold text-[#697386] uppercase tracking-wider whitespace-nowrap mr-1">
                Game:
              </span>
              {['All', 'Valorant', 'Minecraft', 'Marvel Rivals', 'Grand Theft Auto VI', 'Apex Legends', 'Cyberpunk 2077'].map(
                (g) => (
                  <button
                    key={g}
                    onClick={() => setSelectedGame(g)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      selectedGame === g
                        ? 'bg-[#1768DF] text-white shadow-xs'
                        : 'bg-[#F4F6FC] text-[#697386] hover:bg-[#EEF4FE]'
                    }`}
                  >
                    {g}
                  </button>
                )
              )}
            </div>

            {/* Extended Filters Drawer */}
            {showFiltersDrawer && (
              <div className="p-4 rounded-2xl bg-[#F8FAFD] border border-[#E4E9F2] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                {/* Platform Filter */}
                <div>
                  <label className="block text-[11px] font-bold text-[#697386] uppercase tracking-wider mb-1.5">
                    Hardware Platform
                  </label>
                  <select
                    value={selectedPlatform}
                    onChange={(e) => setSelectedPlatform(e.target.value)}
                    className="w-full p-2.5 bg-white border border-[#E4E9F2] rounded-xl text-xs text-[#172033] focus:border-[#1768DF] focus:outline-hidden"
                  >
                    <option value="All">All Platforms</option>
                    <option value="PC">PC</option>
                    <option value="PlayStation 5">PlayStation 5</option>
                    <option value="Xbox Series X/S">Xbox Series X/S</option>
                    <option value="Nintendo Switch">Nintendo Switch</option>
                    <option value="Mobile">Mobile</option>
                  </select>
                </div>

                {/* Role Filter */}
                <div>
                  <label className="block text-[11px] font-bold text-[#697386] uppercase tracking-wider mb-1.5">
                    Gamer Role
                  </label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full p-2.5 bg-white border border-[#E4E9F2] rounded-xl text-xs text-[#172033] focus:border-[#1768DF] focus:outline-hidden"
                  >
                    <option value="All">All Roles</option>
                    <option value="Competitive Player">Competitive Player</option>
                    <option value="Casual Player">Casual Player</option>
                    <option value="Builder / Architect">Builder / Architect</option>
                    <option value="Streamer">Streamer</option>
                    <option value="Content Creator">Content Creator</option>
                    <option value="Team Captain">Team Captain</option>
                  </select>
                </div>

                {/* Level Bracket */}
                <div>
                  <label className="block text-[11px] font-bold text-[#697386] uppercase tracking-wider mb-1.5">
                    Gamer Level Tier
                  </label>
                  <select
                    value={selectedLevelBracket}
                    onChange={(e) => setSelectedLevelBracket(e.target.value)}
                    className="w-full p-2.5 bg-white border border-[#E4E9F2] rounded-xl text-xs text-[#172033] focus:border-[#1768DF] focus:outline-hidden"
                  >
                    <option value="All">All Levels</option>
                    <option value="Lvl 1-10">Beginner (1 - 10)</option>
                    <option value="Lvl 11-20">Skilled (11 - 20)</option>
                    <option value="Lvl 21-30">Veteran (21 - 30)</option>
                    <option value="Lvl 30+">Grandmaster (30+)</option>
                  </select>
                </div>

                {/* Verified Toggle */}
                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 p-2.5 bg-white border border-[#E4E9F2] rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={verifiedOnly}
                      onChange={(e) => setVerifiedOnly(e.target.checked)}
                      className="rounded text-[#1768DF] focus:ring-0"
                    />
                    <span className="text-xs font-bold text-[#172033]">Verified Gamers Only</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Gamers Discovery Grid (Module B) */}
          {filteredGamers.length === 0 ? (
            <div className="bg-white rounded-3xl border border-[#E4E9F2] p-12 text-center shadow-xs">
              <Search className="w-12 h-12 text-[#94a3b8] mx-auto mb-3 opacity-60" />
              <h3 className="text-base font-bold text-[#10234A]">No Gamers Found</h3>
              <p className="text-xs text-[#697386] mt-1 max-w-sm mx-auto">
                No players match your active search and criteria. Try clearing filters or searching for another title.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedGame('All');
                  setSelectedPlatform('All');
                  setSelectedRole('All');
                  setSelectedLevelBracket('All');
                  setLocationQuery('');
                  setVerifiedOnly(false);
                }}
                className="mt-4 px-4 py-2 bg-[#EEF4FE] text-[#1768DF] text-xs font-bold rounded-xl cursor-pointer hover:bg-blue-100"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredGamers.map((gamer) => (
                <div
                  key={gamer.id}
                  className="bg-white rounded-3xl border border-[#E4E9F2] p-5 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group relative overflow-hidden"
                >
                  <div>
                    {/* Top Header & Avatar */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="relative">
                        <img
                          src={gamer.avatarUrl}
                          alt={gamer.name}
                          className="w-14 h-14 rounded-2xl object-cover ring-2 ring-[#E4E9F2] group-hover:scale-105 transition-transform"
                        />
                        <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
                      </div>

                      {/* Connect / Follow Toggle */}
                      <button
                        onClick={() => handleToggleFollow(gamer)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          gamer.isFollowing
                            ? 'bg-[#F4F6FC] text-[#697386] border border-[#E4E9F2] hover:bg-red-50 hover:text-red-600'
                            : 'bg-[#1768DF] hover:bg-[#1255be] text-white shadow-xs'
                        }`}
                      >
                        {gamer.isFollowing ? (
                          <>
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Following</span>
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>Follow</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Gamer Identity Info */}
                    <div className="mt-3.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="font-bold text-sm text-[#10234A]">{gamer.name}</h3>
                        {gamer.isVerified && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#1768DF] fill-[#1768DF] text-white" />
                        )}
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#10234A] text-cyan-300">
                          LVL {gamer.level || 1}
                        </span>
                      </div>
                      <p className="text-xs text-[#697386] font-mono">@{gamer.username}</p>

                      {/* Bio snippet */}
                      {gamer.bio && (
                        <p className="text-xs text-[#697386] mt-2 line-clamp-2 leading-relaxed bg-[#F8FAFD] p-2 rounded-xl border border-[#E4E9F2]">
                          {gamer.bio}
                        </p>
                      )}

                      {/* Tags & Metadata */}
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#EEF4FE] text-[#1768DF] text-[11px] font-bold">
                          <Gamepad2 className="w-3 h-3" />
                          <span>{gamer.primaryGame}</span>
                        </span>
                        {gamer.platform && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#F4F6FC] text-[#172033] text-[11px] font-semibold border border-[#E4E9F2]">
                            <Monitor className="w-3 h-3 text-[#697386]" />
                            <span>{gamer.platform}</span>
                          </span>
                        )}
                        {gamer.role && (
                          <span className="px-2.5 py-1 rounded-lg bg-[#F4F6FC] text-[#697386] text-[11px] font-semibold">
                            {gamer.role}
                          </span>
                        )}
                      </div>

                      {/* Mutual connections & location */}
                      <div className="mt-2.5 flex items-center justify-between text-[11px] text-[#697386]">
                        {gamer.mutualFriends ? (
                          <span className="text-[#1768DF] font-semibold">
                            🤝 {gamer.mutualFriends} mutual connections
                          </span>
                        ) : (
                          <span>{gamer.followersCount}</span>
                        )}
                        {gamer.location && (
                          <span className="flex items-center gap-1 text-[#697386]">
                            <MapPin className="w-3 h-3" />
                            <span>{gamer.location}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Action Footer */}
                  <div className="mt-4 pt-3 border-t border-[#E4E9F2] flex items-center justify-between gap-2">
                    <button
                      onClick={() => {
                        setRequestModalGamer(gamer);
                        setRequestGame(gamer.primaryGame);
                      }}
                      className="flex-1 py-2 bg-[#EEF4FE] hover:bg-[#E0ECFD] text-[#1768DF] text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Squad Request</span>
                    </button>

                    <button
                      onClick={() => (onOpenDirectMessage ? onOpenDirectMessage(gamer.id) : onNavigate('messages'))}
                      className="p-2 bg-[#F4F6FC] hover:bg-slate-200 text-[#172033] rounded-xl transition-colors cursor-pointer"
                      title="Send Direct Message"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>

                    {/* Report / Block drop options */}
                    <div className="relative group/more">
                      <button
                        onClick={() => setReportModalGamer(gamer)}
                        className="p-2 text-[#94a3b8] hover:text-red-500 rounded-xl transition-colors cursor-pointer"
                        title="Report / Block"
                      >
                        <Shield className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 2: PENDING SQUAD INVITATIONS ================= */}
      {activeTab === 'incoming' && (
        <div className="bg-white rounded-3xl border border-[#E4E9F2] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#10234A] flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-[#1768DF]" />
              <span>Incoming Squad & Friend Requests ({friendRequests.length})</span>
            </h2>
            <span className="text-xs text-[#697386]">Decide who joins your active squad</span>
          </div>

          {friendRequests.length === 0 ? (
            <div className="p-8 text-center bg-[#F8FAFD] rounded-2xl border border-[#E4E9F2]">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-xs font-bold text-[#10234A]">All caught up!</p>
              <p className="text-xs text-[#697386] mt-0.5">No pending squad invitations at the moment.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {friendRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E4E9F2] flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-blue-200 transition-colors"
                >
                  <div className="flex items-start gap-3.5">
                    <img
                      src={req.senderAvatarUrl}
                      alt={req.senderName}
                      className="w-12 h-12 rounded-2xl object-cover ring-2 ring-[#E4E9F2]"
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-[#10234A]">{req.senderName}</span>
                        <span className="text-xs text-[#697386] font-mono">@{req.senderUsername}</span>
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-[#10234A] text-cyan-300">
                          LVL {req.senderLevel}
                        </span>
                      </div>

                      <div className="text-xs text-[#1768DF] font-semibold mt-0.5 flex items-center gap-1.5">
                        <Gamepad2 className="w-3.5 h-3.5" />
                        <span>Game: {req.senderGame}</span>
                      </div>

                      {req.note && (
                        <p className="text-xs text-[#475569] mt-1.5 bg-white p-2.5 rounded-xl border border-[#E4E9F2] italic">
                          "{req.note}"
                        </p>
                      )}
                      <span className="text-[10px] text-[#94a3b8] mt-1 block">{req.createdAt}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => handleAcceptRequest(req)}
                      className="px-4 py-2 bg-[#1768DF] hover:bg-[#1255be] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Accept Squad</span>
                    </button>
                    <button
                      onClick={() => handleDeclineRequest(req.id)}
                      className="px-3 py-2 bg-white hover:bg-slate-100 text-[#697386] text-xs font-bold rounded-xl border border-[#E4E9F2] transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 3: SENT REQUESTS ================= */}
      {activeTab === 'sent' && (
        <div className="bg-white rounded-3xl border border-[#E4E9F2] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#10234A] flex items-center gap-2">
              <Send className="w-4 h-4 text-[#1768DF]" />
              <span>Outgoing Squad Requests ({sentRequests.length})</span>
            </h2>
            <span className="text-xs text-[#697386]">Requests you have dispatched to other players</span>
          </div>

          {sentRequests.length === 0 ? (
            <div className="p-8 text-center bg-[#F8FAFD] rounded-2xl border border-[#E4E9F2]">
              <p className="text-xs font-bold text-[#10234A]">No pending outgoing requests</p>
              <p className="text-xs text-[#697386] mt-0.5">Explore the gamer directory to find squad mates.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sentRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E4E9F2] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    {req.receiverAvatarUrl && (
                      <img
                        src={req.receiverAvatarUrl}
                        alt={req.receiverName || 'Gamer'}
                        className="w-12 h-12 rounded-2xl object-cover ring-2 ring-[#E4E9F2]"
                      />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#10234A]">
                          To: {req.receiverName || req.receiverId}
                        </span>
                        {req.receiverUsername && (
                          <span className="text-xs text-[#697386] font-mono">@{req.receiverUsername}</span>
                        )}
                      </div>
                      <div className="text-xs text-[#1768DF] font-semibold mt-0.5">Target Game: {req.gameTag}</div>
                      {req.note && (
                        <p className="text-xs text-[#475569] mt-1 bg-white p-2 rounded-xl border border-[#E4E9F2]">
                          "{req.note}"
                        </p>
                      )}
                      <span className="text-[10px] text-[#94a3b8] mt-1 block">Sent: {req.createdAt}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleCancelSentRequest(req.id)}
                    className="px-3.5 py-2 bg-white hover:bg-red-50 text-red-600 border border-red-200 text-xs font-bold rounded-xl transition-colors cursor-pointer self-end sm:self-center"
                  >
                    Cancel Request
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 4: MY SQUAD CONNECTIONS ================= */}
      {activeTab === 'friends' && (
        <div className="bg-white rounded-3xl border border-[#E4E9F2] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#10234A] flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <span>My Squad Roster ({connectedFriends.length})</span>
              </h2>
              <p className="text-xs text-[#697386] mt-0.5">Direct squad connections available for instant party grouping</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {connectedFriends.map((friend) => (
              <div
                key={friend.id}
                className="p-4 rounded-2xl bg-[#F8FAFD] border border-[#E4E9F2] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={friend.avatarUrl}
                        alt={friend.name}
                        className="w-12 h-12 rounded-2xl object-cover ring-2 ring-[#E4E9F2]"
                      />
                      <div>
                        <h4 className="font-bold text-sm text-[#10234A]">{friend.name}</h4>
                        <p className="text-xs text-[#697386] font-mono">@{friend.username}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#10234A] text-cyan-300">
                      LVL {friend.level || 1}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-[#EEF4FE] text-[#1768DF] text-xs font-bold">
                      {friend.primaryGame}
                    </span>
                    {friend.platform && (
                      <span className="text-xs text-[#697386] font-semibold">{friend.platform}</span>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E4E9F2] flex items-center justify-between gap-2">
                  <button
                    onClick={() => (onOpenDirectMessage ? onOpenDirectMessage(friend.id) : onNavigate('messages'))}
                    className="flex-1 py-1.5 bg-[#1768DF] hover:bg-[#1255be] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Message</span>
                  </button>

                  <button
                    onClick={() => handleRemoveFriend(friend.id, friend.name)}
                    className="p-1.5 bg-white hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-xl border border-[#E4E9F2] transition-colors cursor-pointer"
                    title="Remove Squad Connection"
                  >
                    <UserMinus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 5: PRIVACY & BLOCKED ================= */}
      {activeTab === 'blocked' && (
        <div className="bg-white rounded-3xl border border-[#E4E9F2] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#10234A] flex items-center gap-2">
                <Ban className="w-4 h-4 text-red-500" />
                <span>Blocked Players & Safety Center</span>
              </h2>
              <p className="text-xs text-[#697386] mt-0.5">Blocked users cannot send you squad requests, follow, or direct message you.</p>
            </div>
          </div>

          {blockedUsers.length === 0 ? (
            <div className="p-8 text-center bg-[#F8FAFD] rounded-2xl border border-[#E4E9F2]">
              <Shield className="w-8 h-8 text-blue-500 mx-auto mb-2 opacity-80" />
              <p className="text-xs font-bold text-[#10234A]">Your Blocklist is Empty</p>
              <p className="text-xs text-[#697386] mt-0.5">You have not blocked any players.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {blockedUsers.map((b) => (
                <div
                  key={b.id}
                  className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E4E9F2] flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-xs text-[#10234A]">{b.name}</span>
                    <span className="text-xs text-[#697386] font-mono ml-2">@{b.username}</span>
                    <span className="text-[10px] text-[#94a3b8] ml-3">Blocked {b.blockedAt}</span>
                  </div>

                  <button
                    onClick={() => handleUnblockUser(b.id, b.username)}
                    className="px-3 py-1 bg-white hover:bg-slate-100 text-[#1768DF] border border-[#E4E9F2] text-xs font-bold rounded-lg cursor-pointer"
                  >
                    Unblock
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= SEND FRIEND REQUEST MODAL ================= */}
      {requestModalGamer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-[#E4E9F2] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#1768DF]" />
                <h3 className="font-bold text-base text-[#10234A]">Send Squad Request</h3>
              </div>
              <button
                onClick={() => setRequestModalGamer(null)}
                className="p-1.5 text-[#697386] hover:bg-slate-100 rounded-full cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-3 p-3 bg-[#F8FAFD] rounded-2xl border border-[#E4E9F2]">
              <img
                src={requestModalGamer.avatarUrl}
                alt={requestModalGamer.name}
                className="w-12 h-12 rounded-xl object-cover ring-2 ring-[#E4E9F2]"
              />
              <div>
                <h4 className="font-bold text-sm text-[#10234A]">{requestModalGamer.name}</h4>
                <p className="text-xs text-[#697386] font-mono">@{requestModalGamer.username}</p>
                <span className="text-[10px] font-bold text-[#1768DF]">Main: {requestModalGamer.primaryGame}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#10234A] mb-1.5">Game Collaboration</label>
              <select
                value={requestGame}
                onChange={(e) => setRequestGame(e.target.value)}
                className="w-full p-2.5 bg-[#F4F6FC] border border-[#E4E9F2] rounded-xl text-xs text-[#172033] focus:border-[#1768DF] focus:outline-hidden"
              >
                <option value="Valorant">Valorant (Ranked 5-Stack)</option>
                <option value="Minecraft">Minecraft (Survival Realm / Creative SMP)</option>
                <option value="Marvel Rivals">Marvel Rivals (Competitive PVP)</option>
                <option value="Grand Theft Auto VI">Grand Theft Auto VI (Crew)</option>
                <option value="Apex Legends">Apex Legends (Ranked BR)</option>
                <option value="Cyberpunk 2077">Cyberpunk 2077 (Community)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#10234A] mb-1.5">Personal Squad Note (Optional)</label>
              <textarea
                value={requestNote}
                onChange={(e) => setRequestNote(e.target.value)}
                placeholder="e.g. Saw your clutch highlights! Looking for an initiator to run competitive lobbies tonight."
                rows={3}
                className="w-full p-3 bg-[#F4F6FC] border border-[#E4E9F2] rounded-xl text-xs text-[#172033] focus:border-[#1768DF] focus:outline-hidden resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRequestModalGamer(null)}
                className="px-4 py-2.5 bg-[#F4F6FC] hover:bg-slate-200 text-[#697386] text-xs font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSendFriendRequestSubmit}
                className="px-5 py-2.5 bg-[#1768DF] hover:bg-[#1255be] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Squad Invitation</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= REPORT / BLOCK MODAL ================= */}
      {reportModalGamer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-[#E4E9F2] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-bold text-base text-[#10234A]">Safety & Moderation</h3>
              </div>
              <button
                onClick={() => setReportModalGamer(null)}
                className="p-1.5 text-[#697386] hover:bg-slate-100 rounded-full cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#697386]">
              Take action regarding <strong className="text-[#10234A]">@{reportModalGamer.username}</strong> ({reportModalGamer.name}).
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#10234A] mb-1.5">Violation Reason</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full p-2.5 bg-[#F4F6FC] border border-[#E4E9F2] rounded-xl text-xs text-[#172033] focus:border-[#1768DF] focus:outline-hidden"
                >
                  <option value="Toxic Comms & Flame">Toxic Comms, Harassment & Flame</option>
                  <option value="Cheating, Aimbot or Exploiting">Cheating, Aimbot, or Exploiting</option>
                  <option value="Impersonation / Fake Gamer Identity">Impersonation / Fake Gamer Identity</option>
                  <option value="Spam / Malicious Links">Spam / Malicious Links</option>
                  <option value="Match Throwing / Griefing">Match Throwing / Griefing</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#10234A] mb-1.5">Context or Match Details</label>
                <textarea
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  placeholder="Provide match timestamps or details for the moderation review..."
                  rows={2}
                  className="w-full p-2.5 bg-[#F4F6FC] border border-[#E4E9F2] rounded-xl text-xs text-[#172033] focus:border-[#1768DF] focus:outline-hidden resize-none"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-[#E4E9F2] flex items-center justify-between gap-2">
              <button
                onClick={() => {
                  handleBlockUser(reportModalGamer);
                  setReportModalGamer(null);
                }}
                className="px-3.5 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <Ban className="w-3.5 h-3.5" />
                <span>Block User</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setReportModalGamer(null)}
                  className="px-3.5 py-2.5 bg-[#F4F6FC] hover:bg-slate-200 text-[#697386] text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitReport}
                  className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs"
                >
                  Submit Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
