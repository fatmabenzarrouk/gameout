import React, { useState } from 'react';
import {
  Trophy,
  Sparkles,
  Plus,
  Filter,
  CheckCircle2,
  Lock,
  Flame,
  Award,
  X,
  Edit2,
  Trash2,
  ShieldAlert,
  Info,
  Check
} from 'lucide-react';
import { GameAchievement, AchievementRarity } from '../types';
import { XP_REWARDS, LEVEL_TIERS, calculateLevelFromXP } from '../services/portfolioService';

interface GameAchievementsPageProps {
  achievements: GameAchievement[];
  onAddAchievement: (ach: Omit<GameAchievement, 'id' | 'userId'>) => Promise<void> | void;
  onUpdateAchievement?: (ach: GameAchievement) => Promise<void> | void;
  onDeleteAchievement?: (id: string) => Promise<void> | void;
  totalUserXp?: number;
}

export const GameAchievementsPage: React.FC<GameAchievementsPageProps> = ({
  achievements,
  onAddAchievement,
  onUpdateAchievement,
  onDeleteAchievement,
  totalUserXp = 14400
}) => {
  const [selectedRarity, setSelectedRarity] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAch, setEditingAch] = useState<GameAchievement | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [game, setGame] = useState('Valorant');
  const [icon, setIcon] = useState('🎯');
  const [rarity, setRarity] = useState<AchievementRarity>('Epic');

  const levelInfo = calculateLevelFromXP(totalUserXp);

  const openCreateModal = () => {
    setEditingAch(null);
    setTitle('');
    setDescription('');
    setGame('Valorant');
    setIcon('🎯');
    setRarity('Epic');
    setIsModalOpen(true);
  };

  const openEditModal = (ach: GameAchievement) => {
    setEditingAch(ach);
    setTitle(ach.title);
    setDescription(ach.description);
    setGame(ach.game);
    setIcon(ach.icon);
    setRarity(ach.rarity);
    setIsModalOpen(true);
  };

  const filteredAchievements = achievements.filter((ach) => {
    if (selectedRarity === 'All') return true;
    return ach.rarity === selectedRarity;
  });

  const totalXP = achievements
    .filter((a) => a.isUnlocked)
    .reduce((sum, a) => sum + a.xpReward, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !game.trim()) return;

    const cappedXp = XP_REWARDS[rarity];

    if (editingAch && onUpdateAchievement) {
      await onUpdateAchievement({
        ...editingAch,
        title: title.trim(),
        description: description.trim(),
        game: game.trim(),
        icon: icon || '🏆',
        rarity,
        xpReward: cappedXp
      });
    } else {
      await onAddAchievement({
        title: title.trim(),
        description: description.trim(),
        game: game.trim(),
        icon: icon || '🏆',
        rarity,
        unlockDate: 'Nov 2026',
        xpReward: cappedXp,
        isUnlocked: true,
        isSelfReported: true
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* 1. Header Banner with Gamification Level & XP */}
      <div className="bg-white rounded-3xl border border-[#E4E9F2] p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold mb-2">
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span>Trophy Cabinet & XP Progression</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#10234A] tracking-tight">
            Game Achievements
          </h1>
          <p className="text-xs sm:text-sm text-[#697386] mt-1 max-w-xl">
            Trophy showcase honoring your in-game milestones. Earn standardized XP rewards according to transparent rarity caps to elevate your Gamer Identity.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#F8FAFC] px-4 py-2.5 rounded-2xl border border-[#E4E9F2] text-center">
            <div className="text-xl font-black text-[#1768DF]">{totalXP.toLocaleString()} XP</div>
            <div className="text-[10px] font-semibold text-[#697386]">Trophy XP Earned</div>
          </div>

          <button
            onClick={openCreateModal}
            className="px-5 py-2.5 bg-[#1768DF] hover:bg-[#1255be] text-white font-bold text-xs sm:text-sm rounded-full shadow-md transition-all flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Claim Trophy</span>
          </button>
        </div>
      </div>

      {/* 2. Gamification Progression Card */}
      <div className="bg-gradient-to-r from-[#10234A] to-[#1E3A8A] text-white rounded-3xl p-6 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-300/30 flex items-center justify-center text-amber-300 text-2xl font-black">
              ★
            </div>
            <div>
              <div className="text-xs text-cyan-300 font-bold uppercase tracking-wider">
                Gamer Tier: {levelInfo.title}
              </div>
              <h2 className="text-xl sm:text-2xl font-black">Level {levelInfo.level}</h2>
            </div>
          </div>

          <div className="text-right sm:text-right">
            <div className="text-xs text-white/80">
              {totalUserXp.toLocaleString()} XP / {levelInfo.nextLevelXp.toLocaleString()} XP to Next Tier
            </div>
            <div className="text-xs font-bold text-cyan-300">{levelInfo.progressPercentage}% Completed</div>
          </div>
        </div>

        {/* Level progress bar */}
        <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden p-0.5">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full transition-all duration-500"
            style={{ width: `${levelInfo.progressPercentage}%` }}
          />
        </div>

        {/* Level Tiers Guide */}
        <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-white/70">
          <div><strong className="text-white">Lvl 1:</strong> Beginner (0 XP)</div>
          <div><strong className="text-white">Lvl 2:</strong> Explorer (1K XP)</div>
          <div><strong className="text-white">Lvl 3:</strong> Skilled Gamer (2.5K XP)</div>
          <div><strong className="text-white">Lvl 5:</strong> Elite Gamer (10K XP)</div>
        </div>
      </div>

      {/* 3. Transparent XP Rules Notice */}
      <div className="bg-[#EEF4FE] border border-[#D5E4FC] p-4 rounded-2xl flex items-start gap-3 text-xs text-[#172033]">
        <Info className="w-5 h-5 text-[#1768DF] shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold">Transparent XP Rules & Fair Play Integrity:</strong>
          <p className="text-[#697386] mt-0.5 leading-relaxed">
            To prevent self-awarding unlimited XP, trophy XP rewards are strictly locked to standard brackets:
            <span className="font-bold text-[#172033]"> Common (+250 XP)</span>,
            <span className="font-bold text-[#172033]"> Rare (+500 XP)</span>,
            <span className="font-bold text-[#172033]"> Epic (+1,000 XP)</span>, and
            <span className="font-bold text-[#172033]"> Legendary (+2,500 XP)</span>.
            User-submitted trophies are clearly distinguished as self-reported and never claim third-party game publisher verification.
          </p>
        </div>
      </div>

      {/* 4. Rarity Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {['All', 'Legendary', 'Epic', 'Rare', 'Common'].map((rarityKey) => (
          <button
            key={rarityKey}
            onClick={() => setSelectedRarity(rarityKey)}
            className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedRarity === rarityKey
                ? 'bg-[#1768DF] text-white shadow-2xs'
                : 'bg-white text-[#697386] hover:bg-[#F4F6FC] border border-[#E4E9F2]'
            }`}
          >
            {rarityKey}
          </button>
        ))}
      </div>

      {/* 5. Grid of Achievements */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAchievements.map((ach) => (
          <div
            key={ach.id}
            className={`bg-white rounded-3xl border p-5 shadow-xs transition-all flex flex-col justify-between ${
              ach.isUnlocked
                ? 'border-[#E4E9F2] hover:shadow-md'
                : 'border-dashed border-slate-300 opacity-75'
            }`}
          >
            <div>
              {/* Card Header: Icon & Rarity Tag */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-[#F8FAFC] border border-[#E4E9F2] flex items-center justify-center text-2xl shadow-2xs">
                  {ach.icon}
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                      ach.rarity === 'Legendary'
                        ? 'bg-amber-100 text-amber-900 border border-amber-200'
                        : ach.rarity === 'Epic'
                        ? 'bg-purple-100 text-purple-900 border border-purple-200'
                        : ach.rarity === 'Rare'
                        ? 'bg-blue-100 text-blue-900 border border-blue-200'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {ach.rarity}
                  </span>
                  <div className="text-xs font-black text-[#16A36A] mt-1">
                    +{ach.xpReward} XP
                  </div>
                </div>
              </div>

              {/* Title & Description */}
              <h3 className="font-bold text-base text-[#172033]">{ach.title}</h3>
              <p className="text-xs text-[#1768DF] font-bold mt-0.5">{ach.game}</p>
              <p className="text-xs text-[#697386] mt-2 leading-relaxed">{ach.description}</p>
            </div>

            {/* Bottom info & actions */}
            <div className="mt-4 pt-3 border-t border-[#E4E9F2] flex items-center justify-between text-[11px] text-[#697386]">
              <div>
                <span
                  className={`inline-flex items-center gap-1 font-bold ${
                    ach.isSelfReported ? 'text-slate-600' : 'text-[#1768DF]'
                  }`}
                >
                  {ach.isSelfReported ? 'Self-Reported' : 'Platform Verified'}
                </span>
                <span className="block text-[10px] text-[#94a3b8] mt-0.5">
                  Unlocked: {ach.unlockDate}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEditModal(ach)}
                  className="p-1.5 text-[#697386] hover:text-[#1768DF] hover:bg-[#EEF4FE] rounded-lg transition-colors cursor-pointer"
                  title="Edit achievement"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                {onDeleteAchievement && (
                  <button
                    onClick={() => onDeleteAchievement(ach.id)}
                    className="p-1.5 text-[#697386] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete achievement"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 6. Claim / Edit Trophy Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-[#E4E9F2] overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-[#E4E9F2] flex items-center justify-between">
              <div className="flex items-center gap-2 font-black text-base text-[#10234A]">
                <Trophy className="w-5 h-5 text-amber-500" />
                <span>{editingAch ? 'Edit Game Trophy' : 'Claim Game Trophy'}</span>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-[#697386] hover:bg-[#F4F6FC] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#172033] mb-1">Trophy Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Flawless 1v5 Overtime Clutch, Ender Dragon Slayer"
                  className="w-full p-2.5 rounded-xl border border-[#E4E9F2] text-sm focus:border-[#1768DF] focus:outline-hidden"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#172033] mb-1">Game</label>
                  <input
                    type="text"
                    value={game}
                    onChange={(e) => setGame(e.target.value)}
                    placeholder="e.g. Valorant, Minecraft"
                    className="w-full p-2.5 rounded-xl border border-[#E4E9F2] text-sm focus:border-[#1768DF] focus:outline-hidden"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#172033] mb-1">Emoji Icon</label>
                  <input
                    type="text"
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    placeholder="🎯, 🏆, 💎, ⚡, 👑"
                    className="w-full p-2.5 rounded-xl border border-[#E4E9F2] text-sm focus:border-[#1768DF] focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#172033] mb-1">Achievement Rarity</label>
                  <select
                    value={rarity}
                    onChange={(e) => setRarity(e.target.value as AchievementRarity)}
                    className="w-full p-2.5 rounded-xl border border-[#E4E9F2] text-sm focus:border-[#1768DF] focus:outline-hidden"
                  >
                    <option value="Common">Common (Fixed +250 XP)</option>
                    <option value="Rare">Rare (Fixed +500 XP)</option>
                    <option value="Epic">Epic (Fixed +1,000 XP)</option>
                    <option value="Legendary">Legendary (Fixed +2,500 XP)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#172033] mb-1">XP Reward (Standardized)</label>
                  <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E4E9F2] text-sm font-black text-[#16A36A]">
                    +{XP_REWARDS[rarity]} XP
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#172033] mb-1">Description & Criteria</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Detail the challenge conditions and match context for this achievement..."
                  className="w-full p-2.5 rounded-xl border border-[#E4E9F2] text-sm focus:border-[#1768DF] focus:outline-hidden resize-none"
                  required
                />
              </div>

              <div className="bg-[#FEF3C7]/60 border border-[#FDE68A] p-3 rounded-2xl text-[11px] text-[#92400E] flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  <strong>GameOut Verification Policy:</strong> All community-claimed trophies are labeled as self-reported to guarantee fairness. We do not claim official endorsement or publisher API integration.
                </span>
              </div>

              <div className="pt-3 border-t border-[#E4E9F2] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-bold text-[#697386] hover:bg-[#F4F6FC] rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1768DF] text-white font-bold rounded-xl shadow-xs hover:bg-[#1255be] cursor-pointer"
                >
                  {editingAch ? 'Update Trophy' : 'Claim Trophy'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
