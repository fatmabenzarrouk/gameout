import React, { useState } from 'react';
import {
  Compass,
  Plus,
  Users,
  Trophy,
  Calendar,
  Heart,
  Share2,
  Trash2,
  Edit2,
  X,
  Sparkles,
  Check,
  Upload,
  Link,
  Flame,
  Award
} from 'lucide-react';
import { GamingAdventure } from '../types';

interface GamingAdventuresPageProps {
  adventures: GamingAdventure[];
  onAddAdventure: (adv: Omit<GamingAdventure, 'id' | 'userId' | 'likesCount' | 'isLiked'>) => Promise<void> | void;
  onUpdateAdventure?: (adv: GamingAdventure) => Promise<void> | void;
  onDeleteAdventure: (id: string) => Promise<void> | void;
  onLikeAdventure?: (id: string) => void;
  currentUserId?: string;
}

export const GamingAdventuresPage: React.FC<GamingAdventuresPageProps> = ({
  adventures,
  onAddAdventure,
  onUpdateAdventure,
  onDeleteAdventure,
  onLikeAdventure,
  currentUserId
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAdv, setEditingAdv] = useState<GamingAdventure | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [game, setGame] = useState('Valorant');
  const [description, setDescription] = useState('');
  const [personalStory, setPersonalStory] = useState('');
  const [mediaUrl, setMediaUrl] = useState('https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=900&q=80');
  const [teamMembersString, setTeamMembersString] = useState('Fatma B. (Captain), Alex R., Sarah V.');
  const [tournamentParticipation, setTournamentParticipation] = useState('Collegiate Winter Finals 2024');
  const [challengeCompletion, setChallengeCompletion] = useState('');
  const [tagsString, setTagsString] = useState('Esports, Tournament, Overtime');
  const [date, setDate] = useState('October 2024');

  const [copiedShareId, setCopiedShareId] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingAdv(null);
    setTitle('');
    setGame('Valorant');
    setDescription('');
    setPersonalStory('');
    setMediaUrl('https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=900&q=80');
    setTeamMembersString('Fatma B. (Captain), Alex R., Sarah V.');
    setTournamentParticipation('Regional Championship 2024');
    setChallengeCompletion('');
    setTagsString('Esports, Tournament, Clutch');
    setDate('Recent Adventure');
    setIsModalOpen(true);
  };

  const openEditModal = (adv: GamingAdventure) => {
    setEditingAdv(adv);
    setTitle(adv.title);
    setGame(adv.game);
    setDescription(adv.description);
    setPersonalStory(adv.personalStory || '');
    setMediaUrl(adv.mediaUrl);
    setTeamMembersString(adv.teamMembers.join(', '));
    setTournamentParticipation(adv.tournamentParticipation || '');
    setChallengeCompletion(adv.challengeCompletion || '');
    setTagsString(adv.tags.join(', '));
    setDate(adv.date);
    setIsModalOpen(true);
  };

  const handleShareAdventure = (adv: GamingAdventure) => {
    navigator.clipboard?.writeText(`${window.location.origin}/adventures#${adv.id}`);
    setCopiedShareId(adv.id);
    setTimeout(() => setCopiedShareId(null), 2500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !game.trim() || !description.trim()) return;

    if (editingAdv && onUpdateAdventure) {
      await onUpdateAdventure({
        ...editingAdv,
        title: title.trim(),
        game: game.trim(),
        description: description.trim(),
        personalStory: personalStory.trim(),
        mediaUrl: mediaUrl.trim(),
        teamMembers: teamMembersString.split(',').map((m) => m.trim()).filter(Boolean),
        tournamentParticipation: tournamentParticipation.trim() || undefined,
        challengeCompletion: challengeCompletion.trim() || undefined,
        date: date.trim(),
        tags: tagsString.split(',').map((t) => t.trim()).filter(Boolean)
      });
    } else {
      await onAddAdventure({
        title: title.trim(),
        game: game.trim(),
        description: description.trim(),
        personalStory: personalStory.trim(),
        mediaUrl: mediaUrl.trim(),
        teamMembers: teamMembersString.split(',').map((m) => m.trim()).filter(Boolean),
        tournamentParticipation: tournamentParticipation.trim() || undefined,
        challengeCompletion: challengeCompletion.trim() || undefined,
        date: date.trim(),
        tags: tagsString.split(',').map((t) => t.trim()).filter(Boolean)
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-[#E4E9F2] p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-600 text-xs font-bold mb-2">
            <Compass className="w-3.5 h-3.5" />
            <span>Gaming Adventure Portfolio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#10234A] tracking-tight">
            Gaming Adventures
          </h1>
          <p className="text-xs sm:text-sm text-[#697386] mt-1 max-w-xl">
            Replace corporate project case studies with raid triumphs, tournament comebacks, monumental builds, and personal stories.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-5 py-2.5 bg-[#1768DF] hover:bg-[#1255be] text-white font-bold text-xs sm:text-sm rounded-full shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Publish Adventure</span>
        </button>
      </div>

      {/* Grid of Adventures */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {adventures.map((adv) => (
          <article
            key={adv.id}
            className="bg-white rounded-3xl border border-[#E4E9F2] overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
          >
            {/* Media Image Banner */}
            <div className="relative h-60 w-full bg-slate-950 overflow-hidden">
              <img
                src={adv.mediaUrl}
                alt={adv.title}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white border border-white/20">
                {adv.game}
              </div>

              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="text-xs text-white/80 font-mono flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {adv.date}
                </span>
                <h2 className="text-lg font-black leading-tight drop-shadow-sm mt-1">
                  {adv.title}
                </h2>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <p className="text-xs sm:text-sm text-[#172033] leading-relaxed">
                  {adv.description}
                </p>

                {adv.personalStory && (
                  <div className="bg-[#F8FAFC] border-l-3 border-[#1768DF] p-3 rounded-r-2xl">
                    <p className="text-xs italic text-[#697386]">"{adv.personalStory}"</p>
                  </div>
                )}

                {/* Tournament or Challenge Badges */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {adv.tournamentParticipation && (
                    <span className="px-3 py-1 rounded-xl bg-amber-50 text-amber-800 text-xs font-bold flex items-center gap-1.5 border border-amber-200">
                      <Trophy className="w-3.5 h-3.5 text-amber-600" />
                      <span>{adv.tournamentParticipation}</span>
                    </span>
                  )}
                  {adv.challengeCompletion && (
                    <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center gap-1.5 border border-emerald-200">
                      <Award className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{adv.challengeCompletion}</span>
                    </span>
                  )}
                </div>

                {/* Team Roster */}
                {adv.teamMembers && adv.teamMembers.length > 0 && (
                  <div className="pt-2">
                    <div className="text-[11px] font-bold text-[#697386] flex items-center gap-1.5 mb-1.5">
                      <Users className="w-3.5 h-3.5 text-[#1768DF]" />
                      <span>Squad Roster:</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {adv.teamMembers.map((m) => (
                        <span
                          key={m}
                          className="px-2.5 py-0.5 rounded-lg bg-[#EEF4FE] text-[#1768DF] text-[11px] font-bold"
                        >
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {adv.tags && adv.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {adv.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-semibold text-[#697386] bg-[#F4F6FC] px-2 py-0.5 rounded-md"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Card Footer: Cheer, Share, Edit, Delete */}
              <div className="pt-4 border-t border-[#E4E9F2] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onLikeAdventure && onLikeAdventure(adv.id)}
                    className="flex items-center gap-1.5 text-xs font-bold text-[#172033] hover:text-[#EF4444] transition-colors cursor-pointer"
                  >
                    <Heart className={`w-4 h-4 ${adv.isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                    <span>{adv.likesCount} cheers</span>
                  </button>

                  <button
                    onClick={() => handleShareAdventure(adv)}
                    className="flex items-center gap-1 text-xs font-semibold text-[#697386] hover:text-[#1768DF] ml-3 transition-colors cursor-pointer"
                  >
                    {copiedShareId === adv.id ? (
                      <span className="text-[#16A36A] font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Copied!
                      </span>
                    ) : (
                      <>
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Share</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(adv)}
                    className="p-1.5 text-[#697386] hover:text-[#1768DF] hover:bg-[#EEF4FE] rounded-lg transition-colors cursor-pointer"
                    title="Edit adventure"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteAdventure(adv.id)}
                    className="p-1.5 text-[#697386] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete adventure"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Add / Edit Adventure Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-[#E4E9F2] overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-[#E4E9F2] flex items-center justify-between">
              <div className="flex items-center gap-2 font-black text-base text-[#10234A]">
                <Compass className="w-5 h-5 text-[#1768DF]" />
                <span>{editingAdv ? 'Edit Gaming Adventure' : 'Publish Gaming Adventure'}</span>
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
                <label className="block font-bold text-[#172033] mb-1">Adventure Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Haven Overtime Comeback, Ender Dragon SMP Raid"
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
                    placeholder="Valorant, Minecraft..."
                    className="w-full p-2.5 rounded-xl border border-[#E4E9F2] text-sm focus:border-[#1768DF] focus:outline-hidden"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#172033] mb-1">Date</label>
                  <input
                    type="text"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    placeholder="e.g. October 2024"
                    className="w-full p-2.5 rounded-xl border border-[#E4E9F2] text-sm focus:border-[#1768DF] focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#172033] mb-1">Tournament / Cup (Optional)</label>
                  <input
                    type="text"
                    value={tournamentParticipation}
                    onChange={(e) => setTournamentParticipation(e.target.value)}
                    placeholder="e.g. Collegiate Esports Cup 2024"
                    className="w-full p-2.5 rounded-xl border border-[#E4E9F2] text-sm focus:border-[#1768DF] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#172033] mb-1">Challenge Completed (Optional)</label>
                  <input
                    type="text"
                    value={challengeCompletion}
                    onChange={(e) => setChallengeCompletion(e.target.value)}
                    placeholder="e.g. 100% Survival, No Deaths"
                    className="w-full p-2.5 rounded-xl border border-[#E4E9F2] text-sm focus:border-[#1768DF] focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#172033] mb-1">Cover Image or Video URL</label>
                <input
                  type="url"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full p-2.5 rounded-xl border border-[#E4E9F2] text-sm focus:border-[#1768DF] focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-[#172033] mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Overview of the adventure, rules, or match stakes..."
                  className="w-full p-2.5 rounded-xl border border-[#E4E9F2] text-sm focus:border-[#1768DF] focus:outline-hidden resize-none"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-[#172033] mb-1">Personal Gaming Story & Clutches</label>
                <textarea
                  value={personalStory}
                  onChange={(e) => setPersonalStory(e.target.value)}
                  rows={2}
                  placeholder="What happened in the decisive moment?"
                  className="w-full p-2.5 rounded-xl border border-[#E4E9F2] text-sm focus:border-[#1768DF] focus:outline-hidden resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#172033] mb-1">Squad Members (comma separated)</label>
                  <input
                    type="text"
                    value={teamMembersString}
                    onChange={(e) => setTeamMembersString(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#E4E9F2] text-sm focus:border-[#1768DF] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#172033] mb-1">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={tagsString}
                    onChange={(e) => setTagsString(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#E4E9F2] text-sm focus:border-[#1768DF] focus:outline-hidden"
                  />
                </div>
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
                  {editingAdv ? 'Save Adventure' : 'Publish Adventure'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
