import {
  GamerProfile,
  GamingPost,
  GamingExperience,
  GamingAdventure,
  GameAchievement,
  GamingTrend,
  SuggestedGamer,
  GameCatalogItem,
  NotificationItem,
  Conversation,
  FriendRequest,
  GamerCommunity
} from '../types';

export const CURRENT_USER: GamerProfile = {
  id: 'user_fatma',
  username: 'fatmabenz',
  displayName: 'Fatma Ben Zarrouk',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
  tagline: 'Play • Connect • Level Up 🎮',
  bio: 'Competitive Valorant initiator & strategic builder. Always striving for Radiant while exploring vast RPG worlds. Computer science enthusiast at IIT.',
  location: 'Sfax, Tunisia',
  schoolOrOrg: 'IIT',
  isVerified: true,
  level: 24,
  xp: 14400,
  xpToNextLevel: 20000,
  levelProgressPercentage: 72,
  followersCount: 1420,
  followingCount: 384,
  friendsCount: 186,
  platforms: ['PC', 'PlayStation 5'],
  favoriteGames: ['Valorant', 'Minecraft', 'Apex Legends', 'Cyberpunk 2077'],
  roles: ['Competitive Player', 'Team Captain', 'Builder / Architect'],
  joinedDate: 'March 2023',
  status: 'online',
  currentGame: 'Valorant (Competitive 5v5)',
  stats: {
    hoursLogged: 1840,
    achievementsUnlocked: 142,
    adventuresCompleted: 19,
    tournamentsWon: 5
  }
};

export const INITIAL_POSTS: GamingPost[] = [
  {
    id: 'post_1',
    author: {
      id: 'gameout_official',
      username: 'gameout',
      displayName: 'GameOut',
      avatarUrl: 'https://images.unsplash.com/photo-1612287233215-68b37494f6f8?auto=format&fit=crop&w=150&q=80',
      isVerified: true
    },
    content: 'The new update of Valorant is here! 🎯\nWhat do you think about the new agent?\n#Valorant #Update #Gaming',
    gameTag: 'Valorant',
    tags: ['Valorant', 'Update', 'Gaming'],
    timestamp: '2h • 🌐',
    mediaUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
    mediaType: 'custom_banner',
    badgeTitle: 'VALORANT PROTOCOL // REVELATION',
    reactions: {
      likes: 840,
      hearts: 260,
      fires: 120,
      userReaction: 'heart'
    },
    commentsCount: 342,
    sharesCount: 87,
    comments: [
      {
        id: 'c1',
        author: {
          id: 'user_alex',
          username: 'shadow_ninja',
          displayName: 'Alex Rivers',
          avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
          isVerified: false
        },
        content: 'The flash ability feels slightly overpowered on Bind, but overall great utility toolkit!',
        timestamp: '1h ago',
        likesCount: 18,
        isLiked: true
      },
      {
        id: 'c2',
        author: {
          id: 'user_sarah',
          username: 'valkyrie_aim',
          displayName: 'Sarah Vance',
          avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
          isVerified: true
        },
        content: 'Insta-locking in ranked tonight! Who wants to run a full 5-stack?',
        timestamp: '45m ago',
        likesCount: 31,
        isLiked: false
      }
    ],
    isSaved: true
  },
  {
    id: 'post_2',
    author: {
      id: 'progamer_99',
      username: 'progamer',
      displayName: 'ProGamer',
      avatarUrl: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=150&q=80',
      isVerified: false
    },
    content: 'Just reached Diamond in Ranked! 💎\nHard work pays off 💪',
    gameTag: 'Valorant',
    tags: ['Ranked', 'Diamond', 'Grind'],
    timestamp: '4h • 🌐',
    mediaUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    mediaType: 'achievement',
    badgeTitle: 'DIAMOND // RANK ACHIEVED',
    reactions: {
      likes: 512,
      hearts: 94,
      fires: 148,
      userReaction: 'like'
    },
    commentsCount: 46,
    sharesCount: 12,
    comments: [
      {
        id: 'c3',
        author: {
          id: 'user_fatma',
          username: 'fatmabenz',
          displayName: 'Fatma Ben Zarrouk',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
          isVerified: true
        },
        content: 'Huge congratulations! Welcome to the Diamond lobby, Ascendant is next!',
        timestamp: '2h ago',
        likesCount: 14,
        isLiked: true
      }
    ]
  },
  {
    id: 'post_3',
    author: {
      id: 'user_fatma',
      username: 'fatmabenz',
      displayName: 'Fatma Ben Zarrouk',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      isVerified: true
    },
    content: 'Completed the mega survival base on our private Minecraft realm after 42 in-game days! Designed an automated sorting hall with 120 chests. What do you think of the gothic cathedral style roof? 🏰⛏️',
    gameTag: 'Minecraft',
    tags: ['Minecraft', 'Building', 'MegaBase', 'Survival'],
    timestamp: '1d • 🌐',
    mediaUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80',
    mediaType: 'image',
    badgeTitle: 'MEGA BASE ARCHITECTURE // 42 DAYS LOGGED',
    reactions: {
      likes: 670,
      hearts: 430,
      fires: 98,
      userReaction: null
    },
    commentsCount: 52,
    sharesCount: 23,
    comments: []
  }
];

export const GAMING_TRENDS: GamingTrend[] = [
  {
    id: 'trend_1',
    rank: 1,
    title: 'Marvel Rivals',
    postCount: '312K posts',
    coverUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=100&q=80',
    category: 'Hero Shooter'
  },
  {
    id: 'trend_2',
    rank: 2,
    title: 'GTA VI',
    postCount: '287K posts',
    coverUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=100&q=80',
    category: 'Open World'
  },
  {
    id: 'trend_3',
    rank: 3,
    title: 'Minecraft 1.22',
    postCount: '245K posts',
    coverUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=100&q=80',
    category: 'Sandbox'
  },
  {
    id: 'trend_4',
    rank: 4,
    title: 'Roblox Updates',
    postCount: '210K posts',
    coverUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=100&q=80',
    category: 'Platform'
  },
  {
    id: 'trend_5',
    rank: 5,
    title: 'Fortnite Chapter 7',
    postCount: '190K posts',
    coverUrl: 'https://images.unsplash.com/photo-1589241062272-c0a000072dfa?auto=format&fit=crop&w=100&q=80',
    category: 'Battle Royale'
  }
];

export const SUGGESTED_GAMERS: (SuggestedGamer & {
  level: number;
  role: string;
  platform: string;
  location?: string;
  bio?: string;
})[] = [
  {
    id: 'gamer_zack',
    name: 'Zack Chrono',
    username: 'zackfps',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    isVerified: true,
    followersCount: '14.2K followers',
    isFollowing: false,
    primaryGame: 'Valorant',
    level: 28,
    role: 'Competitive Player',
    platform: 'PC',
    location: 'Berlin, Germany',
    mutualFriends: 12,
    bio: 'Peak Radiant #48. In-game leader. Looking for tactical squad mates for EU scrims.'
  },
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
    bio: 'Apex Predator & Movement Specialist. Controller on PC. Always pushing high ground.'
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
    bio: 'Full-time content creator & initiator main. Streaming competitive matches nightly!'
  },
  {
    id: 'user_elena',
    name: 'Elena Rostova',
    username: 'elena_builds',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
    isVerified: false,
    followersCount: '9.4K followers',
    isFollowing: false,
    primaryGame: 'Minecraft',
    level: 22,
    role: 'Builder / Architect',
    platform: 'PC',
    location: 'Prague, Czech Republic',
    mutualFriends: 6,
    bio: 'Survival SMP architect specializing in oriental and gothic mega-structures. Redstone enthusiast.'
  },
  {
    id: 'gamer_kai',
    name: 'Kai Takahashi',
    username: 'kai_cyber',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    isVerified: false,
    followersCount: '2.3K followers',
    isFollowing: false,
    primaryGame: 'Cyberpunk 2077',
    level: 16,
    role: 'Casual Player',
    platform: 'PlayStation 5',
    location: 'Tokyo, Japan',
    mutualFriends: 3,
    bio: 'Night City photographer & build theorycrafter. 100% achievements unlocked on PS5.'
  },
  {
    id: 'gamer_maya',
    name: 'Maya Lin',
    username: 'rivals_maya',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    isVerified: true,
    followersCount: '18.7K followers',
    isFollowing: false,
    primaryGame: 'Marvel Rivals',
    level: 12,
    role: 'Competitive Player',
    platform: 'PC',
    location: 'Seoul, South Korea',
    mutualFriends: 5,
    bio: 'Vanguard tank specialist. Former Overwatch semi-pro exploring Marvel Rivals meta.'
  },
  {
    id: 'gamer_dante',
    name: 'Dante Silva',
    username: 'dante_speed',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&q=80',
    isVerified: false,
    followersCount: '5.1K followers',
    isFollowing: false,
    primaryGame: 'Grand Theft Auto VI',
    level: 31,
    role: 'Content Creator',
    platform: 'PlayStation 5',
    location: 'Miami, Florida',
    mutualFriends: 9,
    bio: 'Countdown to Vice City 2025. Covering speedruns, vehicle physics and map breakdowns.'
  },
  {
    id: 'valorant_official',
    name: 'Valorant Official',
    username: 'valorant',
    avatarUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=120&q=80',
    isVerified: true,
    followersCount: '2.1M followers',
    isFollowing: false,
    primaryGame: 'Valorant',
    level: 100,
    role: 'Official Game',
    platform: 'PC',
    location: 'Los Angeles, CA',
    bio: 'Official GameOut page for Valorant by Riot Games. A 5v5 character-based tactical shooter.'
  },
  {
    id: 'minecraft_official',
    name: 'Minecraft',
    username: 'minecraft',
    avatarUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=120&q=80',
    isVerified: true,
    followersCount: '4.8M followers',
    isFollowing: false,
    primaryGame: 'Minecraft',
    level: 100,
    role: 'Official Game',
    platform: 'PC',
    location: 'Stockholm, Sweden',
    bio: 'Place blocks, go on adventures. Official Minecraft account.'
  }
];

export const GAMING_EXPERIENCES: GamingExperience[] = [
  {
    id: 'exp_1',
    userId: 'user_fatma',
    gameTitle: 'Valorant',
    gameCover: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=300&q=80',
    platform: 'PC',
    role: 'Competitive Player',
    gameMode: 'Competitive 5v5 Tactical Shooter',
    startDate: 'Jan 2022',
    isCurrentlyPlaying: true,
    hoursPlayed: 680,
    experienceLevel: 'Advanced',
    rank: 'Diamond 2 (Peak Ascendant 1)',
    description: 'Primary team initiator playing Sova & Fade. Specializing in lineup execution, retake reconnaissance, team comms coordination and economy management.',
    skills: ['Tactical Lineups', 'Team Comms', 'Clutch Decision Making', 'Crosshair Placement', 'In-Game Leadership'],
    achievements: ['Regional Tournament Top 4', '150+ Clutch Rounds', 'Clutch Master 2024']
  },
  {
    id: 'exp_2',
    userId: 'user_fatma',
    gameTitle: 'Minecraft',
    gameCover: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=300&q=80',
    platform: 'PC',
    role: 'Builder / Architect',
    gameMode: 'Survival Multiplayer (SMP) & Creative',
    startDate: 'Jun 2020',
    isCurrentlyPlaying: true,
    hoursPlayed: 520,
    experienceLevel: 'Master',
    rank: 'Lead Architect',
    description: 'Designed large-scale fantasy cities, automated redstone contraptions, and community hub spaces for an active 40-player survival realm.',
    skills: ['Gothic Architecture', 'Redstone Automation', 'Terraforming', 'Community Coordination'],
    achievements: ['Built 1,000,000 Block Citadel', 'Automated Mega Storage', 'Dragon Slayer x10']
  },
  {
    id: 'exp_3',
    userId: 'user_fatma',
    gameTitle: 'Apex Legends',
    gameCover: 'https://images.unsplash.com/photo-1552824722-ddab1374e622?auto=format&fit=crop&w=300&q=80',
    platform: 'PC',
    role: 'Competitive Player',
    gameMode: 'Ranked Battle Royale',
    startDate: 'Sep 2021',
    endDate: 'May 2023',
    isCurrentlyPlaying: false,
    hoursPlayed: 340,
    experienceLevel: 'Intermediate',
    rank: 'Platinum I',
    description: 'Rotated as Valkyrie and Catalyst. Mastered fast macro-rotations, high ground zoning, and 3v3 team wipe engagements.',
    skills: ['Fast Rotations', 'Spatial Awareness', 'High Ground Control'],
    achievements: ['2,500 Damage Hammer Badge', 'Triple Triple Badge']
  }
];

export const GAMING_ADVENTURES: GamingAdventure[] = [
  {
    id: 'adv_1',
    userId: 'user_fatma',
    title: 'North Africa Collegiate Valorant Cup Final Run',
    game: 'Valorant',
    description: 'Led team "Phoenix IIT" through a gruelling 16-team bracket. Fought back from a 3-11 deficit in the lower bracket semi-finals on Haven with an overtime 15-13 victory.',
    mediaUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=900&q=80',
    teamMembers: ['Fatma B. (Captain)', 'Karim T.', 'Yassine M.', 'Omar K.', 'Sami R.'],
    tournamentParticipation: 'Collegiate Esports Cup 2024',
    personalStory: 'After dropping Map 1 on Ascent, we regrouped, adjusted our defensive anchor positions, and executed flawless retakes. Winning that round 24 clutch will stay with me forever.',
    date: 'October 2024',
    tags: ['Esports', 'Tournament', 'Comeback', 'Clutch', 'Collegiate'],
    likesCount: 184,
    isLiked: true
  },
  {
    id: 'adv_2',
    userId: 'user_fatma',
    title: 'The Great SMP Aqueduct & Mountain Stronghold',
    game: 'Minecraft',
    description: 'A 3-month collaborative mega-build connecting two continents across 3,500 blocks of open ocean with a functional railway and hydraulic locks.',
    mediaUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=900&q=80',
    teamMembers: ['Fatma B.', 'CraftMaster99', 'Elise_V'],
    challengeCompletion: '100% Pure Vanilla Survival (No creative mode)',
    personalStory: 'Gathering over 80,000 smooth stone blocks in survival tested our patience, but seeing the sunset across the fully lit aqueduct made every single mining expedition worth it.',
    date: 'August 2024',
    tags: ['MegaBuild', 'Survival', 'SMP', 'Architecture'],
    likesCount: 226,
    isLiked: false
  }
];

export const GAME_ACHIEVEMENTS: GameAchievement[] = [
  {
    id: 'ach_1',
    userId: 'user_fatma',
    title: 'Ascendant Precision',
    description: 'Hit 35%+ headshot percentage across 20 consecutive competitive matches.',
    game: 'Valorant',
    icon: '🎯',
    rarity: 'Legendary',
    unlockDate: 'Nov 2024',
    xpReward: 1500,
    isUnlocked: true,
    isSelfReported: false
  },
  {
    id: 'ach_2',
    userId: 'user_fatma',
    title: 'Monumental Architect',
    description: 'Placed more than 500,000 blocks in survival mode projects.',
    game: 'Minecraft',
    icon: '🏛️',
    rarity: 'Epic',
    unlockDate: 'Oct 2024',
    xpReward: 850,
    isUnlocked: true,
    isSelfReported: true
  },
  {
    id: 'ach_3',
    userId: 'user_fatma',
    title: 'Clutch God',
    description: 'Won a 1v4 or 1v5 defuse round in official ranked overtime.',
    game: 'Valorant',
    icon: '⚡',
    rarity: 'Epic',
    unlockDate: 'Sep 2024',
    xpReward: 1000,
    isUnlocked: true,
    isSelfReported: false
  },
  {
    id: 'ach_4',
    userId: 'user_fatma',
    title: 'Master Tactician',
    description: 'Successfully led 50 competitive games as designated in-game leader (IGL).',
    game: 'Valorant',
    icon: '👑',
    rarity: 'Rare',
    unlockDate: 'Jul 2024',
    xpReward: 500,
    isUnlocked: true,
    isSelfReported: true
  },
  {
    id: 'ach_5',
    userId: 'user_fatma',
    title: 'Grandmaster Explorer',
    description: 'Discover every biome and structure in a 10,000x10,000 block seed.',
    game: 'Minecraft',
    icon: '🧭',
    rarity: 'Common',
    unlockDate: 'Jan 2024',
    xpReward: 250,
    isUnlocked: true,
    isSelfReported: true
  },
  {
    id: 'ach_6',
    userId: 'user_fatma',
    title: 'Radiant Contender',
    description: 'Reach top 500 leaderboard ranking in your regional competitive ladder.',
    game: 'Valorant',
    icon: '🌟',
    rarity: 'Legendary',
    unlockDate: 'In Progress',
    xpReward: 3000,
    isUnlocked: false,
    progressPercentage: 68
  }
];

export const CATALOG_GAMES: GameCatalogItem[] = [
  {
    id: 'game_valorant',
    title: 'Valorant',
    slug: 'valorant',
    coverUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=400&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
    description: 'A 5v5 character-based tactical shooter where precise gunplay meets unique agent abilities. Every round counts in this high-stakes competitive arena.',
    genre: 'Tactical Shooter / FPS',
    platforms: ['PC'],
    releaseYear: 2020,
    rating: 4.8,
    activePlayersCount: '18.4M Monthly',
    postsCount: '840K posts',
    communitiesCount: 1420,
    developer: 'Riot Games',
    publisher: 'Riot Games',
    popularityScore: 98,
    isPopular: true,
    isRecentlyAdded: false,
    categories: ['FPS', 'Tactical', 'Competitive', 'Esports'],
    topPlayers: [
      { name: 'Fatma Ben Zarrouk', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80', rank: 'Diamond 2' },
      { name: 'Tenz Fanatic', avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80', rank: 'Radiant #12' },
      { name: 'Valkyrie Aim', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80', rank: 'Ascendant 3' }
    ]
  },
  {
    id: 'game_minecraft',
    title: 'Minecraft',
    slug: 'minecraft',
    coverUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=400&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1200&q=80',
    description: 'The iconic open-world sandbox game where players gather resources, craft tools, build monumental creations, and conquer terrifying dimensions.',
    genre: 'Sandbox / Survival',
    platforms: ['PC', 'PlayStation 5', 'Xbox Series X/S', 'Nintendo Switch', 'Mobile'],
    releaseYear: 2011,
    rating: 4.9,
    activePlayersCount: '140M Monthly',
    postsCount: '1.2M posts',
    communitiesCount: 3800,
    developer: 'Mojang Studios',
    publisher: 'Xbox Game Studios',
    popularityScore: 99,
    isPopular: true,
    isRecentlyAdded: false,
    categories: ['Sandbox', 'Survival', 'Multiplayer', 'Creative'],
    topPlayers: [
      { name: 'Fatma Ben Zarrouk', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80', rank: 'Architect' },
      { name: 'CraftMaster99', avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=100&q=80', rank: 'Redstone Guru' },
      { name: 'Elena Rostova', avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80', rank: 'Master Builder' }
    ]
  },
  {
    id: 'game_marvel_rivals',
    title: 'Marvel Rivals',
    slug: 'marvel-rivals',
    coverUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=400&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80',
    description: 'Super Hero Team-Based PVP Shooter featuring an evolving all-star roster of Marvel superheroes and villains with destructible environments and team synergy powers.',
    genre: 'Hero Shooter',
    platforms: ['PC', 'PlayStation 5', 'Xbox Series X/S'],
    releaseYear: 2024,
    rating: 4.7,
    activePlayersCount: '9.2M Monthly',
    postsCount: '312K posts',
    communitiesCount: 650,
    developer: 'NetEase Games',
    publisher: 'Marvel Games',
    popularityScore: 95,
    isPopular: true,
    isRecentlyAdded: true,
    categories: ['Hero Shooter', 'PVP', 'Team-Based', 'Comic Book'],
    topPlayers: [
      { name: 'DrStrangeMain', avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=100&q=80', rank: 'Grandmaster' },
      { name: 'Maya Lin', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80', rank: 'Vanguard Ace' }
    ]
  },
  {
    id: 'game_gta6',
    title: 'Grand Theft Auto VI',
    slug: 'gta-vi',
    coverUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=400&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80',
    description: 'The upcoming open-world evolution set in the neon-soaked streets of Vice City and the sprawling state of Leonida. The next milestone in interactive entertainment.',
    genre: 'Action / Open World',
    platforms: ['PlayStation 5', 'Xbox Series X/S'],
    releaseYear: 2025,
    rating: 5.0,
    activePlayersCount: 'Anticipated 50M+',
    postsCount: '287K posts',
    communitiesCount: 1950,
    developer: 'Rockstar Games',
    publisher: 'Rockstar Games',
    popularityScore: 100,
    isPopular: true,
    isRecentlyAdded: true,
    categories: ['Open World', 'Action', 'Crime', 'Story Rich'],
    topPlayers: [
      { name: 'Dante Silva', avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=100&q=80', rank: 'Vice City Lead' }
    ]
  },
  {
    id: 'game_apex_legends',
    title: 'Apex Legends',
    slug: 'apex-legends',
    coverUrl: 'https://images.unsplash.com/photo-1552824722-ddab1374e622?auto=format&fit=crop&w=400&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1552824722-ddab1374e622?auto=format&fit=crop&w=1200&q=80',
    description: 'Master a growing roster of legendary characters with powerful abilities in a strategic squad-based battle royale shooter where movement and gunplay merge seamlessly.',
    genre: 'Hero Shooter',
    platforms: ['PC', 'PlayStation 5', 'Xbox Series X/S', 'Nintendo Switch'],
    releaseYear: 2019,
    rating: 4.6,
    activePlayersCount: '15.8M Monthly',
    postsCount: '520K posts',
    communitiesCount: 1120,
    developer: 'Respawn Entertainment',
    publisher: 'Electronic Arts',
    popularityScore: 92,
    isPopular: true,
    isRecentlyAdded: false,
    categories: ['Battle Royale', 'Hero Shooter', 'Fast Paced', 'Esports'],
    topPlayers: [
      { name: 'Alex Rivers', avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80', rank: 'Apex Predator' }
    ]
  },
  {
    id: 'game_cyberpunk',
    title: 'Cyberpunk 2077',
    slug: 'cyberpunk-2077',
    coverUrl: 'https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&w=400&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&w=1200&q=80',
    description: 'An open-world, action-adventure RPG set in the megalopolis of Night City, where you play as a cyberpunk mercenary wrapped up in a do-or-die fight for survival.',
    genre: 'Action / Open World',
    platforms: ['PC', 'PlayStation 5', 'Xbox Series X/S'],
    releaseYear: 2020,
    rating: 4.8,
    activePlayersCount: '6.4M Monthly',
    postsCount: '410K posts',
    communitiesCount: 880,
    developer: 'CD Projekt Red',
    publisher: 'CD Projekt',
    popularityScore: 90,
    isPopular: false,
    isRecentlyAdded: false,
    categories: ['RPG', 'Cyberpunk', 'Open World', 'Story Rich'],
    topPlayers: [
      { name: 'Kai Takahashi', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80', rank: 'Solo Merc' }
    ]
  }
];

export const INITIAL_COMMUNITIES: GamerCommunity[] = [
  {
    id: 'comm_valorant_protocol',
    name: 'Radiant Protocol Syndicate',
    gameTitle: 'Valorant',
    slug: 'radiant-protocol',
    description: 'Elite competitive scrimmage guild and tactical theorycrafting hub. Daily 5-stack ranked lobbies, vod review sessions, and tournament teams for Diamond+ players.',
    coverUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=400&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
    creatorId: 'gamer_zack',
    creatorName: 'Zack Chrono',
    creatorAvatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    membersCount: 1420,
    isJoined: true,
    category: 'Competitive Esports',
    tags: ['Scrims', 'Ranked', 'Tournament', 'Tactics'],
    rules: [
      'Positive mental attitude in all competitive scrims',
      'Microphone communication mandatory for rated queues',
      'No toxic flame or rage quitting in team brackets'
    ],
    leadModerators: ['Zack Chrono (@zackfps)', 'Fatma Ben Zarrouk (@fatmabenz)'],
    discordUrl: 'https://discord.gg/radiantprotocol',
    voiceChannelActive: true,
    createdAt: 'Jan 2024'
  },
  {
    id: 'comm_minecraft_architects',
    name: 'Monumental Redstone & Builders',
    gameTitle: 'Minecraft',
    slug: 'minecraft-architects',
    description: 'Collaborative architectural guild dedicated to pure survival mega-builds, redstone automation computers, and community realm adventures.',
    coverUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=400&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1200&q=80',
    creatorId: 'user_fatma',
    creatorName: 'Fatma Ben Zarrouk',
    creatorAvatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    membersCount: 2380,
    isJoined: true,
    category: 'Creative & Sandbox',
    tags: ['MegaBase', 'Redstone', 'Survival SMP', 'Schematics'],
    rules: [
      'Credit builders when utilizing collaborative schematics',
      'No griefing or unauthorized redstone overclocking on realms',
      'Share tutorials and progress screenshots freely'
    ],
    leadModerators: ['Fatma Ben Zarrouk (@fatmabenz)', 'Elena Rostova (@elena_builds)'],
    discordUrl: 'https://discord.gg/monumentalbuilders',
    voiceChannelActive: true,
    createdAt: 'Feb 2024'
  },
  {
    id: 'comm_gta6_vicecity',
    name: 'Vice City 2025 Syndicate',
    gameTitle: 'Grand Theft Auto VI',
    slug: 'vice-city-2025',
    description: 'The premier community headquarters preparing for GTA VI launch. Mapping breakdowns, vehicle dynamics analysis, and launch day crew recruitment.',
    coverUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=400&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80',
    creatorId: 'gamer_dante',
    creatorName: 'Dante Silva',
    creatorAvatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&q=80',
    membersCount: 3950,
    isJoined: false,
    category: 'Open World & Crews',
    tags: ['Leonida', 'ViceCity', 'CrewRecruit', 'Heists'],
    rules: [
      'Respect copyright and official Rockstar guidelines',
      'Tag all speculative map theories with #Speculation',
      'No leaked personal data or illegal software mods'
    ],
    leadModerators: ['Dante Silva (@dante_speed)'],
    discordUrl: 'https://discord.gg/vicecity2025',
    voiceChannelActive: false,
    createdAt: 'March 2024'
  },
  {
    id: 'comm_marvel_rivals',
    name: 'Multiverse Vanguard Squad',
    gameTitle: 'Marvel Rivals',
    slug: 'multiverse-vanguard',
    description: 'Fast-paced squad building for hero shooter tacticians. Team synergies, Vanguard/Duelist/Strategist combos, and seasonal tournament brackets.',
    coverUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=400&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80',
    creatorId: 'gamer_maya',
    creatorName: 'Maya Lin',
    creatorAvatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    membersCount: 890,
    isJoined: false,
    category: 'Hero Shooter',
    tags: ['HeroShooter', 'TeamSynergy', 'Ranked', 'Marvel'],
    rules: [
      'Flex picks encouraged for balanced team compositions',
      'Constructive feedback only after competitive scrims'
    ],
    leadModerators: ['Maya Lin (@rivals_maya)'],
    discordUrl: 'https://discord.gg/marvelrivals',
    voiceChannelActive: true,
    createdAt: 'Apr 2024'
  }
];

export const INITIAL_FRIEND_REQUESTS: FriendRequest[] = [
  {
    id: 'req_1',
    senderId: 'gamer_zack',
    senderName: 'Zack Chrono',
    senderUsername: 'zackfps',
    senderAvatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    senderLevel: 28,
    senderGame: 'Valorant',
    receiverId: 'user_fatma',
    status: 'pending',
    note: 'Saw your Ascent clutch clip! Looking for a reliable initiator for our tournament 5-stack.',
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
    receiverId: 'user_fatma',
    status: 'pending',
    note: 'Would love to collaborate on the cathedral project on your SMP realm.',
    gameTag: 'Minecraft',
    createdAt: '1 day ago'
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    type: 'like',
    actor: {
      name: 'Sarah Vance',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80'
    },
    content: 'liked your Minecraft mega base post: "Completed the mega survival base..."',
    timestamp: '15m ago',
    isRead: false
  },
  {
    id: 'n2',
    type: 'comment',
    actor: {
      name: 'Alex Rivers',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'
    },
    content: 'commented: "That gothic roofline is insane! How did you handle lighting inside?"',
    timestamp: '1h ago',
    isRead: false
  },
  {
    id: 'n3',
    type: 'friend_request',
    actor: {
      name: 'Zack Chrono',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80'
    },
    content: 'sent you a Gaming Friend request to squad up for Valorant Ranked.',
    timestamp: '3h ago',
    isRead: false
  },
  {
    id: 'n4',
    type: 'achievement',
    actor: {
      name: 'GameOut System',
      avatarUrl: 'https://images.unsplash.com/photo-1612287233215-68b37494f6f8?auto=format&fit=crop&w=100&q=80'
    },
    content: 'Unlocked Legendary Trophy: "Ascendant Precision" (+1,500 XP)!',
    timestamp: 'Yesterday',
    isRead: true
  },
  {
    id: 'n5',
    type: 'follow',
    actor: {
      name: 'Apex Predator Guild',
      avatarUrl: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=100&q=80'
    },
    content: 'started following your gaming journey.',
    timestamp: '2d ago',
    isRead: true
  }
];

export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv_1',
    participant: {
      id: 'user_alex',
      displayName: 'Alex Rivers',
      username: 'shadow_ninja',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      isOnline: true
    },
    lastMessage: 'Are we queuing 5-stack ranked at 8 PM tonight?',
    lastMessageTime: '7:42 PM',
    unreadCount: 2,
    messages: [
      {
        id: 'm1',
        conversationId: 'conv_1',
        senderId: 'user_alex',
        text: 'Hey Fatma! Saw your recent Diamond promotion clutch post!',
        timestamp: '7:30 PM',
        isRead: true
      },
      {
        id: 'm2',
        conversationId: 'conv_1',
        senderId: 'user_fatma',
        text: 'Thanks Alex! We had to grind hard for that Haven overtime win.',
        timestamp: '7:35 PM',
        isRead: true
      },
      {
        id: 'm3',
        conversationId: 'conv_1',
        senderId: 'user_alex',
        text: 'Are we queuing 5-stack ranked at 8 PM tonight?',
        timestamp: '7:42 PM',
        isRead: false
      }
    ]
  },
  {
    id: 'conv_2',
    participant: {
      id: 'user_sarah',
      displayName: 'Sarah Vance',
      username: 'valkyrie_aim',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
      isOnline: false,
      lastActive: '30m ago'
    },
    lastMessage: 'I saved your Sova lineup screenshot for Haven A-site!',
    lastMessageTime: '4:15 PM',
    unreadCount: 1,
    messages: [
      {
        id: 'm4',
        conversationId: 'conv_2',
        senderId: 'user_sarah',
        text: 'I saved your Sova lineup screenshot for Haven A-site!',
        timestamp: '4:15 PM',
        isRead: false
      }
    ]
  },
  {
    id: 'conv_3',
    participant: {
      id: 'progamer_99',
      displayName: 'ProGamer',
      username: 'progamer',
      avatarUrl: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=150&q=80',
      isOnline: true
    },
    lastMessage: 'GGs on the tournament run! Well played.',
    lastMessageTime: 'Yesterday',
    unreadCount: 0,
    messages: [
      {
        id: 'm5',
        conversationId: 'conv_3',
        senderId: 'progamer_99',
        text: 'GGs on the tournament run! Well played.',
        timestamp: 'Yesterday',
        isRead: true
      }
    ]
  }
];
