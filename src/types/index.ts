export type Platform = 'PC' | 'PlayStation 5' | 'PlayStation 4' | 'Xbox Series X/S' | 'Nintendo Switch' | 'Mobile';

export type GamerRole = 'Competitive Player' | 'Casual Player' | 'Content Creator' | 'Streamer' | 'Builder / Architect' | 'Team Captain' | 'Support Specialist' | 'Speedrunner';

export type AchievementRarity = 'Common' | 'Rare' | 'Epic' | 'Legendary';

export interface GamerProfile {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  coverUrl: string;
  tagline: string;
  bio: string;
  location?: string;
  schoolOrOrg?: string;
  isVerified: boolean;
  level: number;
  xp: number;
  xpToNextLevel: number;
  levelProgressPercentage: number;
  followersCount: number;
  followingCount: number;
  friendsCount: number;
  platforms: Platform[];
  favoriteGames: string[];
  roles: GamerRole[];
  joinedDate: string;
  status: 'online' | 'in-game' | 'offline' | 'suspended';
  currentGame?: string;
  isSuspended?: boolean;
  suspendedReason?: string;
  privacySettings?: PrivacySettings;
  stats: {
    hoursLogged: number;
    achievementsUnlocked: number;
    adventuresCompleted: number;
    tournamentsWon: number;
  };
}

export interface GamingPostComment {
  id: string;
  postId?: string;
  author: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string;
    isVerified?: boolean;
  };
  content: string;
  timestamp: string;
  createdAt?: string;
  editedAt?: string;
  likesCount: number;
  isLiked?: boolean;
  parentId?: string;
  replies?: GamingPostComment[];
}

export interface GamingPost {
  id: string;
  author: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string;
    isVerified: boolean;
  };
  content: string;
  gameTag?: string;
  tags?: string[];
  timestamp: string;
  createdAt?: string;
  editedAt?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'clip' | 'achievement' | 'custom_banner';
  badgeTitle?: string;
  postType?: 'status' | 'photo' | 'clip' | 'achievement' | 'adventure' | 'moment';
  visibility?: 'public' | 'friends_only';
  reactions: {
    likes: number;
    hearts: number;
    fires: number;
    userReaction?: 'like' | 'heart' | 'fire' | null;
  };
  commentsCount: number;
  sharesCount: number;
  comments: GamingPostComment[];
  isSaved?: boolean;
}

export interface GamingExperience {
  id: string;
  userId: string;
  gameTitle: string;
  gameCover: string;
  platform: Platform;
  role: GamerRole;
  gameMode: string;
  startDate: string;
  endDate?: string;
  isCurrentlyPlaying: boolean;
  hoursPlayed: number;
  experienceLevel: string;
  rank: string;
  description: string;
  skills: string[];
  achievements: string[];
}

export interface GamingAdventure {
  id: string;
  userId: string;
  title: string;
  game: string;
  description: string;
  mediaUrl: string;
  teamMembers: string[];
  tournamentParticipation?: string;
  challengeCompletion?: string;
  personalStory: string;
  date: string;
  tags: string[];
  likesCount: number;
  isLiked?: boolean;
}

export interface GameAchievement {
  id: string;
  userId: string;
  title: string;
  description: string;
  game: string;
  icon: string;
  rarity: AchievementRarity;
  unlockDate: string;
  xpReward: number;
  isUnlocked: boolean;
  progressPercentage?: number;
  isSelfReported?: boolean;
}

export interface GamingTrend {
  id: string;
  rank: number;
  title: string;
  postCount: string;
  coverUrl: string;
  category?: string;
}

export interface SuggestedGamer {
  id: string;
  name: string;
  username: string;
  avatarUrl: string;
  isVerified: boolean;
  followersCount: string;
  isFollowing: boolean;
  primaryGame: string;
  mutualFriends?: number;
}

export interface GameCatalogItem {
  id: string;
  title: string;
  slug: string;
  coverUrl: string;
  bannerUrl: string;
  description: string;
  genre: string;
  platforms: Platform[];
  releaseYear: number;
  rating: number;
  activePlayersCount: string;
  postsCount: string;
  communitiesCount: number;
  developer?: string;
  publisher?: string;
  popularityScore?: number;
  isPopular?: boolean;
  isRecentlyAdded?: boolean;
  categories?: string[];
  topPlayers: {
    name: string;
    avatarUrl: string;
    rank: string;
  }[];
}

export type NotificationType =
  | 'like'
  | 'comment'
  | 'reply'
  | 'friend_request'
  | 'friend_request_accepted'
  | 'follow'
  | 'achievement'
  | 'message'
  | 'mention';

export interface NotificationItem {
  id: string;
  recipientId?: string;
  type: NotificationType;
  actor: {
    id?: string;
    name: string;
    username?: string;
    avatarUrl: string;
  };
  content: string;
  target?: string;
  targetId?: string;
  targetType?: 'post' | 'adventure' | 'conversation' | 'profile' | 'friends' | 'achievement';
  timestamp: string;
  createdAt?: string;
  isRead: boolean;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName?: string;
  senderUsername?: string;
  senderAvatar?: string;
  text: string;
  timestamp: string;
  createdAt?: string;
  isRead: boolean;
  readBy?: string[];
}

export interface ConversationParticipant {
  id: string;
  displayName: string;
  username: string;
  avatarUrl: string;
  isOnline?: boolean;
  lastActive?: string;
}

export interface Conversation {
  id: string;
  type?: 'direct' | 'group';
  name?: string;
  avatarUrl?: string;
  gameTag?: string;
  participantIds?: string[];
  participants?: ConversationParticipant[];
  creatorId?: string;
  adminIds?: string[];
  lastMessage: string;
  lastMessageSenderId?: string;
  lastMessageTime: string;
  updatedAt?: string;
  unreadCount: number;
  unreadCounts?: { [userId: string]: number };
  readBy?: string[];
  // Backwards compatibility property for 1-to-1 conversation view
  participant: ConversationParticipant;
  messages: ChatMessage[];
}

export interface NotificationPreferences {
  likes: boolean;
  comments: boolean;
  replies: boolean;
  friendRequests: boolean;
  messages: boolean;
  achievements: boolean;
  mentions: boolean;
  soundEnabled: boolean;
  inAppAlerts: boolean;
}

export interface FriendRequest {
  id: string;
  senderId: string;
  senderName: string;
  senderUsername: string;
  senderAvatarUrl: string;
  senderLevel: number;
  senderGame: string;
  receiverId: string;
  receiverName?: string;
  receiverUsername?: string;
  receiverAvatarUrl?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  note?: string;
  gameTag?: string;
  createdAt: string;
}

export interface FollowRecord {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: string;
}

export interface GamerCommunity {
  id: string;
  name: string;
  gameTitle: string;
  slug: string;
  description: string;
  coverUrl: string;
  bannerUrl: string;
  creatorId: string;
  creatorName: string;
  creatorAvatarUrl?: string;
  membersCount: number;
  isJoined?: boolean;
  category: string;
  tags: string[];
  rules: string[];
  leadModerators: string[];
  discordUrl?: string;
  voiceChannelActive?: boolean;
  createdAt: string;
}

export interface GamerDiscoveryFilter {
  search: string;
  favoriteGame: string;
  platform: string;
  role: string;
  minLevel: number;
  location: string;
  onlyVerified: boolean;
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'friends_only' | 'private';
  whoCanMessage: 'everyone' | 'friends_only' | 'nobody';
  whoCanViewExperiences: 'everyone' | 'friends_only' | 'only_me';
  whoCanViewAdventures: 'everyone' | 'friends_only' | 'only_me';
  whoCanViewAchievements: 'everyone' | 'friends_only' | 'only_me';
  allowActivityBroadcasting: boolean;
}

export interface BlockedUser {
  id: string;
  blockerId: string;
  blockedId: string;
  blockedUsername: string;
  blockedDisplayName: string;
  blockedAvatarUrl: string;
  createdAt: string;
}

export interface ReportItem {
  id: string;
  reporterId: string;
  reporterUsername?: string;
  targetId: string;
  targetType: 'user' | 'post' | 'comment' | 'adventure';
  targetName?: string;
  targetContent?: string;
  reason: string;
  details?: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  actionTaken?: 'warn_user' | 'suspend_account' | 'remove_content' | 'dismiss' | 'none';
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface AdminAuditLog {
  id: string;
  adminId: string;
  adminEmail?: string;
  action: string;
  targetId: string;
  targetType: string;
  details: string;
  timestamp: string;
}

export type ActivePage = 
  | 'home'
  | 'profile'
  | 'experience'
  | 'adventures'
  | 'achievements'
  | 'friends'
  | 'messages'
  | 'explore'
  | 'game-details'
  | 'notifications'
  | 'search'
  | 'settings'
  | 'privacy'
  | 'admin'
  | 'landing'
  | 'login'
  | 'register'
  | 'forgot-password';

