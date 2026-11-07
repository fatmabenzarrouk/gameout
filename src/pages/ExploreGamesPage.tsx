import React, { useState } from 'react';
import {
  Gamepad2,
  Search,
  Star,
  Users,
  Flame,
  Filter,
  CheckCircle2,
  ExternalLink,
  X,
  Plus,
  Sparkles,
  Monitor,
  Calendar,
  Building,
  TrendingUp,
  Shield,
  Layers,
  Radio,
  UserCheck,
  UserPlus,
  MessageSquare,
  Zap,
  ArrowRight
} from 'lucide-react';
import { GameCatalogItem, Platform, ActivePage, GamerCommunity } from '../types';
import { INITIAL_COMMUNITIES } from '../services/mockData';
import { toggleJoinCommunity, saveCommunity } from '../services/socialService';

interface ExploreGamesPageProps {
  games: GameCatalogItem[];
  onNavigate: (page: ActivePage) => void;
  onSelectGame?: (gameTitle: string) => void;
  currentUserId?: string;
  currentUserName?: string;
}

export const ExploreGamesPage: React.FC<ExploreGamesPageProps> = ({
  games,
  onNavigate,
  onSelectGame,
  currentUserId = 'user_fatma',
  currentUserName = 'Fatma Ben Zarrouk'
}) => {
  // Navigation sub-tab: Games Catalog vs Gaming Communities
  const [activeTab, setActiveTab] = useState<'games' | 'communities'>('games');

  // Search & filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedPlatform, setSelectedPlatform] = useState('All');
  const [catalogSection, setCatalogSection] = useState<'all' | 'popular' | 'recent'>('all');

  // Game details modal
  const [selectedGameModal, setSelectedGameModal] = useState<GameCatalogItem | null>(null);

  // Communities state
  const [communities, setCommunities] = useState<GamerCommunity[]>(INITIAL_COMMUNITIES);
  const [communityFilterGame, setCommunityFilterGame] = useState('All');
  const [communitySearch, setCommunitySearch] = useState('');

  // Create Community Modal
  const [showCreateCommunityModal, setShowCreateCommunityModal] = useState(false);
  const [newCommName, setNewCommName] = useState('');
  const [newCommGame, setNewCommGame] = useState('Valorant');
  const [newCommDesc, setNewCommDesc] = useState('');
  const [newCommCategory, setNewCommCategory] = useState('Competitive Esports');
  const [newCommDiscord, setNewCommDiscord] = useState('');
  const [newCommRule1, setNewCommRule1] = useState('Respect all squad members');

  // Feedback toast
  const [actionToast, setActionToast] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setActionToast(msg);
    setTimeout(() => setActionToast(null), 3500);
  };

  const genres = [
    'All',
    'Tactical Shooter / FPS',
    'Sandbox / Survival',
    'Hero Shooter',
    'Action / Open World'
  ];

  const platformsList = ['All', 'PC', 'PlayStation 5', 'Xbox Series X/S', 'Nintendo Switch', 'Mobile'];

  // Toggle join/leave community
  const handleToggleCommunityJoin = async (comm: GamerCommunity) => {
    const isJoined = Boolean(comm.isJoined);
    const updatedMembers = isJoined ? Math.max(1, comm.membersCount - 1) : comm.membersCount + 1;

    setCommunities((prev) =>
      prev.map((c) =>
        c.id === comm.id ? { ...c, isJoined: !isJoined, membersCount: updatedMembers } : c
      )
    );

    triggerToast(
      isJoined ? `Left ${comm.name}` : `Joined ${comm.name}! Welcome to the guild.`
    );

    try {
      await toggleJoinCommunity(comm.id, isJoined, comm.membersCount);
    } catch (e) {
      console.error(e);
    }
  };

  // Create new Community
  const handleCreateCommunitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommName.trim()) return;

    const newCommunity: GamerCommunity = {
      id: `comm_${Date.now()}`,
      name: newCommName.trim(),
      gameTitle: newCommGame,
      slug: newCommName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      description: newCommDesc.trim() || 'A community for competitive gamers and squad building.',
      coverUrl:
        'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=400&q=80',
      bannerUrl:
        'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
      creatorId: currentUserId,
      creatorName: currentUserName,
      creatorAvatarUrl:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      membersCount: 1,
      isJoined: true,
      category: newCommCategory,
      tags: [newCommGame, 'Squad', 'Guild'],
      rules: [newCommRule1],
      leadModerators: [`${currentUserName} (Founder)`],
      discordUrl: newCommDiscord.trim() || undefined,
      voiceChannelActive: false,
      createdAt: 'Just now'
    };

    setCommunities([newCommunity, ...communities]);
    setShowCreateCommunityModal(false);
    setNewCommName('');
    setNewCommDesc('');
    triggerToast(`Created "${newCommunity.name}"! You are the Guild Leader.`);

    try {
      await saveCommunity(newCommunity);
    } catch (e) {
      console.error(e);
    }
  };

  // Filter games catalog
  const filteredGames = games.filter((game) => {
    const matchesSearch =
      game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (game.developer && game.developer.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesGenre = selectedGenre === 'All' || game.genre === selectedGenre;

    const matchesPlatform =
      selectedPlatform === 'All' ||
      game.platforms.includes(selectedPlatform as Platform);

    const matchesSection =
      catalogSection === 'all'
        ? true
        : catalogSection === 'popular'
        ? game.isPopular
        : catalogSection === 'recent'
        ? game.isRecentlyAdded
        : true;

    return matchesSearch && matchesGenre && matchesPlatform && matchesSection;
  });

  // Filter communities
  const filteredCommunities = communities.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(communitySearch.toLowerCase()) ||
      c.description.toLowerCase().includes(communitySearch.toLowerCase()) ||
      c.gameTitle.toLowerCase().includes(communitySearch.toLowerCase());

    const matchesGame =
      communityFilterGame === 'All' || c.gameTitle === communityFilterGame;

    return matchesSearch && matchesGame;
  });

  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Toast Alert */}
      {actionToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#10234A] text-white px-5 py-3 rounded-2xl shadow-2xl border border-cyan-400 flex items-center gap-3 glitch-box">
          <Zap className="w-4 h-4 text-cyan-300 animate-pulse" />
          <span className="text-xs font-bold font-mono tracking-tight">{actionToast}</span>
        </div>
      )}

      {/* Hero Header Banner */}
      <div className="bg-white rounded-3xl border border-[#E4E9F2] p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-cyan-500/10 via-magenta-500/5 to-transparent pointer-events-none rounded-tr-3xl" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EEF4FE] text-[#1768DF] text-xs font-bold mb-2.5 border border-blue-100">
              <Gamepad2 className="w-3.5 h-3.5 text-cyan-600" />
              <span className="font-mono text-[11px] tracking-wider uppercase">
                Video Game Database & Guild Hub
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#10234A] tracking-tight flex items-center gap-2">
              <span>Explore Games & Communities</span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-[#10234A] text-cyan-300">
                ACTIVE V5
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-[#697386] mt-1 max-w-2xl leading-relaxed">
              Discover verified game profiles, developer studios, and active player bases. Find communities and clans centered around your favorite competitive titles.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start lg:self-center">
            {activeTab === 'communities' && (
              <button
                onClick={() => setShowCreateCommunityModal(true)}
                className="px-4 py-2.5 bg-[#1768DF] hover:bg-[#1255be] text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create Clan / Community</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="mt-8 pt-4 border-t border-[#E4E9F2] flex items-center gap-2">
          <button
            onClick={() => setActiveTab('games')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'games'
                ? 'bg-[#10234A] text-white shadow-xs'
                : 'bg-[#F4F6FC] text-[#697386] hover:bg-[#EEF4FE] hover:text-[#1768DF]'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>Games Catalog ({games.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('communities')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'communities'
                ? 'bg-[#10234A] text-white shadow-xs'
                : 'bg-[#F4F6FC] text-[#697386] hover:bg-[#EEF4FE] hover:text-[#1768DF]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Game Communities & Guilds ({communities.length})</span>
          </button>
        </div>
      </div>

      {/* ================= TAB 1: GAMES CATALOG (MODULE C) ================= */}
      {activeTab === 'games' && (
        <div className="space-y-6">
          {/* Search and Filters Bar */}
          <div className="bg-white rounded-3xl border border-[#E4E9F2] p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* Search input */}
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-[#697386]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by game title, genre, developer, or publisher..."
                  className="w-full pl-10 pr-4 py-3 bg-[#F4F6FC] rounded-2xl text-xs text-[#172033] border border-[#E4E9F2] focus:border-[#1768DF] focus:outline-hidden"
                />
              </div>

              {/* Platform selector */}
              <div className="w-full sm:w-48">
                <select
                  value={selectedPlatform}
                  onChange={(e) => setSelectedPlatform(e.target.value)}
                  className="w-full p-3 bg-[#F4F6FC] border border-[#E4E9F2] rounded-2xl text-xs text-[#172033] focus:border-[#1768DF] focus:outline-hidden"
                >
                  {platformsList.map((p) => (
                    <option key={p} value={p}>
                      {p === 'All' ? 'All Platforms' : p}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Categories & Catalog section tabs */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1 border-t border-[#E4E9F2]">
              {/* Category buttons */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
                {genres.map((g) => (
                  <button
                    key={g}
                    onClick={() => setSelectedGenre(g)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      selectedGenre === g
                        ? 'bg-[#1768DF] text-white shadow-xs'
                        : 'bg-[#F4F6FC] text-[#697386] hover:bg-[#EEF4FE]'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>

              {/* Sections: All vs Popular vs Recently Added */}
              <div className="flex items-center gap-1 bg-[#F4F6FC] p-1 rounded-xl self-start md:self-auto">
                <button
                  onClick={() => setCatalogSection('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    catalogSection === 'all'
                      ? 'bg-white text-[#10234A] shadow-xs'
                      : 'text-[#697386] hover:text-[#1768DF]'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setCatalogSection('popular')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    catalogSection === 'popular'
                      ? 'bg-white text-[#1768DF] shadow-xs'
                      : 'text-[#697386] hover:text-[#1768DF]'
                  }`}
                >
                  <Flame className="w-3 h-3 text-amber-500" />
                  <span>Popular</span>
                </button>
                <button
                  onClick={() => setCatalogSection('recent')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    catalogSection === 'recent'
                      ? 'bg-white text-[#1768DF] shadow-xs'
                      : 'text-[#697386] hover:text-[#1768DF]'
                  }`}
                >
                  <Sparkles className="w-3 h-3 text-cyan-500" />
                  <span>Recently Added</span>
                </button>
              </div>
            </div>
          </div>

          {/* Games Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGames.map((game) => (
              <div
                key={game.id}
                onClick={() => setSelectedGameModal(game)}
                className="bg-white rounded-3xl border border-[#E4E9F2] overflow-hidden shadow-xs hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  {/* Cinematic banner with badges */}
                  <div className="h-48 w-full bg-slate-900 relative overflow-hidden">
                    <img
                      src={game.bannerUrl}
                      alt={game.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

                    {/* Top tags */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <span className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-white border border-white/20">
                        {game.genre}
                      </span>
                      {game.popularityScore && (
                        <span className="bg-cyan-500/90 text-white font-mono font-bold text-[10px] px-2 py-0.5 rounded-md">
                          {game.popularityScore}% POPULARITY
                        </span>
                      )}
                    </div>

                    {/* Bottom title */}
                    <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between text-white">
                      <div>
                        <h2 className="text-xl font-black drop-shadow-sm leading-tight">{game.title}</h2>
                        <span className="text-[11px] text-white/80">
                          {game.developer || 'Publisher Tracked'} • {game.releaseYear}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 bg-amber-500/90 text-white px-2 py-0.5 rounded-lg text-xs font-bold shadow-xs">
                        <Star className="w-3 h-3 fill-current" />
                        <span>{game.rating}</span>
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3.5">
                    <p className="text-xs text-[#697386] line-clamp-2 leading-relaxed">
                      {game.description}
                    </p>

                    {/* Platforms list */}
                    <div className="flex flex-wrap gap-1.5">
                      {game.platforms.map((p) => (
                        <span
                          key={p}
                          className="px-2.5 py-0.5 rounded-lg bg-[#F4F6FC] text-[#172033] text-[10px] font-semibold border border-[#E4E9F2]"
                        >
                          {p}
                        </span>
                      ))}
                    </div>

                    {/* Top Players playing right now */}
                    {game.topPlayers && game.topPlayers.length > 0 && (
                      <div className="pt-2 border-t border-[#E4E9F2]">
                        <div className="text-[10px] font-bold text-[#697386] uppercase tracking-wider mb-2">
                          Tracked GameOut Players:
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center -space-x-2">
                            {game.topPlayers.map((tp, idx) => (
                              <img
                                key={idx}
                                src={tp.avatarUrl}
                                alt={tp.name}
                                title={`${tp.name} (${tp.rank})`}
                                className="w-7 h-7 rounded-full object-cover ring-2 ring-white shadow-xs"
                              />
                            ))}
                          </div>
                          <span className="text-xs font-mono font-bold text-[#1768DF]">
                            {game.activePlayersCount}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer bar */}
                <div className="px-5 py-3.5 bg-[#F9FAFD] border-t border-[#E4E9F2] flex items-center justify-between text-xs font-bold">
                  <span className="text-[#1768DF]">{game.communitiesCount} Guilds / Clans</span>
                  <span className="text-[#10234A] group-hover:text-[#1768DF] flex items-center gap-1 transition-colors">
                    <span>Inspect Hub</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 2: GAME COMMUNITIES & GUILDS (MODULE D) ================= */}
      {activeTab === 'communities' && (
        <div className="space-y-6">
          {/* Community Filter & Search */}
          <div className="bg-white rounded-3xl border border-[#E4E9F2] p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-[#697386]" />
              <input
                type="text"
                value={communitySearch}
                onChange={(e) => setCommunitySearch(e.target.value)}
                placeholder="Search communities, clans, or gaming guilds..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#F4F6FC] rounded-2xl text-xs text-[#172033] border border-[#E4E9F2] focus:border-[#1768DF] focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={communityFilterGame}
                onChange={(e) => setCommunityFilterGame(e.target.value)}
                className="p-2.5 bg-[#F4F6FC] border border-[#E4E9F2] rounded-xl text-xs text-[#172033] focus:border-[#1768DF] focus:outline-hidden"
              >
                <option value="All">All Games</option>
                <option value="Valorant">Valorant</option>
                <option value="Minecraft">Minecraft</option>
                <option value="Grand Theft Auto VI">Grand Theft Auto VI</option>
                <option value="Marvel Rivals">Marvel Rivals</option>
              </select>
            </div>
          </div>

          {/* Communities Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCommunities.map((comm) => (
              <div
                key={comm.id}
                className="bg-white rounded-3xl border border-[#E4E9F2] overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Banner */}
                  <div className="h-32 w-full bg-slate-900 relative">
                    <img
                      src={comm.bannerUrl}
                      alt={comm.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-0.5 rounded-full text-[10px] font-bold text-white border border-white/20">
                      {comm.gameTitle}
                    </div>
                    {comm.voiceChannelActive && (
                      <div className="absolute top-3 right-3 bg-emerald-500/90 text-white px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-xs">
                        <Radio className="w-3 h-3 animate-pulse" />
                        <span>Voice Party Active</span>
                      </div>
                    )}
                  </div>

                  {/* Info Header */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base font-black text-[#10234A]">{comm.name}</h3>
                        <span className="text-xs text-[#1768DF] font-semibold">{comm.category}</span>
                      </div>

                      <button
                        onClick={() => handleToggleCommunityJoin(comm)}
                        className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          comm.isJoined
                            ? 'bg-[#EEF4FE] text-[#1768DF] border border-blue-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200'
                            : 'bg-[#1768DF] hover:bg-[#1255be] text-white shadow-xs'
                        }`}
                      >
                        {comm.isJoined ? (
                          <>
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Joined</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Join Guild</span>
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-xs text-[#697386] leading-relaxed line-clamp-2">
                      {comm.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {comm.tags.map((t) => (
                        <span
                          key={t}
                          className="px-2 py-0.5 rounded-md bg-[#F4F6FC] text-[#697386] text-[10px] font-semibold"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>

                    {/* Community Rules */}
                    {comm.rules && comm.rules.length > 0 && (
                      <div className="bg-[#F8FAFD] p-3 rounded-2xl border border-[#E4E9F2] text-[11px] text-[#475569] space-y-1">
                        <div className="font-bold text-[#10234A] flex items-center gap-1">
                          <Shield className="w-3 h-3 text-[#1768DF]" />
                          <span>Guild Rules:</span>
                        </div>
                        <ul className="list-disc pl-4 space-y-0.5">
                          {comm.rules.slice(0, 2).map((r, i) => (
                            <li key={i}>{r}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer metadata */}
                <div className="px-5 py-3.5 bg-[#F9FAFD] border-t border-[#E4E9F2] flex items-center justify-between text-xs text-[#697386]">
                  <span className="font-mono font-bold text-[#10234A]">
                    👥 {comm.membersCount.toLocaleString()} Members
                  </span>
                  <div className="flex items-center gap-2">
                    {comm.discordUrl && (
                      <a
                        href={comm.discordUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#1768DF] font-bold hover:underline flex items-center gap-1"
                      >
                        <span>Discord</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= GAME DETAILS MODAL (MODULE C) ================= */}
      {selectedGameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-[#E4E9F2] overflow-hidden flex flex-col max-h-[92vh]">
            {/* Cinematic Banner */}
            <div className="relative h-64 w-full bg-slate-900">
              <img
                src={selectedGameModal.bannerUrl}
                alt={selectedGameModal.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
              <button
                onClick={() => setSelectedGameModal(null)}
                className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-black text-white rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-4 left-6 right-6 text-white">
                <span className="px-3 py-0.5 rounded-full bg-[#1768DF] text-xs font-bold">
                  {selectedGameModal.genre}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black mt-1 leading-tight">
                  {selectedGameModal.title}
                </h2>
                <p className="text-xs text-white/80 mt-0.5">
                  Developed by {selectedGameModal.developer || 'Featured Studio'} • Released {selectedGameModal.releaseYear}
                </p>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <h3 className="font-bold text-sm text-[#10234A] mb-1">Game Overview</h3>
                <p className="text-xs text-[#697386] leading-relaxed">
                  {selectedGameModal.description}
                </p>
              </div>

              {/* Hardware Platforms */}
              <div>
                <h4 className="font-bold text-xs text-[#10234A] mb-1.5">Supported Hardware</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedGameModal.platforms.map((p) => (
                    <span
                      key={p}
                      className="px-2.5 py-1 rounded-lg bg-[#F4F6FC] text-[#10234A] text-xs font-semibold border border-[#E4E9F2]"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="bg-[#F8FAFD] p-3 rounded-2xl border border-[#E4E9F2] text-center">
                  <span className="font-bold text-[11px] text-[#697386] uppercase block">Rating</span>
                  <span className="text-base font-black text-[#10234A] flex items-center justify-center gap-1 mt-0.5">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>{selectedGameModal.rating} / 5</span>
                  </span>
                </div>
                <div className="bg-[#F8FAFD] p-3 rounded-2xl border border-[#E4E9F2] text-center">
                  <span className="font-bold text-[11px] text-[#697386] uppercase block">Active Player Base</span>
                  <span className="text-sm font-black text-[#1768DF] mt-1 block">
                    {selectedGameModal.activePlayersCount}
                  </span>
                </div>
                <div className="bg-[#F8FAFD] p-3 rounded-2xl border border-[#E4E9F2] text-center">
                  <span className="font-bold text-[11px] text-[#697386] uppercase block">Guilds Tracked</span>
                  <span className="text-base font-black text-[#10234A] mt-0.5 block">
                    {selectedGameModal.communitiesCount}
                  </span>
                </div>
              </div>

              {/* Players Who Play This Game (Module C) */}
              {selectedGameModal.topPlayers && selectedGameModal.topPlayers.length > 0 && (
                <div className="pt-2">
                  <h4 className="font-bold text-xs text-[#10234A] mb-2">
                    Top GameOut Players in {selectedGameModal.title}
                  </h4>
                  <div className="space-y-2">
                    {selectedGameModal.topPlayers.map((player, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 bg-[#F8FAFD] rounded-xl border border-[#E4E9F2] flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2.5">
                          <img
                            src={player.avatarUrl}
                            alt={player.name}
                            className="w-8 h-8 rounded-full object-cover ring-2 ring-white"
                          />
                          <div>
                            <span className="font-bold text-xs text-[#10234A] block">{player.name}</span>
                            <span className="text-[10px] text-[#1768DF] font-semibold">{player.rank}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setSelectedGameModal(null);
                            onNavigate('friends');
                          }}
                          className="px-3 py-1 bg-[#EEF4FE] hover:bg-blue-100 text-[#1768DF] text-xs font-bold rounded-lg cursor-pointer"
                        >
                          View Profile
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Modal Action Buttons */}
              <div className="pt-4 border-t border-[#E4E9F2] flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  onClick={() => {
                    setSelectedGameModal(null);
                    onNavigate('experience');
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 bg-[#EEF4FE] hover:bg-[#E0ECFD] text-[#1768DF] text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add to My Gaming Experience</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedGameModal(null);
                    onNavigate('home');
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 bg-[#1768DF] hover:bg-[#1255be] text-white text-xs font-bold rounded-xl cursor-pointer text-center"
                >
                  Explore Community Feed
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= CREATE COMMUNITY / CLAN MODAL (MODULE D) ================= */}
      {showCreateCommunityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-[#E4E9F2] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#1768DF]" />
                <h3 className="font-bold text-base text-[#10234A]">Create Gaming Clan / Community</h3>
              </div>
              <button
                onClick={() => setShowCreateCommunityModal(false)}
                className="p-1.5 text-[#697386] hover:bg-slate-100 rounded-full cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCommunitySubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#10234A] mb-1">Guild / Community Name</label>
                <input
                  type="text"
                  required
                  value={newCommName}
                  onChange={(e) => setNewCommName(e.target.value)}
                  placeholder="e.g. Apex Predators Syndicate"
                  className="w-full p-2.5 bg-[#F4F6FC] border border-[#E4E9F2] rounded-xl text-xs text-[#172033] focus:border-[#1768DF] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#10234A] mb-1">Affiliated Game Title</label>
                  <select
                    value={newCommGame}
                    onChange={(e) => setNewCommGame(e.target.value)}
                    className="w-full p-2.5 bg-[#F4F6FC] border border-[#E4E9F2] rounded-xl text-xs text-[#172033] focus:border-[#1768DF] focus:outline-hidden"
                  >
                    <option value="Valorant">Valorant</option>
                    <option value="Minecraft">Minecraft</option>
                    <option value="Marvel Rivals">Marvel Rivals</option>
                    <option value="Grand Theft Auto VI">Grand Theft Auto VI</option>
                    <option value="Apex Legends">Apex Legends</option>
                    <option value="Cyberpunk 2077">Cyberpunk 2077</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#10234A] mb-1">Category</label>
                  <select
                    value={newCommCategory}
                    onChange={(e) => setNewCommCategory(e.target.value)}
                    className="w-full p-2.5 bg-[#F4F6FC] border border-[#E4E9F2] rounded-xl text-xs text-[#172033] focus:border-[#1768DF] focus:outline-hidden"
                  >
                    <option value="Competitive Esports">Competitive Esports</option>
                    <option value="Creative & Sandbox">Creative & Sandbox</option>
                    <option value="Casual & Social">Casual & Social</option>
                    <option value="Content Creators & Streamers">Content Creators</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#10234A] mb-1">Guild Mission / Description</label>
                <textarea
                  value={newCommDesc}
                  onChange={(e) => setNewCommDesc(e.target.value)}
                  placeholder="What is the objective of this guild? Squad queues, scrim schedules, realm building..."
                  rows={2}
                  className="w-full p-2.5 bg-[#F4F6FC] border border-[#E4E9F2] rounded-xl text-xs text-[#172033] focus:border-[#1768DF] focus:outline-hidden resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#10234A] mb-1">Primary Community Rule</label>
                <input
                  type="text"
                  value={newCommRule1}
                  onChange={(e) => setNewCommRule1(e.target.value)}
                  placeholder="e.g. Microphone mandatory for rated queues"
                  className="w-full p-2.5 bg-[#F4F6FC] border border-[#E4E9F2] rounded-xl text-xs text-[#172033] focus:border-[#1768DF] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#10234A] mb-1">Discord Invite URL (Optional)</label>
                <input
                  type="text"
                  value={newCommDiscord}
                  onChange={(e) => setNewCommDiscord(e.target.value)}
                  placeholder="https://discord.gg/..."
                  className="w-full p-2.5 bg-[#F4F6FC] border border-[#E4E9F2] rounded-xl text-xs text-[#172033] focus:border-[#1768DF] focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E4E9F2]">
                <button
                  type="button"
                  onClick={() => setShowCreateCommunityModal(false)}
                  className="px-4 py-2 bg-[#F4F6FC] hover:bg-slate-200 text-[#697386] text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1768DF] hover:bg-[#1255be] text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs"
                >
                  Create & Launch Guild
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
