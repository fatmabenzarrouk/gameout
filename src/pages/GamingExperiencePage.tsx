import React, { useState } from 'react';
import {
  Gamepad2,
  Plus,
  Clock,
  Sparkles,
  Trash2,
  Edit2,
  Calendar,
  X,
  CheckCircle2,
  Check,
  Filter,
  Upload,
  AlertCircle
} from 'lucide-react';
import { GamingExperience, Platform, GamerRole } from '../types';
import { validateImageFile, uploadGamerImage } from '../services/storageService';

interface GamingExperiencePageProps {
  experiences: GamingExperience[];
  onAddExperience: (exp: Omit<GamingExperience, 'id' | 'userId'>) => Promise<void> | void;
  onUpdateExperience?: (exp: GamingExperience) => Promise<void> | void;
  onDeleteExperience: (id: string) => Promise<void> | void;
  currentUserId?: string;
}

export const GamingExperiencePage: React.FC<GamingExperiencePageProps> = ({
  experiences,
  onAddExperience,
  onUpdateExperience,
  onDeleteExperience,
  currentUserId = 'user_fatma'
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExp, setEditingExp] = useState<GamingExperience | null>(null);

  // Form state
  const [gameTitle, setGameTitle] = useState('Valorant');
  const [gameCover, setGameCover] = useState('https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=300&q=80');
  const [platform, setPlatform] = useState<Platform>('PC');
  const [role, setRole] = useState<GamerRole>('Competitive Player');
  const [gameMode, setGameMode] = useState('Competitive 5v5');
  const [startDate, setStartDate] = useState('Jan 2024');
  const [endDate, setEndDate] = useState('');
  const [isCurrentlyPlaying, setIsCurrentlyPlaying] = useState(true);
  const [hoursPlayed, setHoursPlayed] = useState(250);
  const [experienceLevel, setExperienceLevel] = useState('Advanced');
  const [rank, setRank] = useState('Diamond 1');
  const [description, setDescription] = useState('');
  const [skillsString, setSkillsString] = useState('Map Reconnaissance, Lineups, Clutch Comms');
  const [selectedFilter, setSelectedFilter] = useState<string>('All');

  const openCreateModal = () => {
    setEditingExp(null);
    setGameTitle('');
    setGameCover('https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=300&q=80');
    setPlatform('PC');
    setRole('Competitive Player');
    setGameMode('Competitive 5v5');
    setStartDate('Jan 2024');
    setEndDate('');
    setIsCurrentlyPlaying(true);
    setHoursPlayed(100);
    setExperienceLevel('Intermediate');
    setRank('Gold');
    setDescription('');
    setSkillsString('Teamwork, Strategy');
    setIsModalOpen(true);
  };

  const openEditModal = (exp: GamingExperience) => {
    setEditingExp(exp);
    setGameTitle(exp.gameTitle);
    setGameCover(exp.gameCover);
    setPlatform(exp.platform);
    setRole(exp.role);
    setGameMode(exp.gameMode);
    setStartDate(exp.startDate);
    setEndDate(exp.endDate || '');
    setIsCurrentlyPlaying(exp.isCurrentlyPlaying);
    setHoursPlayed(exp.hoursPlayed);
    setExperienceLevel(exp.experienceLevel);
    setRank(exp.rank);
    setDescription(exp.description);
    setSkillsString(exp.skills.join(', '));
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameTitle.trim()) return;

    const skills = skillsString.split(',').map((s) => s.trim()).filter(Boolean);

    if (editingExp && onUpdateExperience) {
      await onUpdateExperience({
        ...editingExp,
        gameTitle,
        gameCover,
        platform,
        role,
        gameMode,
        startDate,
        endDate: isCurrentlyPlaying ? undefined : endDate,
        isCurrentlyPlaying,
        hoursPlayed: Number(hoursPlayed) || 0,
        experienceLevel,
        rank,
        description,
        skills
      });
    } else {
      await onAddExperience({
        gameTitle,
        gameCover: gameCover || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=300&q=80',
        platform,
        role,
        gameMode,
        startDate,
        endDate: isCurrentlyPlaying ? undefined : endDate,
        isCurrentlyPlaying,
        hoursPlayed: Number(hoursPlayed) || 0,
        experienceLevel,
        rank,
        description,
        skills,
        achievements: ['Rank Milestone', 'MVP Squad Trophy']
      });
    }

    setIsModalOpen(false);
  };

  const filteredExperiences = experiences.filter((exp) => {
    if (selectedFilter === 'All') return true;
    return exp.platform === selectedFilter || exp.role === selectedFilter;
  });

  const totalLoggedHours = experiences.reduce((sum, e) => sum + e.hoursPlayed, 0);

  return (
    <div className="max-w-[1050px] mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-[#E4E9F2] p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EEF4FE] text-[#1768DF] text-xs font-bold mb-2">
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>Gaming Career Timeline</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#10234A] tracking-tight">
            Gaming Experience
          </h1>
          <p className="text-xs sm:text-sm text-[#697386] mt-1 max-w-xl">
            Replace traditional CVs with verified gaming history. Log roles, competitive ranks, hours, and tactical masteries across all your games.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#F8FAFC] px-4 py-2 rounded-2xl border border-[#E4E9F2] text-center">
            <div className="text-xl font-black text-[#1768DF]">{totalLoggedHours}h</div>
            <div className="text-[10px] font-semibold text-[#697386]">Total Playtime</div>
          </div>

          <button
            onClick={openCreateModal}
            className="px-5 py-2.5 bg-[#1768DF] hover:bg-[#1255be] text-white font-bold text-xs sm:text-sm rounded-full shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Experience</span>
          </button>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {['All', 'PC', 'PlayStation 5', 'Xbox Series X/S', 'Competitive Player', 'Builder / Architect'].map((chip) => (
          <button
            key={chip}
            onClick={() => setSelectedFilter(chip)}
            className={`px-3.5 py-1.5 rounded-full font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedFilter === chip
                ? 'bg-[#1768DF] text-white shadow-2xs'
                : 'bg-white text-[#697386] border border-[#E4E9F2] hover:bg-[#F4F6FC]'
            }`}
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Chronological Timeline */}
      <div className="relative pl-6 sm:pl-8 border-l-2 border-[#D5E4FC] space-y-6 ml-3 sm:ml-4">
        {filteredExperiences.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#E4E9F2] p-8 text-center text-xs text-[#697386]">
            No gaming experiences matching "{selectedFilter}".
          </div>
        ) : (
          filteredExperiences.map((exp) => (
            <div key={exp.id} className="relative group">
              {/* Timeline Indicator Node */}
              <div className="absolute -left-[31px] sm:-left-[39px] top-6 w-5 h-5 rounded-full bg-white border-4 border-[#1768DF] shadow-xs" />

              <div className="bg-white rounded-3xl border border-[#E4E9F2] p-6 shadow-xs hover:shadow-md transition-all">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <img
                      src={exp.gameCover}
                      alt={exp.gameTitle}
                      className="w-16 h-16 rounded-2xl object-cover ring-2 ring-[#E4E9F2] shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-lg font-black text-[#172033]">{exp.gameTitle}</h2>
                        <span className="px-2.5 py-0.5 rounded-full bg-[#EEF4FE] text-[#1768DF] text-xs font-bold">
                          {exp.platform}
                        </span>
                        {exp.isCurrentlyPlaying && (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#16A36A] text-xs font-bold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#16A36A] animate-pulse" />
                            Active Main
                          </span>
                        )}
                      </div>

                      <div className="text-xs font-bold text-[#1768DF] mt-1">
                        {exp.role} • <span className="text-[#10234A]">{exp.rank}</span>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-[#697386] mt-1.5 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {exp.startDate} - {exp.isCurrentlyPlaying ? 'Present' : exp.endDate}
                        </span>
                        <span className="flex items-center gap-1 font-semibold text-[#172033]">
                          <Clock className="w-3.5 h-3.5 text-[#1768DF]" />
                          {exp.hoursPlayed} Hours Logged
                        </span>
                        <span>Level: {exp.experienceLevel}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions: Edit & Delete */}
                  <div className="flex items-center gap-1.5 self-start">
                    <button
                      onClick={() => openEditModal(exp)}
                      className="p-2 text-[#697386] hover:text-[#1768DF] hover:bg-[#EEF4FE] rounded-xl transition-colors cursor-pointer"
                      title="Edit experience"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteExperience(exp.id)}
                      className="p-2 text-[#697386] hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                      title="Delete experience"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {exp.description && (
                  <p className="mt-4 text-xs sm:text-sm text-[#172033] leading-relaxed whitespace-pre-line">
                    {exp.description}
                  </p>
                )}

                {/* Skills Developed */}
                {exp.skills && exp.skills.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-[#E4E9F2]">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[#697386] mb-2">
                      Skills Developed & Playstyle
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {exp.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-3 py-1 rounded-xl bg-[#F8FAFC] text-xs font-semibold text-[#172033] border border-[#E4E9F2]"
                        >
                          ✓ {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Experience Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-[#E4E9F2] overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-[#E4E9F2] flex items-center justify-between">
              <div className="flex items-center gap-2 font-black text-base text-[#10234A]">
                <Gamepad2 className="w-5 h-5 text-[#1768DF]" />
                <span>{editingExp ? 'Edit Gaming Experience' : 'Add Gaming Experience'}</span>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-[#697386] hover:bg-[#F4F6FC] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#172033] mb-1">Game Title</label>
                  <input
                    type="text"
                    value={gameTitle}
                    onChange={(e) => setGameTitle(e.target.value)}
                    placeholder="e.g. Valorant, Minecraft"
                    className="w-full p-2.5 rounded-xl border border-[#E4E9F2] text-sm focus:border-[#1768DF] focus:outline-hidden"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#172033] mb-1">Gaming Platform</label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value as Platform)}
                    className="w-full p-2.5 rounded-xl border border-[#E4E9F2] text-sm focus:border-[#1768DF] focus:outline-hidden"
                  >
                    <option value="PC">PC</option>
                    <option value="PlayStation 5">PlayStation 5</option>
                    <option value="PlayStation 4">PlayStation 4</option>
                    <option value="Xbox Series X/S">Xbox Series X/S</option>
                    <option value="Nintendo Switch">Nintendo Switch</option>
                    <option value="Mobile">Mobile</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#172033] mb-1">Player Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as GamerRole)}
                    className="w-full p-2.5 rounded-xl border border-[#E4E9F2] text-sm focus:border-[#1768DF] focus:outline-hidden"
                  >
                    <option value="Competitive Player">Competitive Player</option>
                    <option value="Casual Player">Casual Player</option>
                    <option value="Team Captain">Team Captain</option>
                    <option value="Builder / Architect">Builder / Architect</option>
                    <option value="Support Specialist">Support Specialist</option>
                    <option value="Streamer">Streamer</option>
                    <option value="Content Creator">Content Creator</option>
                    <option value="Speedrunner">Speedrunner</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#172033] mb-1">Rank / Peak Tier</label>
                  <input
                    type="text"
                    value={rank}
                    onChange={(e) => setRank(e.target.value)}
                    placeholder="e.g. Diamond 2, Radiant #42"
                    className="w-full p-2.5 rounded-xl border border-[#E4E9F2] text-sm focus:border-[#1768DF] focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#172033] mb-1">Total Hours Played</label>
                  <input
                    type="number"
                    value={hoursPlayed}
                    onChange={(e) => setHoursPlayed(Number(e.target.value))}
                    min={1}
                    className="w-full p-2.5 rounded-xl border border-[#E4E9F2] text-sm focus:border-[#1768DF] focus:outline-hidden"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#172033] mb-1">Experience Level</label>
                  <select
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#E4E9F2] text-sm focus:border-[#1768DF] focus:outline-hidden"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Master">Master</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#172033] mb-1">Start Date</label>
                  <input
                    type="text"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    placeholder="e.g. Jan 2023"
                    className="w-full p-2.5 rounded-xl border border-[#E4E9F2] text-sm focus:border-[#1768DF] focus:outline-hidden"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#172033] mb-1">End Date</label>
                  <input
                    type="text"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    placeholder="e.g. Nov 2024"
                    disabled={isCurrentlyPlaying}
                    className="w-full p-2.5 rounded-xl border border-[#E4E9F2] text-sm focus:border-[#1768DF] focus:outline-hidden disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="currentlyPlaying"
                  checked={isCurrentlyPlaying}
                  onChange={(e) => setIsCurrentlyPlaying(e.target.checked)}
                  className="rounded text-[#1768DF] focus:ring-[#1768DF]"
                />
                <label htmlFor="currentlyPlaying" className="font-semibold text-[#172033]">
                  I am currently actively playing this game
                </label>
              </div>

              <div>
                <label className="block font-bold text-[#172033] mb-1">Skills Developed (comma separated)</label>
                <input
                  type="text"
                  value={skillsString}
                  onChange={(e) => setSkillsString(e.target.value)}
                  placeholder="e.g. Map Awareness, Lineups, Clutch Comms"
                  className="w-full p-2.5 rounded-xl border border-[#E4E9F2] text-sm focus:border-[#1768DF] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-[#172033] mb-1">Personal Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Detail your squad role, tactical strategies, or tournament accomplishments..."
                  className="w-full p-2.5 rounded-xl border border-[#E4E9F2] text-sm focus:border-[#1768DF] focus:outline-hidden resize-none"
                />
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
                  {editingExp ? 'Update Experience' : 'Save Experience'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
