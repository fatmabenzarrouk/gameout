import React from 'react';
import {
  MapPin,
  GraduationCap,
  Gamepad2,
  ChevronRight,
  Home,
  User,
  Compass,
  Trophy,
  Users,
  MessageSquare,
  MoreHorizontal,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { GamerProfile, ActivePage } from '../../types';

interface LeftSidebarProps {
  currentUser: GamerProfile;
  activePage: ActivePage;
  onNavigate: (page: ActivePage) => void;
  unreadMessagesCount?: number;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  currentUser,
  activePage,
  onNavigate,
  unreadMessagesCount = 3
}) => {
  const menuItems = [
    { id: 'home' as ActivePage, label: 'Home', icon: Home },
    { id: 'profile' as ActivePage, label: 'My Profile', icon: User },
    { id: 'experience' as ActivePage, label: 'Gaming Experience', icon: Gamepad2 },
    { id: 'adventures' as ActivePage, label: 'Gaming Adventures', icon: Compass },
    { id: 'achievements' as ActivePage, label: 'Game Achievements', icon: Trophy },
    { id: 'friends' as ActivePage, label: 'Gaming Friends', icon: Users },
    {
      id: 'messages' as ActivePage,
      label: 'Messages',
      icon: MessageSquare,
      badge: unreadMessagesCount > 0 ? unreadMessagesCount : null
    },
    { id: 'settings' as ActivePage, label: 'More', icon: MoreHorizontal }
  ];

  return (
    <aside className="space-y-3 w-full">
      {/* 1. Main Gamer Identity Card */}
      <div className="bg-white rounded-2xl border border-[#E4E9F2] overflow-hidden shadow-xs">
        {/* Cover Landscape */}
        <div className="h-28 w-full relative bg-slate-900 overflow-hidden">
          <img
            src={currentUser.coverUrl}
            alt="Profile Cover"
            className="w-full h-full object-cover opacity-90 transition-transform duration-500 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        </div>

        {/* Profile Content */}
        <div className="px-4 pb-4 pt-0 relative">
          {/* Avatar with Online Dot */}
          <div className="relative -mt-12 mb-3 inline-block">
            <div className="w-20 h-20 rounded-full p-1 bg-white shadow-md">
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.displayName}
                className="w-full h-full rounded-full object-cover ring-2 ring-white"
              />
            </div>
            <span
              className="absolute bottom-1 right-1 w-4 h-4 bg-[#16A36A] ring-2 ring-white rounded-full"
              title="Online now"
            />
          </div>

          {/* User Name & Verification */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <h2 className="text-lg font-bold text-[#172033] tracking-tight">
              {currentUser.displayName}
            </h2>
            {currentUser.isVerified && (
              <CheckCircle2 className="w-4 h-4 text-[#1768DF] fill-[#1768DF] text-white" />
            )}
          </div>

          {/* Level & XP Progress Bar */}
          <div className="mt-2.5 space-y-1">
            <div className="flex items-center justify-between text-xs font-semibold text-[#172033]">
              <span className="flex items-center gap-1 text-[#6366F1]">
                <Sparkles className="w-3.5 h-3.5 fill-[#6366F1]" />
                Level {currentUser.level}
              </span>
              <span className="text-[#697386] font-medium">
                {currentUser.levelProgressPercentage}%
              </span>
            </div>
            <div className="w-full h-2 bg-[#E4E9F2] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#818CF8] via-[#6366F1] to-[#4F46E5] rounded-full transition-all duration-500"
                style={{ width: `${currentUser.levelProgressPercentage}%` }}
              />
            </div>
          </div>

          {/* Tagline / Bio */}
          <p className="mt-3 text-xs font-medium text-[#172033]">
            {currentUser.tagline}
          </p>

          {/* Metadata: Location & Organization */}
          <div className="mt-3 pt-3 border-t border-[#E4E9F2] space-y-1.5 text-xs text-[#697386]">
            {currentUser.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#697386]" />
                <span>{currentUser.location}</span>
              </div>
            )}
            {currentUser.schoolOrOrg && (
              <div className="flex items-center gap-2">
                <GraduationCap className="w-3.5 h-3.5 text-[#697386]" />
                <span>{currentUser.schoolOrOrg}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. "My Gaming Identity" CTA Card */}
      <button
        onClick={() => onNavigate('profile')}
        className="w-full text-left bg-gradient-to-r from-[#EEF4FE] via-[#F5F8FF] to-[#E9EFFE] hover:from-[#E3EDFD] hover:to-[#DFEBFC] p-3.5 rounded-2xl border border-[#D5E4FC] shadow-2xs transition-all duration-200 flex items-center justify-between group cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1768DF] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-xs text-[#172033] tracking-tight group-hover:text-[#1768DF] transition-colors">
              My Gaming Identity
            </div>
            <div className="text-[11px] text-[#697386] leading-tight">
              See your stats, games and journey
            </div>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-[#1768DF] group-hover:translate-x-0.5 transition-transform" />
      </button>

      {/* 3. Navigation Menu Card */}
      <div className="bg-white rounded-2xl border border-[#E4E9F2] p-2 shadow-xs">
        <nav className="space-y-0.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#EEF4FE] text-[#1768DF]'
                    : 'text-[#172033] hover:bg-[#F4F6FC] hover:text-[#1768DF]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-[#1768DF]' : 'text-[#697386]'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="bg-[#EF4444] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-[18px] text-center">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};
