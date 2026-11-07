import React, { useState } from 'react';
import {
  Search,
  Users,
  Gamepad2,
  Compass,
  Sparkles,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import {
  GamerProfile,
  GamingPost,
  GameCatalogItem,
  GamingAdventure,
  ActivePage
} from '../types';
import { FeedPostCard } from '../components/dashboard/FeedPostCard';

interface SearchPageProps {
  initialQuery?: string;
  currentUser: GamerProfile;
  posts: GamingPost[];
  games: GameCatalogItem[];
  adventures: GamingAdventure[];
  onNavigate: (page: ActivePage) => void;
  onLikePost?: (postId: string, reactionType: 'like' | 'heart' | 'fire') => void;
  onCommentPost?: (postId: string, text: string) => void;
}

export const SearchPage: React.FC<SearchPageProps> = ({
  initialQuery = '',
  currentUser,
  posts,
  games,
  adventures,
  onNavigate,
  onLikePost,
  onCommentPost
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [filterType, setFilterType] = useState<'all' | 'gamers' | 'games' | 'posts' | 'adventures'>('all');

  const q = query.toLowerCase().trim();

  // Search matching games
  const matchedGames = games.filter(
    (g) =>
      !q ||
      g.title.toLowerCase().includes(q) ||
      g.genre.toLowerCase().includes(q) ||
      g.description.toLowerCase().includes(q)
  );

  // Search matching posts
  const matchedPosts = posts.filter(
    (p) =>
      !q ||
      p.content.toLowerCase().includes(q) ||
      p.author.displayName.toLowerCase().includes(q) ||
      p.author.username.toLowerCase().includes(q) ||
      p.gameTag?.toLowerCase().includes(q) ||
      p.tags?.some((t) => t.toLowerCase().includes(q))
  );

  // Search matching adventures
  const matchedAdventures = adventures.filter(
    (a) =>
      !q ||
      a.title.toLowerCase().includes(q) ||
      a.game.toLowerCase().includes(q) ||
      a.description.toLowerCase().includes(q)
  );

  const totalResults =
    (filterType === 'all' || filterType === 'games' ? matchedGames.length : 0) +
    (filterType === 'all' || filterType === 'posts' ? matchedPosts.length : 0) +
    (filterType === 'all' || filterType === 'adventures' ? matchedAdventures.length : 0);

  return (
    <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Search Input Card */}
      <div className="bg-white rounded-3xl border border-[#E4E9F2] p-6 shadow-xs space-y-4">
        <h1 className="text-xl font-black text-[#10234A]">Universal Search</h1>
        <div className="relative">
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-[#697386]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search across gamers, game titles, moments, and adventures..."
            className="w-full pl-12 pr-4 py-3 bg-[#F4F6FC] rounded-2xl text-sm text-[#172033] border border-[#E4E9F2] focus:border-[#1768DF] focus:outline-hidden"
            autoFocus
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1">
          {[
            { id: 'all', label: `All (${totalResults})` },
            { id: 'games', label: `Games (${matchedGames.length})` },
            { id: 'posts', label: `Posts (${matchedPosts.length})` },
            { id: 'adventures', label: `Adventures (${matchedAdventures.length})` }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id as any)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                filterType === tab.id
                  ? 'bg-[#1768DF] text-white'
                  : 'bg-[#F4F6FC] text-[#697386] hover:bg-[#EEF4FE]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results Feed */}
      <div className="space-y-6">
        {/* Games Match */}
        {(filterType === 'all' || filterType === 'games') && matchedGames.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-[#10234A] flex items-center gap-2">
              <Gamepad2 className="w-4 h-4 text-[#1768DF]" />
              <span>Matching Games</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {matchedGames.map((game) => (
                <div
                  key={game.id}
                  onClick={() => onNavigate('explore')}
                  className="bg-white rounded-2xl border border-[#E4E9F2] p-4 flex items-center gap-3.5 shadow-xs hover:border-[#1768DF] transition-all cursor-pointer"
                >
                  <img
                    src={game.coverUrl}
                    alt={game.title}
                    className="w-14 h-14 rounded-xl object-cover"
                  />
                  <div>
                    <h3 className="font-bold text-sm text-[#172033]">{game.title}</h3>
                    <p className="text-xs text-[#1768DF]">{game.genre}</p>
                    <p className="text-[11px] text-[#697386] mt-0.5">{game.postsCount}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Adventures Match */}
        {(filterType === 'all' || filterType === 'adventures') && matchedAdventures.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-[#10234A] flex items-center gap-2">
              <Compass className="w-4 h-4 text-purple-600" />
              <span>Gaming Adventures</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {matchedAdventures.map((adv) => (
                <div
                  key={adv.id}
                  onClick={() => onNavigate('adventures')}
                  className="bg-white rounded-2xl border border-[#E4E9F2] p-4 shadow-xs hover:border-[#1768DF] transition-all cursor-pointer"
                >
                  <span className="text-[10px] font-bold text-[#1768DF] uppercase">{adv.game}</span>
                  <h3 className="font-bold text-sm text-[#172033] mt-0.5">{adv.title}</h3>
                  <p className="text-xs text-[#697386] line-clamp-2 mt-1">{adv.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Posts Match */}
        {(filterType === 'all' || filterType === 'posts') && matchedPosts.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-[#10234A] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#1768DF]" />
              <span>Feed Posts</span>
            </h2>
            <div className="space-y-4">
              {matchedPosts.map((post) => (
                <FeedPostCard
                  key={post.id}
                  post={post}
                  currentUser={currentUser}
                  onLike={onLikePost}
                  onComment={onCommentPost}
                />
              ))}
            </div>
          </div>
        )}

        {totalResults === 0 && (
          <div className="bg-white rounded-3xl border border-[#E4E9F2] p-12 text-center text-[#697386]">
            No results found for "{query}". Try searching for "Valorant", "Minecraft", or "Diamond".
          </div>
        )}
      </div>
    </div>
  );
};
