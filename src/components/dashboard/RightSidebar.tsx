import React, { useState } from 'react';
import {
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Trophy,
  X,
  Sparkles,
  Flame,
  Check
} from 'lucide-react';
import { GamingTrend, SuggestedGamer, ActivePage } from '../../types';

interface RightSidebarProps {
  trends: GamingTrend[];
  suggestedGamers: SuggestedGamer[];
  onNavigate: (page: ActivePage) => void;
  onSelectGame?: (gameTitle: string) => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  trends,
  suggestedGamers: initialSuggested,
  onNavigate,
  onSelectGame
}) => {
  const [gamers, setGamers] = useState<SuggestedGamer[]>(initialSuggested);
  const [showQuestCard, setShowQuestCard] = useState(true);
  const [questJoined, setQuestJoined] = useState(false);

  const toggleFollow = (gamerId: string) => {
    setGamers((prev) =>
      prev.map((g) => (g.id === gamerId ? { ...g, isFollowing: !g.isFollowing } : g))
    );
  };

  return (
    <aside className="space-y-4 w-full">
      {/* 1. Gaming Trends Card */}
      <div className="bg-white rounded-2xl border border-[#E4E9F2] p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2 font-bold text-sm text-[#172033]">
            <TrendingUp className="w-4 h-4 text-[#1768DF]" />
            <span>Gaming Trends</span>
          </div>
          <button
            onClick={() => onNavigate('explore')}
            className="text-xs font-semibold text-[#1768DF] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>See all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-3">
          {trends.map((trend) => (
            <div
              key={trend.id}
              onClick={() => {
                if (onSelectGame) onSelectGame(trend.title);
                onNavigate('explore');
              }}
              className="flex items-center gap-3 p-1.5 -mx-1.5 rounded-xl hover:bg-[#F4F6FC] transition-colors cursor-pointer group"
            >
              <span className="font-extrabold text-sm text-[#697386] w-4 text-center group-hover:text-[#1768DF] transition-colors">
                {trend.rank}
              </span>
              <img
                src={trend.coverUrl}
                alt={trend.title}
                className="w-10 h-10 rounded-xl object-cover ring-1 ring-[#E4E9F2]"
              />
              <div className="flex-1 min-w-0">
                <div className="font-bold text-xs text-[#172033] group-hover:text-[#1768DF] truncate transition-colors">
                  {trend.title}
                </div>
                <div className="text-[11px] text-[#697386]">{trend.postCount}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Who to follow Card */}
      <div className="bg-white rounded-2xl border border-[#E4E9F2] p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="font-bold text-sm text-[#172033]">Who to follow</h3>
          <button
            onClick={() => onNavigate('friends')}
            className="text-xs font-semibold text-[#1768DF] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>See all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-3.5">
          {gamers.map((gamer) => (
            <div key={gamer.id} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={gamer.avatarUrl}
                  alt={gamer.name}
                  className="w-9 h-9 rounded-full object-cover ring-1 ring-[#E4E9F2]"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-xs text-[#172033] truncate">
                      {gamer.name}
                    </span>
                    {gamer.isVerified && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#1768DF] fill-[#1768DF] text-white shrink-0" />
                    )}
                  </div>
                  <div className="text-[11px] text-[#697386] truncate">
                    {gamer.followersCount}
                  </div>
                </div>
              </div>

              <button
                onClick={() => toggleFollow(gamer.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  gamer.isFollowing
                    ? 'bg-[#F4F6FC] text-[#697386] border border-[#E4E9F2] hover:bg-red-50 hover:text-red-600 hover:border-red-200'
                    : 'bg-white hover:bg-[#EEF4FE] text-[#1768DF] border border-[#1768DF]'
                }`}
              >
                {gamer.isFollowing ? 'Following' : 'Follow'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 3. "Complete more quests!" Challenge Card */}
      {showQuestCard && (
        <div className="relative rounded-2xl bg-gradient-to-br from-[#10234A] via-[#142B5C] to-[#0A1630] text-white p-4 overflow-hidden shadow-md">
          {/* Dismiss button */}
          <button
            onClick={() => setShowQuestCard(false)}
            className="absolute top-2.5 right-2.5 text-white/60 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Dismiss challenge card"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-start gap-3.5 pt-1">
            {/* Glowing Trophy Icon Graphic */}
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/10">
              <Trophy className="w-6 h-6 text-amber-400" />
            </div>

            <div className="flex-1 pr-4">
              <h4 className="font-bold text-sm text-white tracking-tight">
                Complete more quests!
              </h4>
              <p className="text-xs text-white/80 mt-1 leading-snug">
                Join this week's Gaming Challenge and win rewards.
              </p>

              <button
                onClick={() => {
                  setQuestJoined(true);
                  setTimeout(() => onNavigate('achievements'), 800);
                }}
                className={`mt-3 px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer ${
                  questJoined
                    ? 'bg-[#16A36A] text-white'
                    : 'bg-[#1768DF] hover:bg-[#1255be] text-white'
                }`}
              >
                {questJoined ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Challenge Joined!</span>
                  </>
                ) : (
                  <>
                    <span>Join Challenge</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subtle GameOut Footer info */}
      <div className="px-2 text-[11px] text-[#697386] space-y-1.5">
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          <button onClick={() => onNavigate('landing')} className="hover:underline">About</button>
          <button onClick={() => onNavigate('settings')} className="hover:underline">Privacy</button>
          <button onClick={() => onNavigate('settings')} className="hover:underline">Terms</button>
          <button onClick={() => onNavigate('explore')} className="hover:underline">Games Directory</button>
          <button onClick={() => onNavigate('admin')} className="hover:underline">Admin</button>
        </div>
        <p className="text-[10px] text-[#94a3b8]">GameOut Corporation © 2026. Built for Gamers.</p>
      </div>
    </aside>
  );
};
