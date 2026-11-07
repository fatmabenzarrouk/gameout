import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { HomeDashboard } from './pages/HomeDashboard';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ProfilePage } from './pages/ProfilePage';
import { GamingExperiencePage } from './pages/GamingExperiencePage';
import { GamingAdventuresPage } from './pages/GamingAdventuresPage';
import { GameAchievementsPage } from './pages/GameAchievementsPage';
import { GamingFriendsPage } from './pages/GamingFriendsPage';
import { MessagesPage } from './pages/MessagesPage';
import { ExploreGamesPage } from './pages/ExploreGamesPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { SearchPage } from './pages/SearchPage';
import { SettingsPage } from './pages/SettingsPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AuthModal } from './components/auth/AuthModal';
import { GameOutLogo } from './components/common/GameOutLogo';
import {
  saveGamingExperience,
  deleteGamingExperience as removeExpFromFirestore,
  saveGamingAdventure,
  deleteGamingAdventure as removeAdvFromFirestore,
  saveAchievement,
  deleteAchievement as removeAchFromFirestore,
  calculateLevelFromXP
} from './services/portfolioService';
import {
  fetchFeedPosts,
  savePostToFirestore,
  deletePostFromFirestore,
  addCommentToFirestore,
  editCommentInFirestore,
  deleteCommentFromFirestore,
  togglePostReaction,
  toggleSavePost,
  reportContent
} from './services/feedService';
import { submitContentReport } from './services/adminService';
import { fetchBlockedUsers } from './services/privacyService';
import { ReportContentModal } from './components/common/ReportContentModal';
import {
  subscribeToConversations,
  getOrCreateDirectConversation,
  seedInitialConversations
} from './services/messagingService';
import {
  subscribeToNotifications,
  notifyLike,
  notifyComment,
  notifyMention,
  notifyAchievementUnlock,
  seedInitialNotifications
} from './services/notificationService';

import {
  CURRENT_USER,
  INITIAL_POSTS,
  GAMING_TRENDS,
  SUGGESTED_GAMERS,
  GAMING_EXPERIENCES,
  GAMING_ADVENTURES,
  GAME_ACHIEVEMENTS,
  CATALOG_GAMES,
  INITIAL_NOTIFICATIONS,
  INITIAL_CONVERSATIONS
} from './services/mockData';

import {
  ActivePage,
  GamerProfile,
  GamingPost,
  GamingExperience,
  GamingAdventure,
  GameAchievement,
  GameCatalogItem,
  NotificationItem,
  Conversation
} from './types';
import { Shield, Sparkles, LogIn } from 'lucide-react';

// Multi-account testing profiles for real-time dual-user messaging testing
const TEST_ACCOUNTS: GamerProfile[] = [
  CURRENT_USER,
  {
    ...CURRENT_USER,
    id: 'user_alex',
    username: 'valkyrie_alex',
    displayName: 'Alex "Valkyrie" Chen',
    avatarUrl: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=150&q=80',
    level: 38,
    xp: 12400,
    tagline: 'Radiant Initiator | Sova & Fade Main',
    favoriteGames: ['Valorant', 'Apex Legends'],
    status: 'online'
  },
  {
    ...CURRENT_USER,
    id: 'user_marcus',
    username: 'shadow_marcus',
    displayName: 'Marcus "Shadow" Vance',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    level: 45,
    xp: 15600,
    tagline: 'Apex Predator #142 | IGL for Team Shadow',
    favoriteGames: ['Apex Legends', 'Counter-Strike 2'],
    status: 'online'
  },
  {
    ...CURRENT_USER,
    id: 'user_elena',
    username: 'pixel_queen',
    displayName: 'Elena "PixelQueen" Rostova',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
    level: 32,
    xp: 9800,
    tagline: 'Challenger Support | League of Legends',
    favoriteGames: ['League of Legends', 'Valorant'],
    status: 'online'
  }
];

function GameOutApp() {
  const { firebaseUser, gamerProfile, isLoading, logout, updateGamerProfile, checkUsernameAvailable } = useAuth();

  // If user is authenticated, default to 'home'; otherwise 'landing'
  const [activePage, setActivePage] = useState<ActivePage>('landing');
  const [viewingProfile, setViewingProfile] = useState<GamerProfile | undefined>(undefined);
  const [posts, setPosts] = useState<GamingPost[]>(INITIAL_POSTS);
  const [experiences, setExperiences] = useState<GamingExperience[]>(GAMING_EXPERIENCES);
  const [adventures, setAdventures] = useState<GamingAdventure[]>(GAMING_ADVENTURES);
  const [achievements, setAchievements] = useState<GameAchievement[]>(GAME_ACHIEVEMENTS);
  const [catalogGames] = useState<GameCatalogItem[]>(CATALOG_GAMES);
  const [trends] = useState(GAMING_TRENDS);
  const [suggestedGamers] = useState(SUGGESTED_GAMERS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [searchQuery, setSearchQuery] = useState('');

  // Selected conversation ID when jumping from notification or friend card
  const [selectedConversationId, setSelectedConversationId] = useState<string>('');

  // Multi-account testing override
  const [simulatedTestUser, setSimulatedTestUser] = useState<GamerProfile | undefined>(undefined);

  // Guest demo bypass mode so tester can test both live Firebase Auth AND see the full demo data immediately
  const [guestPreviewMode, setGuestPreviewMode] = useState(false);

  const [authModal, setAuthModal] = useState<{
    isOpen: boolean;
    mode: 'login' | 'register' | 'forgot';
  }>({
    isOpen: false,
    mode: 'login'
  });

  // Reporting modal for reporting users, posts, or comments
  const [reportingModal, setReportingModal] = useState<{
    isOpen: boolean;
    targetId: string;
    targetType: 'user' | 'post' | 'comment' | 'adventure';
    targetName: string;
    targetContent?: string;
  }>({
    isOpen: false,
    targetId: '',
    targetType: 'post',
    targetName: ''
  });

  // Blocked users list for privacy enforcement
  const [blockedUserIds, setBlockedUserIds] = useState<string[]>([]);

  // Effective user: simulated test user, or live Firebase gamerProfile if logged in, or mock CURRENT_USER
  const currentUser: GamerProfile = simulatedTestUser || gamerProfile || CURRENT_USER;
  const isAuthenticated = Boolean(firebaseUser) || guestPreviewMode || Boolean(simulatedTestUser);

  // Load blocked users for privacy enforcement
  useEffect(() => {
    fetchBlockedUsers(currentUser.id).then((blocks) => {
      setBlockedUserIds(blocks.map((b) => b.blockedId));
    }).catch(console.warn);
  }, [currentUser.id]);

  // Real-time Firestore Feed Fetch
  useEffect(() => {
    let isMounted = true;
    fetchFeedPosts()
      .then((feed) => {
        if (isMounted && feed && feed.length > 0) {
          setPosts(feed);
        }
      })
      .catch((err) => {
        console.warn('Feed fetch notice:', err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Real-time Firestore Conversations Subscription for the current active gamer
  useEffect(() => {
    if (!firebaseUser) {
      setConversations(INITIAL_CONVERSATIONS);
      return;
    }

    let isMounted = true;
    seedInitialConversations(currentUser).catch(console.warn);

    const unsubscribe = subscribeToConversations(
      currentUser.id,
      (updatedConvs) => {
        if (isMounted) setConversations(updatedConvs);
      },
      (err) => {
        console.warn('Conversations sync notice:', err);
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [firebaseUser, currentUser.id]);

  // Real-time Firestore Notifications Subscription for the current active gamer
  useEffect(() => {
    if (!firebaseUser) {
      setNotifications(INITIAL_NOTIFICATIONS);
      return;
    }

    let isMounted = true;
    seedInitialNotifications(currentUser.id).catch(console.warn);

    const unsubscribe = subscribeToNotifications(
      currentUser.id,
      (updatedNotifs) => {
        if (isMounted) setNotifications(updatedNotifs);
      },
      (err) => {
        console.warn('Notifications sync notice:', err);
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [firebaseUser, currentUser.id]);

  // Protected route enforcement
  const privateRoutes: ActivePage[] = [
    'home',
    'profile',
    'experience',
    'adventures',
    'achievements',
    'friends',
    'messages',
    'settings',
    'admin'
  ];

  // If user accesses private route while not logged in, redirect to login
  const isCurrentRoutePrivate = privateRoutes.includes(activePage);
  const shouldRedirectToLogin = isCurrentRoutePrivate && !isAuthenticated;

  // Handle post creation with Firestore persistence
  const handleAddPost = (
    newPostData: Omit<GamingPost, 'id' | 'timestamp' | 'reactions' | 'commentsCount' | 'sharesCount' | 'comments'>
  ) => {
    const newPost: GamingPost = {
      ...newPostData,
      id: `post_${Date.now()}`,
      timestamp: 'Just now • 🌐',
      createdAt: new Date().toISOString(),
      reactions: {
        likes: 1,
        hearts: 0,
        fires: 0,
        userReaction: 'like'
      },
      commentsCount: 0,
      sharesCount: 0,
      comments: []
    };

    setPosts([newPost, ...posts]);

    // Persist to Firestore
    savePostToFirestore(newPost).catch(console.error);
  };

  // Handle post like/reaction with anti-duplicate validation
  const handleLikePost = (postId: string, reactionType: 'like' | 'heart' | 'fire') => {
    const targetPost = posts.find((p) => p.id === postId);
    if (!targetPost) return;

    const currentReaction = targetPost.reactions.userReaction || null;

    togglePostReaction(postId, currentUser.id, reactionType, currentReaction, targetPost)
      .then((res) => {
        setPosts((prev) =>
          prev.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  reactions: {
                    ...res.reactions,
                    userReaction: res.userReaction
                  }
                }
              : post
          )
        );

        // Send notification if user added reaction (not removed) and target author is not self
        if (res.userReaction && targetPost.author.id !== currentUser.id) {
          notifyLike(
            targetPost.author.id,
            {
              id: currentUser.id,
              name: currentUser.displayName,
              username: currentUser.username,
              avatarUrl: currentUser.avatarUrl
            },
            targetPost.content,
            postId
          ).catch(console.warn);
        }
      })
      .catch((err) => {
        console.error('Like toggle error:', err);
      });
  };

  // Handle comments
  const handleCommentPost = (postId: string, text: string, parentId?: string) => {
    const targetPost = posts.find((p) => p.id === postId);

    const commentItem = {
      id: `c_${Date.now()}`,
      postId,
      author: {
        id: currentUser.id,
        username: currentUser.username,
        displayName: currentUser.displayName,
        avatarUrl: currentUser.avatarUrl,
        isVerified: currentUser.isVerified
      },
      content: text,
      timestamp: 'Just now',
      createdAt: new Date().toISOString(),
      parentId,
      likesCount: 0
    };

    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            commentsCount: post.commentsCount + 1,
            comments: [...post.comments, commentItem]
          };
        }
        return post;
      })
    );

    addCommentToFirestore(postId, commentItem).catch(console.error);

    // Send comment notification to post author
    if (targetPost && targetPost.author.id !== currentUser.id) {
      notifyComment(
        targetPost.author.id,
        {
          id: currentUser.id,
          name: currentUser.displayName,
          username: currentUser.username,
          avatarUrl: currentUser.avatarUrl
        },
        text,
        postId
      ).catch(console.warn);
    }

    // Mention alerts (@username)
    const mentions = text.match(/@([a-zA-Z0-9_]+)/g);
    if (mentions) {
      mentions.forEach((m) => {
        const handle = m.replace('@', '').toLowerCase();
        const found = suggestedGamers.find((g) => g.username.toLowerCase() === handle);
        if (found && found.id !== currentUser.id) {
          notifyMention(
            found.id,
            {
              id: currentUser.id,
              name: currentUser.displayName,
              username: currentUser.username,
              avatarUrl: currentUser.avatarUrl
            },
            text,
            postId
          ).catch(console.warn);
        }
      });
    }
  };

  // Handle post edit
  const handleEditPost = (postId: string, newContent: string) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const updated = {
            ...post,
            content: newContent,
            editedAt: new Date().toISOString()
          };
          savePostToFirestore(updated).catch(console.error);
          return updated;
        }
        return post;
      })
    );
  };

  // Handle post delete
  const handleDeletePost = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    deletePostFromFirestore(postId).catch(console.error);
  };

  // Handle bookmark/save
  const handleBookmarkPost = (postId: string) => {
    const post = posts.find((p) => p.id === postId);
    const isSaved = Boolean(post?.isSaved);

    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, isSaved: !isSaved } : p))
    );

    toggleSavePost(postId, currentUser.id, isSaved).catch(console.error);
  };

  // Filter out content from gamers blocked by the current user
  const visiblePosts = posts.filter((p) => !blockedUserIds.includes(p.author.id));

  // Handle report post directly into Firestore /reports
  const handleReportPost = (postId: string, reason: string) => {
    const targetPost = posts.find((p) => p.id === postId);
    submitContentReport({
      reporterId: currentUser.id,
      reporterUsername: currentUser.username,
      targetId: postId,
      targetType: 'post',
      targetName: targetPost ? `${targetPost.author.displayName}'s post` : `Post #${postId}`,
      targetContent: targetPost?.content || '',
      reason
    }).catch(console.error);
  };

  // Handle comment edit & delete
  const handleEditComment = (postId: string, commentId: string, newText: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            comments: p.comments.map((c) =>
              c.id === commentId ? { ...c, content: newText, editedAt: 'Just now' } : c
            )
          };
        }
        return p;
      })
    );
    editCommentInFirestore(commentId, newText).catch(console.error);
  };

  const handleDeleteComment = (postId: string, commentId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            commentsCount: Math.max(0, p.commentsCount - 1),
            comments: p.comments.filter((c) => c.id !== commentId)
          };
        }
        return p;
      })
    );
    deleteCommentFromFirestore(postId, commentId).catch(console.error);
  };

  const handleUpdateProfile = (updated: Partial<GamerProfile>) => {
    // Local state sync
  };

  const handleAddExperience = (expData: Omit<GamingExperience, 'id' | 'userId'>) => {
    const newExp: GamingExperience = {
      ...expData,
      id: `exp_${Date.now()}`,
      userId: currentUser.id
    };
    setExperiences([newExp, ...experiences]);
    if (firebaseUser) {
      saveGamingExperience(newExp).catch(console.error);
    }
  };

  const handleUpdateExperience = (exp: GamingExperience) => {
    setExperiences((prev) => prev.map((e) => (e.id === exp.id ? exp : e)));
    if (firebaseUser) {
      saveGamingExperience(exp).catch(console.error);
    }
  };

  const handleDeleteExperience = (id: string) => {
    setExperiences((prev) => prev.filter((e) => e.id !== id));
    if (firebaseUser) {
      removeExpFromFirestore(id).catch(console.error);
    }
  };

  const handleAddAdventure = (advData: Omit<GamingAdventure, 'id' | 'userId' | 'likesCount' | 'isLiked'>) => {
    const newAdv: GamingAdventure = {
      ...advData,
      id: `adv_${Date.now()}`,
      userId: currentUser.id,
      likesCount: 0,
      isLiked: false
    };
    setAdventures([newAdv, ...adventures]);
    if (firebaseUser) {
      saveGamingAdventure(newAdv).catch(console.error);
    }
  };

  const handleUpdateAdventure = (adv: GamingAdventure) => {
    setAdventures((prev) => prev.map((a) => (a.id === adv.id ? adv : a)));
    if (firebaseUser) {
      saveGamingAdventure(adv).catch(console.error);
    }
  };

  const handleDeleteAdventure = (id: string) => {
    setAdventures((prev) => prev.filter((a) => a.id !== id));
    if (firebaseUser) {
      removeAdvFromFirestore(id).catch(console.error);
    }
  };

  const handleLikeAdventure = (id: string) => {
    setAdventures((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              isLiked: !a.isLiked,
              likesCount: a.isLiked ? a.likesCount - 1 : a.likesCount + 1
            }
          : a
      )
    );
  };

  const handleAddAchievement = (achData: Omit<GameAchievement, 'id' | 'userId'>) => {
    const newAch: GameAchievement = {
      ...achData,
      id: `ach_${Date.now()}`,
      userId: currentUser.id
    };
    const nextAchList = [newAch, ...achievements];
    setAchievements(nextAchList);

    // Trigger in-app & stream notification for achievement unlock
    notifyAchievementUnlock(currentUser.id, newAch.title, newAch.rarity, newAch.xpReward).catch(console.warn);

    // Recalculate total XP
    const nextTotalXp = nextAchList
      .filter((a) => a.isUnlocked)
      .reduce((sum, a) => sum + a.xpReward, 0);

    const levelStats = calculateLevelFromXP(nextTotalXp);

    if (firebaseUser) {
      saveAchievement(newAch, currentUser.id).catch(console.error);
      updateGamerProfile({
        xp: nextTotalXp,
        level: levelStats.level,
        levelProgressPercentage: levelStats.progressPercentage
      }).catch(console.error);
    }
  };

  const handleUpdateAchievement = (ach: GameAchievement) => {
    const nextAchList = achievements.map((a) => (a.id === ach.id ? ach : a));
    setAchievements(nextAchList);

    const nextTotalXp = nextAchList
      .filter((a) => a.isUnlocked)
      .reduce((sum, a) => sum + a.xpReward, 0);

    const levelStats = calculateLevelFromXP(nextTotalXp);

    if (firebaseUser) {
      saveAchievement(ach, currentUser.id).catch(console.error);
      updateGamerProfile({
        xp: nextTotalXp,
        level: levelStats.level,
        levelProgressPercentage: levelStats.progressPercentage
      }).catch(console.error);
    }
  };

  const handleDeleteAchievement = (id: string) => {
    const nextAchList = achievements.filter((a) => a.id !== id);
    setAchievements(nextAchList);

    const nextTotalXp = nextAchList
      .filter((a) => a.isUnlocked)
      .reduce((sum, a) => sum + a.xpReward, 0);

    const levelStats = calculateLevelFromXP(nextTotalXp);

    if (firebaseUser) {
      removeAchFromFirestore(id).catch(console.error);
      updateGamerProfile({
        xp: nextTotalXp,
        level: levelStats.level,
        levelProgressPercentage: levelStats.progressPercentage
      }).catch(console.error);
    }
  };

  const unreadMessagesCount = conversations.reduce((acc, c) => acc + c.unreadCount, 0);
  const unreadNotificationsCount = notifications.filter((n) => !n.isRead).length;

  // Loading Screen while Firebase Auth listener is resolving
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F4F6FC] flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-4">
          <GameOutLogo size="xl" />
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#1768DF] mt-2">
            <div className="w-4 h-4 border-2 border-[#1768DF] border-t-transparent rounded-full animate-spin" />
            <span>Connecting to Firebase Auth & Firestore...</span>
          </div>
        </div>
      </div>
    );
  }

  // Handle protected route redirect
  if (shouldRedirectToLogin) {
    return (
      <LoginPage
        onNavigate={(page) => setActivePage(page)}
        onSuccessRedirect={() => setActivePage('home')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F6FC] text-[#172033] flex flex-col font-sans selection:bg-[#1768DF] selection:text-white">
      {/* Live Auth Status Bar */}
      <div className="bg-[#10234A] text-white text-[11px] px-4 py-1.5 flex items-center justify-between border-b border-blue-900">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#16A36A] animate-pulse" />
          <span>
            {firebaseUser ? (
              <>
                Signed in as <strong className="text-cyan-300">{firebaseUser.email}</strong> (@{currentUser.username})
              </>
            ) : guestPreviewMode ? (
              <>Guest Preview Active (Demo Gamer Identity: @fatmabenz)</>
            ) : (
              <>Firebase Authentication & Firestore Active</>
            )}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {!firebaseUser && !guestPreviewMode && (
            <button
              onClick={() => {
                setGuestPreviewMode(true);
                setActivePage('home');
              }}
              className="text-cyan-300 hover:underline font-bold cursor-pointer"
            >
              Test with Demo Profile →
            </button>
          )}
          {firebaseUser && (
            <button
              onClick={async () => {
                await logout();
                setActivePage('landing');
              }}
              className="text-white/80 hover:text-white hover:underline cursor-pointer"
            >
              Log Out
            </button>
          )}
        </div>
      </div>

      {/* Route Switcher */}
      {activePage === 'landing' ? (
        <LandingPage
          onEnterApp={() => {
            if (isAuthenticated) setActivePage('home');
            else setActivePage('login');
          }}
          onOpenAuth={(mode) => {
            if (mode === 'login') setActivePage('login');
            else if (mode === 'register') setActivePage('register');
            else setAuthModal({ isOpen: true, mode });
          }}
          onNavigate={(page) => setActivePage(page)}
        />
      ) : activePage === 'login' ? (
        <LoginPage
          onNavigate={(page) => setActivePage(page)}
          onSuccessRedirect={() => setActivePage('home')}
        />
      ) : activePage === 'register' ? (
        <RegisterPage
          onNavigate={(page) => setActivePage(page)}
          onSuccessRedirect={() => setActivePage('home')}
        />
      ) : activePage === 'forgot-password' ? (
        <ForgotPasswordPage onNavigate={(page) => setActivePage(page)} />
      ) : (
        <>
          {/* Top Sticky Navbar */}
          <Navbar
            currentUser={currentUser}
            activePage={activePage}
            onNavigate={(page) => {
              if (page === 'profile') setViewingProfile(undefined);
              setActivePage(page);
            }}
            unreadMessagesCount={unreadMessagesCount}
            unreadNotificationsCount={unreadNotificationsCount}
            onSearch={(q) => {
              setSearchQuery(q);
              setActivePage('search');
            }}
            isAdmin={true}
          />

          {/* Main Routed Page Content */}
          <main className="flex-1 pb-12">
            {activePage === 'home' && (
              <HomeDashboard
                currentUser={currentUser}
                posts={visiblePosts}
                trends={trends}
                suggestedGamers={suggestedGamers}
                activePage={activePage}
                onNavigate={(page) => {
                  if (page === 'profile') setViewingProfile(undefined);
                  setActivePage(page);
                }}
                onAddPost={handleAddPost}
                onLikePost={handleLikePost}
                onCommentPost={handleCommentPost}
                onEditPost={handleEditPost}
                onDeletePost={handleDeletePost}
                onBookmarkPost={handleBookmarkPost}
                onReportPost={handleReportPost}
                onEditComment={handleEditComment}
                onDeleteComment={handleDeleteComment}
              />
            )}

            {activePage === 'profile' && (
              <ProfilePage
                currentUser={currentUser}
                viewingProfile={viewingProfile}
                experiences={experiences}
                adventures={adventures}
                achievements={achievements}
                posts={posts}
                onUpdateProfile={async (updated) => {
                  if (firebaseUser) {
                    await updateGamerProfile(updated);
                  } else {
                    handleUpdateProfile(updated);
                  }
                }}
                onNavigate={(page) => {
                  if (page === 'profile') setViewingProfile(undefined);
                  setActivePage(page);
                }}
                checkUsernameAvailable={checkUsernameAvailable}
                onLikePost={handleLikePost}
                onCommentPost={handleCommentPost}
              />
            )}

            {activePage === 'experience' && (
              <GamingExperiencePage
                experiences={experiences}
                onAddExperience={handleAddExperience}
                onUpdateExperience={handleUpdateExperience}
                onDeleteExperience={handleDeleteExperience}
                currentUserId={currentUser.id}
              />
            )}

            {activePage === 'adventures' && (
              <GamingAdventuresPage
                adventures={adventures}
                onAddAdventure={handleAddAdventure}
                onUpdateAdventure={handleUpdateAdventure}
                onDeleteAdventure={handleDeleteAdventure}
                onLikeAdventure={handleLikeAdventure}
                currentUserId={currentUser.id}
              />
            )}

            {activePage === 'achievements' && (
              <GameAchievementsPage
                achievements={achievements}
                onAddAchievement={handleAddAchievement}
                onUpdateAchievement={handleUpdateAchievement}
                onDeleteAchievement={handleDeleteAchievement}
                totalUserXp={currentUser.xp}
              />
            )}

            {activePage === 'friends' && (
              <GamingFriendsPage
                suggestedGamers={suggestedGamers}
                onNavigate={(page) => setActivePage(page)}
                currentUserId={currentUser.id}
                currentUserName={currentUser.displayName}
                onOpenDirectMessage={async (participantId) => {
                  const targetGamer = suggestedGamers.find((g) => g.id === participantId);
                  if (targetGamer) {
                    const convId = await getOrCreateDirectConversation(currentUser, {
                      id: targetGamer.id,
                      displayName: targetGamer.name,
                      username: targetGamer.username,
                      avatarUrl: targetGamer.avatarUrl,
                      isOnline: true
                    });
                    setSelectedConversationId(convId);
                    setActivePage('messages');
                  }
                }}
              />
            )}

            {activePage === 'messages' && (
              <MessagesPage
                currentUser={currentUser}
                initialSelectedConvId={selectedConversationId}
                allTestAccounts={TEST_ACCOUNTS}
                onSwitchTestAccount={(testAcc) => setSimulatedTestUser(testAcc)}
                onNavigateToProfile={(username) => {
                  const found = suggestedGamers.find((g) => g.username === username);
                  if (found) {
                    setViewingProfile({
                      ...currentUser,
                      id: found.id,
                      displayName: found.name,
                      username: found.username,
                      avatarUrl: found.avatarUrl,
                      isVerified: found.isVerified
                    });
                    setActivePage('profile');
                  }
                }}
              />
            )}

            {activePage === 'explore' && (
              <ExploreGamesPage
                games={catalogGames}
                onNavigate={(page) => setActivePage(page)}
                currentUserId={currentUser.id}
                currentUserName={currentUser.displayName}
              />
            )}

            {activePage === 'notifications' && (
              <NotificationsPage
                currentUser={currentUser}
                onNavigate={(page) => setActivePage(page)}
                onSelectConversation={(convId) => {
                  setSelectedConversationId(convId);
                  setActivePage('messages');
                }}
              />
            )}

            {activePage === 'search' && (
              <SearchPage
                initialQuery={searchQuery}
                currentUser={currentUser}
                posts={visiblePosts}
                games={catalogGames}
                adventures={adventures}
                onNavigate={(page) => setActivePage(page)}
                onLikePost={handleLikePost}
                onCommentPost={() => {}}
              />
            )}

            {activePage === 'settings' && (
              <SettingsPage
                currentUser={currentUser}
                onNavigate={(page) => setActivePage(page)}
                onLogout={async () => {
                  await logout();
                  setGuestPreviewMode(false);
                  setActivePage('landing');
                }}
                onUpdateProfile={async (updated) => {
                  if (firebaseUser) {
                    await updateGamerProfile(updated);
                  }
                }}
              />
            )}

            {activePage === 'admin' && (
              <AdminDashboardPage
                currentUser={currentUser}
                onNavigate={(page) => setActivePage(page)}
                onDeletePost={handleDeletePost}
              />
            )}
          </main>
        </>
      )}

      {/* Global Auth Modal */}
      <AuthModal
        isOpen={authModal.isOpen}
        initialMode={authModal.mode}
        onClose={() => setAuthModal({ isOpen: false, mode: 'login' })}
        onLoginSuccess={() => {
          setActivePage('home');
        }}
      />

      {/* Global Report Content Modal */}
      <ReportContentModal
        isOpen={reportingModal.isOpen}
        onClose={() => setReportingModal({ ...reportingModal, isOpen: false })}
        targetId={reportingModal.targetId}
        targetType={reportingModal.targetType}
        targetName={reportingModal.targetName}
        targetContent={reportingModal.targetContent}
        currentUserId={currentUser.id}
        currentUsername={currentUser.username}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <GameOutApp />
    </AuthProvider>
  );
}
