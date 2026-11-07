import React, { useState, useRef } from 'react';
import {
  MapPin,
  GraduationCap,
  Sparkles,
  Edit3,
  Calendar,
  Gamepad2,
  Trophy,
  Compass,
  Users,
  Layers,
  CheckCircle2,
  Share2,
  Plus,
  Clock,
  Shield,
  X,
  Check,
  Camera,
  Upload,
  UserPlus,
  UserCheck,
  AlertTriangle,
  Flag,
  Ban,
  Link,
  Flame,
  Star
} from 'lucide-react';
import {
  GamerProfile,
  GamingExperience,
  GamingAdventure,
  GameAchievement,
  GamingPost,
  ActivePage,
  Platform,
  GamerRole
} from '../types';
import { FeedPostCard } from '../components/dashboard/FeedPostCard';
import { uploadGamerImage, validateImageFile } from '../services/storageService';

interface ProfilePageProps {
  currentUser: GamerProfile;
  viewingProfile?: GamerProfile;
  experiences: GamingExperience[];
  adventures: GamingAdventure[];
  achievements: GameAchievement[];
  posts: GamingPost[];
  onUpdateProfile: (updated: Partial<GamerProfile>) => Promise<void> | void;
  onNavigate: (page: ActivePage) => void;
  onLikePost?: (postId: string, reactionType: 'like' | 'heart' | 'fire') => void;
  onCommentPost?: (postId: string, text: string) => void;
  checkUsernameAvailable?: (username: string) => Promise<boolean>;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  currentUser,
  viewingProfile,
  experiences,
  adventures,
  achievements,
  posts,
  onUpdateProfile,
  onNavigate,
  onLikePost,
  onCommentPost,
  checkUsernameAvailable
}) => {
  // Determine if viewing own profile or another gamer's profile
  const profile = viewingProfile || currentUser;
  const isOwnProfile = profile.id === currentUser.id;

  const [activeTab, setActiveTab] = useState<
    'overview' | 'experience' | 'adventures' | 'achievements' | 'friends' | 'posts'
  >('overview');

  // Modals & interaction state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(profile.followersCount);
  const [copiedLink, setCopiedLink] = useState(false);
  const [reportReason, setReportReason] = useState('Harassment or unsportsmanlike behavior');
  const [reportSuccess, setReportSuccess] = useState(false);

  // Edit form state
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [username, setUsername] = useState(profile.username);
  const [tagline, setTagline] = useState(profile.tagline);
  const [bio, setBio] = useState(profile.bio);
  const [location, setLocation] = useState(profile.location || '');
  const [schoolOrOrg, setSchoolOrOrg] = useState(profile.schoolOrOrg || '');
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl);
  const [coverUrl, setCoverUrl] = useState(profile.coverUrl);
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(profile.platforms);
  const [selectedRoles, setSelectedRoles] = useState<GamerRole[]>(profile.roles);
  const [favoriteGames, setFavoriteGames] = useState<string[]>(profile.favoriteGames);
  const [newGameInput, setNewGameInput] = useState('');
  const [hoursLogged, setHoursLogged] = useState(profile.stats.hoursLogged);

  // Upload state & errors
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const availablePlatforms: Platform[] = [
    'PC',
    'PlayStation 5',
    'PlayStation 4',
    'Xbox Series X/S',
    'Nintendo Switch',
    'Mobile'
  ];

  const availableRoles: GamerRole[] = [
    'Competitive Player',
    'Casual Player',
    'Content Creator',
    'Streamer',
    'Builder / Architect',
    'Team Captain',
    'Support Specialist',
    'Speedrunner'
  ];

  const userPosts = posts.filter(
    (p) => p.author.id === profile.id || p.author.displayName === profile.displayName
  );

  const handleCopyProfileLink = () => {
    const url = `${window.location.origin}/@${profile.username}`;
    navigator.clipboard?.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleToggleFollow = () => {
    if (isFollowing) {
      setIsFollowing(false);
      setFollowersCount((prev) => Math.max(0, prev - 1));
    } else {
      setIsFollowing(true);
      setFollowersCount((prev) => prev + 1);
    }
  };

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError('');
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setUploadError(validation.error || 'Invalid image file.');
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const url = await uploadGamerImage(file, currentUser.id, 'avatar');
      setAvatarUrl(url);
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload profile picture.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleCoverFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError('');
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setUploadError(validation.error || 'Invalid cover file.');
      return;
    }

    setIsUploadingCover(true);
    try {
      const url = await uploadGamerImage(file, currentUser.id, 'cover');
      setCoverUrl(url);
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload cover banner.');
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleAddFavoriteGame = () => {
    if (newGameInput.trim() && !favoriteGames.includes(newGameInput.trim())) {
      setFavoriteGames([...favoriteGames, newGameInput.trim()]);
      setNewGameInput('');
    }
  };

  const handleRemoveFavoriteGame = (game: string) => {
    setFavoriteGames(favoriteGames.filter((g) => g !== game));
  };

  const handleTogglePlatform = (plat: Platform) => {
    if (selectedPlatforms.includes(plat)) {
      if (selectedPlatforms.length > 1) {
        setSelectedPlatforms(selectedPlatforms.filter((p) => p !== plat));
      }
    } else {
      setSelectedPlatforms([...selectedPlatforms, plat]);
    }
  };

  const handleToggleRole = (r: GamerRole) => {
    if (selectedRoles.includes(r)) {
      if (selectedRoles.length > 1) {
        setSelectedRoles(selectedRoles.filter((item) => item !== r));
      }
    } else {
      setSelectedRoles([...selectedRoles, r]);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUsernameError('');
    setUploadError('');

    const cleanUsername = username.trim().toLowerCase();
    if (cleanUsername !== profile.username && checkUsernameAvailable) {
      const isAvailable = await checkUsernameAvailable(cleanUsername);
      if (!isAvailable) {
        setUsernameError(`Gamer handle "@${cleanUsername}" is already taken.`);
        return;
      }
    }

    setIsSaving(true);
    try {
      await onUpdateProfile({
        displayName: displayName.trim(),
        username: cleanUsername,
        tagline: tagline.trim(),
        bio: bio.trim(),
        location: location.trim(),
        schoolOrOrg: schoolOrOrg.trim(),
        avatarUrl,
        coverUrl,
        platforms: selectedPlatforms,
        roles: selectedRoles,
        favoriteGames,
        stats: {
          ...profile.stats,
          hoursLogged: Number(hoursLogged) || profile.stats.hoursLogged
        }
      });
      setIsEditModalOpen(false);
    } catch (err: any) {
      setUploadError(err.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendReport = (e: React.FormEvent) => {
    e.preventDefault();
    setReportSuccess(true);
    setTimeout(() => {
      setReportSuccess(false);
      setIsReportModalOpen(false);
    }, 2000);
  };

  return (
    <div className="max-w-[1200px] mx-auto px-3 sm:px-6 py-6 space-y-6">
      {/* 1. Header Profile Banner & Identity Card */}
      <div className="bg-white rounded-3xl border border-[#E4E9F2] overflow-hidden shadow-xs">
        {/* Cover Landscape */}
        <div className="h-48 sm:h-64 w-full relative bg-slate-900 overflow-hidden group">
          <img
            src={profile.coverUrl}
            alt="Profile Cover"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* If own profile, quick cover edit button */}
          {isOwnProfile && (
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="absolute top-4 right-4 px-3 py-1.5 bg-black/50 hover:bg-black/75 text-white rounded-full text-xs font-bold backdrop-blur-md transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Change Cover</span>
            </button>
          )}
        </div>

        {/* Profile Info Container */}
        <div className="px-6 pb-6 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-16 sm:-mt-20 gap-4 mb-4">
            {/* Avatar & Verification */}
            <div className="flex items-end gap-4">
              <div className="relative group">
                <div className="w-28 sm:w-36 h-28 sm:h-36 rounded-full p-1.5 bg-white shadow-xl">
                  <img
                    src={profile.avatarUrl}
                    alt={profile.displayName}
                    className="w-full h-full rounded-full object-cover ring-2 ring-white"
                  />
                </div>
                <span
                  className="absolute bottom-2 right-2 w-5 h-5 bg-[#16A36A] ring-4 ring-white rounded-full"
                  title="Online on GameOut"
                />
                {isOwnProfile && (
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="absolute inset-1.5 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    title="Upload profile picture"
                  >
                    <Camera className="w-6 h-6" />
                  </button>
                )}
              </div>

              <div className="hidden sm:block pb-2">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black text-[#172033]">
                    {profile.displayName}
                  </h1>
                  {profile.isVerified && (
                    <CheckCircle2 className="w-5 h-5 text-[#1768DF] fill-[#1768DF] text-white" />
                  )}
                </div>
                <p className="text-xs text-[#697386] font-mono">@{profile.username}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Share / Copy Link */}
              <button
                onClick={handleCopyProfileLink}
                className="px-3.5 py-2 bg-[#F4F6FC] hover:bg-[#EEF4FE] text-[#172033] font-bold text-xs rounded-full border border-[#E4E9F2] transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Share Gamer Identity"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#16A36A]" />
                    <span className="text-[#16A36A]">Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5 text-[#697386]" />
                    <span>Share</span>
                  </>
                )}
              </button>

              {/* Own Profile vs Other Gamer actions */}
              {isOwnProfile ? (
                <>
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="px-4 py-2 bg-[#EEF4FE] hover:bg-[#E0ECFD] text-[#1768DF] font-bold text-xs sm:text-sm rounded-full transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </button>
                  <button
                    onClick={() => onNavigate('experience')}
                    className="px-4 py-2 bg-[#1768DF] hover:bg-[#1255be] text-white font-bold text-xs sm:text-sm rounded-full shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Experience</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleToggleFollow}
                    className={`px-5 py-2 font-bold text-xs sm:text-sm rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
                      isFollowing
                        ? 'bg-[#F4F6FC] text-[#697386] border border-[#E4E9F2] hover:bg-red-50 hover:text-red-600'
                        : 'bg-[#1768DF] hover:bg-[#1255be] text-white shadow-xs'
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <UserCheck className="w-4 h-4" />
                        <span>Following</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        <span>Follow Gamer</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => onNavigate('messages')}
                    className="px-4 py-2 bg-[#EEF4FE] hover:bg-[#E0ECFD] text-[#1768DF] font-bold text-xs sm:text-sm rounded-full transition-colors cursor-pointer"
                  >
                    Message
                  </button>

                  <button
                    onClick={() => setIsReportModalOpen(true)}
                    className="p-2 text-[#697386] hover:text-red-600 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
                    title="Report or Block"
                  >
                    <Flag className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Mobile Display Name Header */}
          <div className="sm:hidden mb-2">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-[#172033]">
                {profile.displayName}
              </h1>
              {profile.isVerified && (
                <CheckCircle2 className="w-4 h-4 text-[#1768DF] fill-[#1768DF] text-white" />
              )}
            </div>
            <p className="text-xs text-[#697386] font-mono">@{profile.username}</p>
          </div>

          {/* Level & XP Bar */}
          <div className="max-w-md bg-[#F4F6FC] rounded-2xl p-3 border border-[#E4E9F2] my-3">
            <div className="flex items-center justify-between text-xs font-bold text-[#172033] mb-1.5">
              <span className="flex items-center gap-1.5 text-[#6366F1]">
                <Sparkles className="w-4 h-4 fill-[#6366F1]" />
                Level {profile.level} Gamer
              </span>
              <span className="text-[#697386]">
                {profile.xp.toLocaleString()} / {profile.xpToNextLevel.toLocaleString()} XP ({profile.levelProgressPercentage}%)
              </span>
            </div>
            <div className="w-full h-2.5 bg-[#E4E9F2] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#818CF8] via-[#6366F1] to-[#4F46E5] rounded-full transition-all duration-500"
                style={{ width: `${profile.levelProgressPercentage}%` }}
              />
            </div>
          </div>

          {/* Tagline & Bio */}
          <div className="space-y-1 mt-3">
            <p className="text-sm font-bold text-[#172033]">{profile.tagline}</p>
            <p className="text-xs text-[#697386] leading-relaxed max-w-3xl whitespace-pre-line">{profile.bio}</p>
          </div>

          {/* Location & Meta info */}
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[#697386]">
            {profile.location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#697386]" />
                {profile.location}
              </span>
            )}
            {profile.schoolOrOrg && (
              <span className="flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-[#697386]" />
                {profile.schoolOrOrg}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#697386]" />
              Joined {profile.joinedDate}
            </span>
          </div>

          {/* Followers / Following counts */}
          <div className="mt-4 pt-4 border-t border-[#E4E9F2] flex items-center gap-6 text-xs">
            <button onClick={() => onNavigate('friends')} className="hover:underline cursor-pointer">
              <strong className="text-[#172033] font-bold">
                {followersCount.toLocaleString()}
              </strong>{' '}
              <span className="text-[#697386]">Followers</span>
            </button>
            <button onClick={() => onNavigate('friends')} className="hover:underline cursor-pointer">
              <strong className="text-[#172033] font-bold">
                {profile.followingCount.toLocaleString()}
              </strong>{' '}
              <span className="text-[#697386]">Following</span>
            </button>
            <button onClick={() => onNavigate('friends')} className="hover:underline cursor-pointer">
              <strong className="text-[#172033] font-bold">
                {profile.friendsCount.toLocaleString()}
              </strong>{' '}
              <span className="text-[#697386]">Gaming Friends</span>
            </button>
          </div>
        </div>

        {/* 2. Profile Tabs (Section 2) */}
        <div className="px-6 border-t border-[#E4E9F2] flex items-center gap-2 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: Layers },
            { id: 'experience', label: `Gaming Experience (${experiences.length})`, icon: Gamepad2 },
            { id: 'adventures', label: `Gaming Adventures (${adventures.length})`, icon: Compass },
            { id: 'achievements', label: `Achievements (${achievements.length})`, icon: Trophy },
            { id: 'friends', label: `Gaming Friends (${profile.friendsCount})`, icon: Users },
            { id: 'posts', label: `Posts (${userPosts.length})`, icon: Sparkles }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-3.5 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer shrink-0 ${
                  isActive
                    ? 'border-[#1768DF] text-[#1768DF]'
                    : 'border-transparent text-[#697386] hover:text-[#172033]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Tab Contents */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Column: Roles, Platforms, and Experience Highlights */}
          <div className="lg:col-span-2 space-y-6">
            {/* 4. Gamer Statistics Cards (Section 4) */}
            <div className="bg-white rounded-3xl border border-[#E4E9F2] p-6 shadow-xs">
              <h3 className="text-sm font-bold text-[#10234A] mb-4 flex items-center gap-2">
                <Flame className="w-4 h-4 text-[#1768DF]" />
                <span>Gamer Statistics & Track Record</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="bg-[#F8FAFC] p-3.5 rounded-2xl border border-[#E4E9F2]">
                  <div className="text-2xl font-black text-[#1768DF]">{profile.stats.hoursLogged}h</div>
                  <div className="text-[11px] font-semibold text-[#697386] mt-0.5">Total Hours (User-Reported)</div>
                </div>
                <div className="bg-[#F8FAFC] p-3.5 rounded-2xl border border-[#E4E9F2]">
                  <div className="text-2xl font-black text-amber-500">{achievements.length}</div>
                  <div className="text-[11px] font-semibold text-[#697386] mt-0.5">Achievements Unlocked</div>
                </div>
                <div className="bg-[#F8FAFC] p-3.5 rounded-2xl border border-[#E4E9F2]">
                  <div className="text-2xl font-black text-purple-600">{adventures.length}</div>
                  <div className="text-[11px] font-semibold text-[#697386] mt-0.5">Gaming Adventures</div>
                </div>
                <div className="bg-[#F8FAFC] p-3.5 rounded-2xl border border-[#E4E9F2]">
                  <div className="text-2xl font-black text-emerald-600">{profile.favoriteGames.length}</div>
                  <div className="text-[11px] font-semibold text-[#697386] mt-0.5">Active Titles</div>
                </div>
              </div>
            </div>

            {/* Gaming Roles & Platforms */}
            <div className="bg-white rounded-3xl border border-[#E4E9F2] p-6 shadow-xs">
              <h3 className="text-sm font-bold text-[#10234A] mb-3">Gaming Roles & Specializations</h3>
              <div className="flex flex-wrap gap-2">
                {profile.roles.map((role) => (
                  <span
                    key={role}
                    className="px-3.5 py-1.5 rounded-xl bg-[#EEF4FE] text-[#1768DF] text-xs font-bold border border-[#D5E4FC]"
                  >
                    🎮 {role}
                  </span>
                ))}
              </div>

              <h3 className="text-sm font-bold text-[#10234A] mt-6 mb-3">Gaming Hardware & Platforms</h3>
              <div className="flex flex-wrap gap-2">
                {profile.platforms.map((plat) => (
                  <span
                    key={plat}
                    className="px-3.5 py-1.5 rounded-xl bg-[#F8FAFC] text-[#172033] text-xs font-bold border border-[#E4E9F2]"
                  >
                    💻 {plat}
                  </span>
                ))}
              </div>
            </div>

            {/* Featured Experience Timeline Snapshot */}
            <div className="bg-white rounded-3xl border border-[#E4E9F2] p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-[#10234A] flex items-center gap-2">
                  <Gamepad2 className="w-4 h-4 text-[#1768DF]" />
                  <span>Featured Gaming Experience</span>
                </h3>
                <button
                  onClick={() => setActiveTab('experience')}
                  className="text-xs font-bold text-[#1768DF] hover:underline cursor-pointer"
                >
                  View Full Timeline →
                </button>
              </div>

              <div className="space-y-3">
                {experiences.slice(0, 2).map((exp) => (
                  <div
                    key={exp.id}
                    className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E4E9F2]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={exp.gameCover}
                          alt={exp.gameTitle}
                          className="w-12 h-12 rounded-xl object-cover"
                        />
                        <div>
                          <h4 className="font-bold text-sm text-[#172033]">{exp.gameTitle}</h4>
                          <p className="text-xs text-[#1768DF] font-bold">{exp.rank} • {exp.role}</p>
                          <p className="text-[11px] text-[#697386]">
                            {exp.startDate} - {exp.isCurrentlyPlaying ? 'Present' : exp.endDate} • {exp.hoursPlayed} hrs logged
                          </p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 bg-white border border-[#E4E9F2] rounded-lg text-[11px] font-bold text-[#172033]">
                        {exp.platform}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Favorite Games & Trophies */}
          <div className="space-y-6">
            {/* Favorite Games Card */}
            <div className="bg-white rounded-3xl border border-[#E4E9F2] p-6 shadow-xs">
              <h3 className="text-sm font-bold text-[#10234A] mb-3">Favorite Video Games</h3>
              <div className="space-y-2">
                {profile.favoriteGames.map((game) => (
                  <div
                    key={game}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E4E9F2] text-xs font-bold text-[#172033]"
                  >
                    <span>{game}</span>
                    <span className="text-[10px] text-[#1768DF] bg-[#EEF4FE] px-2 py-0.5 rounded-md">
                      Main Title
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Unlocked Trophies Mini Showcase */}
            <div className="bg-white rounded-3xl border border-[#E4E9F2] p-6 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-[#10234A] flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  <span>Top Achievements</span>
                </h3>
                <button
                  onClick={() => setActiveTab('achievements')}
                  className="text-xs font-bold text-[#1768DF] hover:underline cursor-pointer"
                >
                  See All
                </button>
              </div>

              <div className="space-y-2.5">
                {achievements.slice(0, 3).map((ach) => (
                  <div
                    key={ach.id}
                    className="p-3 rounded-2xl bg-[#F8FAFC] border border-[#E4E9F2] flex items-center gap-3"
                  >
                    <span className="text-2xl">{ach.icon}</span>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-xs text-[#172033] truncate">{ach.title}</div>
                      <div className="text-[10px] text-[#697386]">{ach.game} • +{ach.xpReward} XP</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gaming Experience Tab */}
      {activeTab === 'experience' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-[#10234A]">Chronological Gaming Timeline</h2>
            {isOwnProfile && (
              <button
                onClick={() => onNavigate('experience')}
                className="px-4 py-2 bg-[#1768DF] text-white rounded-full text-xs font-bold shadow-xs cursor-pointer"
              >
                Manage Experience
              </button>
            )}
          </div>
          {experiences.map((exp) => (
            <div
              key={exp.id}
              className="bg-white rounded-3xl border border-[#E4E9F2] p-6 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <img
                    src={exp.gameCover}
                    alt={exp.gameTitle}
                    className="w-14 h-14 rounded-2xl object-cover ring-1 ring-[#E4E9F2]"
                  />
                  <div>
                    <h3 className="text-base font-black text-[#172033]">{exp.gameTitle}</h3>
                    <p className="text-xs font-bold text-[#1768DF]">
                      {exp.role} • {exp.rank}
                    </p>
                    <p className="text-xs text-[#697386]">
                      {exp.startDate} - {exp.isCurrentlyPlaying ? 'Present' : exp.endDate} • {exp.hoursPlayed} Hours Logged
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-[#EEF4FE] text-[#1768DF] text-xs font-bold rounded-full">
                  {exp.platform}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#172033] leading-relaxed">{exp.description}</p>
              <div className="flex flex-wrap gap-1.5 pt-2">
                {exp.skills.map((skill) => (
                  <span
                    key={skill}
                    className="text-[11px] font-semibold bg-[#F4F6FC] px-2.5 py-1 rounded-lg text-[#697386]"
                  >
                    ✓ {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Gaming Adventures Tab */}
      {activeTab === 'adventures' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {adventures.map((adv) => (
            <div
              key={adv.id}
              className="bg-white rounded-3xl border border-[#E4E9F2] overflow-hidden shadow-xs flex flex-col justify-between"
            >
              <div className="h-48 w-full bg-slate-900 relative">
                <img
                  src={adv.mediaUrl}
                  alt={adv.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white">
                  {adv.game}
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-base text-[#172033]">{adv.title}</h3>
                  <p className="text-xs text-[#697386] mt-1.5 leading-relaxed">{adv.description}</p>
                  {adv.personalStory && (
                    <p className="text-xs italic text-[#1768DF] mt-2">"{adv.personalStory}"</p>
                  )}
                </div>
                <div className="mt-4 pt-4 border-t border-[#E4E9F2] flex items-center justify-between text-xs text-[#697386]">
                  <span>{adv.date}</span>
                  <span className="font-semibold text-[#172033]">❤️ {adv.likesCount} cheers</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Achievements Tab */}
      {activeTab === 'achievements' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className="bg-white rounded-3xl border border-[#E4E9F2] p-5 shadow-xs flex items-start gap-3.5"
            >
              <div className="text-3xl p-2.5 rounded-2xl bg-[#F4F6FC] border border-[#E4E9F2]">
                {ach.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                      ach.rarity === 'Legendary'
                        ? 'bg-amber-100 text-amber-800'
                        : ach.rarity === 'Epic'
                        ? 'bg-purple-100 text-purple-800'
                        : ach.rarity === 'Rare'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {ach.rarity}
                  </span>
                  <span className="text-xs font-bold text-[#16A36A]">+{ach.xpReward} XP</span>
                </div>
                <h4 className="font-bold text-sm text-[#172033] mt-1">{ach.title}</h4>
                <p className="text-xs text-[#697386] mt-0.5">{ach.description}</p>
                <div className="text-[10px] text-[#94a3b8] mt-2">
                  {ach.isSelfReported ? 'Self-Reported' : 'Platform Verified'} • {ach.unlockDate}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Gaming Friends Tab */}
      {activeTab === 'friends' && (
        <div className="bg-white rounded-3xl border border-[#E4E9F2] p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-black text-[#10234A]">Gaming Friends & Squad Connections</h2>
            <button
              onClick={() => onNavigate('friends')}
              className="text-xs font-bold text-[#1768DF] hover:underline cursor-pointer"
            >
              Find More Players →
            </button>
          </div>
          <p className="text-xs text-[#697386] mb-4">
            Players who share game interests and squad up with @{profile.username}.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { name: 'Alex Rivers', handle: 'shadow_ninja', game: 'Valorant', rank: 'Ascendant 1', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80' },
              { name: 'Sarah Vance', handle: 'valkyrie_aim', game: 'Apex Legends', rank: 'Diamond 3', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80' },
              { name: 'Marcus Brody', handle: 'brody_fps', game: 'Valorant', rank: 'Platinum 2', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80' }
            ].map((f) => (
              <div key={f.handle} className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E4E9F2] flex items-center gap-3">
                <img src={f.avatar} alt={f.name} className="w-10 h-10 rounded-full object-cover ring-1 ring-[#E4E9F2]" />
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-xs text-[#172033] truncate">{f.name}</div>
                  <div className="text-[11px] text-[#697386] truncate">@{f.handle}</div>
                  <div className="text-[10px] text-[#1768DF] font-semibold mt-0.5">{f.game} ({f.rank})</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Posts Tab */}
      {activeTab === 'posts' && (
        <div className="space-y-4 max-w-2xl mx-auto">
          {userPosts.length === 0 ? (
            <div className="bg-white rounded-3xl border border-[#E4E9F2] p-8 text-center text-xs text-[#697386]">
              No posts shared yet by @{profile.username}.
            </div>
          ) : (
            userPosts.map((post) => (
              <FeedPostCard
                key={post.id}
                post={post}
                currentUser={currentUser}
                onLike={onLikePost}
                onComment={onCommentPost}
              />
            ))
          )}
        </div>
      )}

      {/* 3. EDIT PROFILE MODAL (Section 3) */}
      {isEditModalOpen && isOwnProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-[#E4E9F2] overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#E4E9F2] flex items-center justify-between">
              <div className="flex items-center gap-2 font-black text-base text-[#10234A]">
                <Edit3 className="w-5 h-5 text-[#1768DF]" />
                <span>Edit Gamer Identity Profile</span>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-full text-[#697386] hover:bg-[#F4F6FC] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveProfile} className="p-6 overflow-y-auto space-y-5 text-xs">
              {uploadError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}
              {usernameError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{usernameError}</span>
                </div>
              )}

              {/* Image Upload Row (Avatar & Cover) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#F8FAFC] p-4 rounded-2xl border border-[#E4E9F2]">
                {/* Profile Picture Upload */}
                <div>
                  <label className="block font-bold text-[#172033] mb-2">
                    Profile Picture (Max 5MB)
                  </label>
                  <div className="flex items-center gap-3">
                    <img
                      src={avatarUrl}
                      alt="Avatar preview"
                      className="w-14 h-14 rounded-full object-cover ring-2 ring-[#1768DF]/30"
                    />
                    <div>
                      <input
                        type="file"
                        ref={avatarInputRef}
                        onChange={handleAvatarFileChange}
                        accept="image/png,image/jpeg,image/webp,image/gif"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => avatarInputRef.current?.click()}
                        disabled={isUploadingAvatar}
                        className="px-3.5 py-1.5 bg-white border border-[#E4E9F2] hover:bg-[#EEF4FE] text-[#1768DF] font-bold text-xs rounded-xl shadow-2xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{isUploadingAvatar ? 'Uploading...' : 'Upload Picture'}</span>
                      </button>
                      <span className="text-[10px] text-[#697386] block mt-1">PNG, JPG, WEBP up to 5MB</span>
                    </div>
                  </div>
                </div>

                {/* Cover Image Upload */}
                <div>
                  <label className="block font-bold text-[#172033] mb-2">
                    Cover Banner (Max 5MB)
                  </label>
                  <div className="flex items-center gap-3">
                    <img
                      src={coverUrl}
                      alt="Cover preview"
                      className="w-20 h-14 rounded-xl object-cover ring-2 ring-[#1768DF]/30"
                    />
                    <div>
                      <input
                        type="file"
                        ref={coverInputRef}
                        onChange={handleCoverFileChange}
                        accept="image/png,image/jpeg,image/webp,image/gif"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => coverInputRef.current?.click()}
                        disabled={isUploadingCover}
                        className="px-3.5 py-1.5 bg-white border border-[#E4E9F2] hover:bg-[#EEF4FE] text-[#1768DF] font-bold text-xs rounded-xl shadow-2xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{isUploadingCover ? 'Uploading...' : 'Upload Banner'}</span>
                      </button>
                      <span className="text-[10px] text-[#697386] block mt-1">PNG, JPG, WEBP up to 5MB</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Display Name & Unique Username */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-[#172033] mb-1">Display Name</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#E4E9F2] text-sm focus:border-[#1768DF] focus:outline-hidden"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#172033] mb-1">Unique Gamer Handle</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 font-bold text-[#697386]">@</span>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      className="w-full pl-7 pr-3 py-2.5 rounded-xl border border-[#E4E9F2] text-sm font-mono focus:border-[#1768DF] focus:outline-hidden"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Status Tagline & Bio */}
              <div>
                <label className="block font-bold text-[#172033] mb-1">Gamer Status Tagline</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="e.g. Radiant Initiator • Minecraft SMP Builder 🎮"
                  className="w-full p-2.5 rounded-xl border border-[#E4E9F2] text-sm focus:border-[#1768DF] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-[#172033] mb-1">Gamer Biography</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  placeholder="Tell other gamers about your favorite moments, clan history, or playstyle..."
                  className="w-full p-2.5 rounded-xl border border-[#E4E9F2] text-sm focus:border-[#1768DF] focus:outline-hidden resize-none"
                />
              </div>

              {/* Location & Organization */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-[#172033] mb-1">Location (Optional)</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Sfax, Tunisia"
                    className="w-full p-2.5 rounded-xl border border-[#E4E9F2] text-sm focus:border-[#1768DF] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#172033] mb-1">School / Clan / Organization</label>
                  <input
                    type="text"
                    value={schoolOrOrg}
                    onChange={(e) => setSchoolOrOrg(e.target.value)}
                    placeholder="e.g. IIT, Team Phoenix"
                    className="w-full p-2.5 rounded-xl border border-[#E4E9F2] text-sm focus:border-[#1768DF] focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Total User-Reported Hours */}
              <div>
                <label className="block font-bold text-[#172033] mb-1">
                  Lifetime Gaming Playtime Hours (User-Reported)
                </label>
                <input
                  type="number"
                  value={hoursLogged}
                  onChange={(e) => setHoursLogged(Number(e.target.value))}
                  min={0}
                  className="w-full p-2.5 rounded-xl border border-[#E4E9F2] text-sm focus:border-[#1768DF] focus:outline-hidden"
                />
                <p className="text-[10px] text-[#697386] mt-1">
                  Clearly reported as self-estimated in accordance with GameOut network transparency rules.
                </p>
              </div>

              {/* Favorite Games Tag Input */}
              <div>
                <label className="block font-bold text-[#172033] mb-1">Favorite Video Games</label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={newGameInput}
                    onChange={(e) => setNewGameInput(e.target.value)}
                    placeholder="Type game title (e.g. CS2, Elden Ring)..."
                    className="flex-1 p-2 rounded-xl border border-[#E4E9F2] text-xs focus:border-[#1768DF] focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={handleAddFavoriteGame}
                    className="px-3 py-2 bg-[#EEF4FE] hover:bg-[#E0ECFD] text-[#1768DF] font-bold rounded-xl cursor-pointer"
                  >
                    Add Game
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {favoriteGames.map((game) => (
                    <span
                      key={game}
                      className="px-2.5 py-1 rounded-lg bg-[#F4F6FC] border border-[#E4E9F2] text-xs font-semibold text-[#172033] flex items-center gap-1.5"
                    >
                      <span>{game}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFavoriteGame(game)}
                        className="text-[#697386] hover:text-red-500 cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Platforms Multi-select */}
              <div>
                <label className="block font-bold text-[#172033] mb-1.5">Gaming Platforms</label>
                <div className="flex flex-wrap gap-2">
                  {availablePlatforms.map((plat) => {
                    const isSelected = selectedPlatforms.includes(plat);
                    return (
                      <button
                        type="button"
                        key={plat}
                        onClick={() => handleTogglePlatform(plat)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#1768DF] text-white shadow-2xs'
                            : 'bg-[#F4F6FC] text-[#697386] border border-[#E4E9F2]'
                        }`}
                      >
                        {isSelected ? '✓ ' : ''}{plat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Roles Multi-select */}
              <div>
                <label className="block font-bold text-[#172033] mb-1.5">Gaming Roles</label>
                <div className="flex flex-wrap gap-2">
                  {availableRoles.map((r) => {
                    const isSelected = selectedRoles.includes(r);
                    return (
                      <button
                        type="button"
                        key={r}
                        onClick={() => handleToggleRole(r)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#1768DF] text-white shadow-2xs'
                            : 'bg-[#F4F6FC] text-[#697386] border border-[#E4E9F2]'
                        }`}
                      >
                        {isSelected ? '✓ ' : ''}{r}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-[#E4E9F2] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-[#697386] hover:bg-[#F4F6FC] rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 bg-[#1768DF] hover:bg-[#1255be] disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  {isSaving ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. REPORT / BLOCK MODAL (Section 5) */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-[#E4E9F2] overflow-hidden p-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#E4E9F2]">
              <div className="flex items-center gap-2 font-bold text-sm text-[#10234A]">
                <Shield className="w-4 h-4 text-red-500" />
                <span>Report or Block @{profile.username}</span>
              </div>
              <button
                onClick={() => setIsReportModalOpen(false)}
                className="text-[#697386] hover:text-[#172033]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {reportSuccess ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-[#16A36A] mx-auto" />
                <h4 className="font-bold text-sm text-[#10234A]">Report Received</h4>
                <p className="text-xs text-[#697386]">
                  Thank you for keeping the GameOut community safe. Our trust & safety team will review this report.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendReport} className="mt-4 space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-[#172033] mb-1">Reason for report</label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#E4E9F2] text-xs focus:outline-hidden"
                  >
                    <option value="Harassment or unsportsmanlike behavior">Harassment or unsportsmanlike behavior</option>
                    <option value="Cheats, exploits, or third-party hacks">Cheats, exploits, or third-party hacks</option>
                    <option value="Impersonation or stolen identity">Impersonation or stolen identity</option>
                    <option value="Spam or fraudulent trading">Spam or fraudulent trading</option>
                  </select>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setIsBlocked(true);
                      setIsReportModalOpen(false);
                    }}
                    className="text-red-500 font-bold hover:underline flex items-center gap-1"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    <span>Block Gamer</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsReportModalOpen(false)}
                      className="px-3 py-1.5 text-[#697386] font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl"
                    >
                      Submit Report
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
