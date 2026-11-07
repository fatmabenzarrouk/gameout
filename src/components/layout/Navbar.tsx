import React, { useState } from 'react';
import {
  Search,
  Home,
  Gamepad2,
  Users,
  Trophy,
  MessageSquare,
  Bell,
  ChevronDown,
  Shield,
  Settings,
  LogOut,
  User,
  Compass,
  Bookmark
} from 'lucide-react';
import { GameOutLogo } from '../common/GameOutLogo';
import { GamerProfile, ActivePage } from '../../types';

interface NavbarProps {
  currentUser: GamerProfile;
  activePage: ActivePage;
  onNavigate: (page: ActivePage) => void;
  unreadMessagesCount?: number;
  unreadNotificationsCount?: number;
  onSearch?: (query: string) => void;
  isAdmin?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activePage,
  onNavigate,
  unreadMessagesCount = 3,
  unreadNotificationsCount = 5,
  onSearch,
  isAdmin = true
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      if (onSearch) onSearch(searchQuery.trim());
      onNavigate('search');
    }
  };

  const navItems = [
    { id: 'home' as ActivePage, label: 'Home', icon: Home },
    { id: 'explore' as ActivePage, label: 'Explore', icon: Gamepad2 },
    { id: 'friends' as ActivePage, label: 'Gaming Friends', icon: Users },
    { id: 'achievements' as ActivePage, label: 'Achievements', icon: Trophy },
    {
      id: 'messages' as ActivePage,
      label: 'Messages',
      icon: MessageSquare,
      badge: unreadMessagesCount > 0 ? unreadMessagesCount : null
    },
    {
      id: 'notifications' as ActivePage,
      label: 'Notifications',
      icon: Bell,
      badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : null
    }
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#E4E9F2] shadow-xs">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Logo & Global Search */}
        <div className="flex items-center gap-4 sm:gap-6 flex-1 max-w-xl">
          <GameOutLogo onClick={() => onNavigate('home')} size="md" />

          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md hidden md:block">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-[#697386]" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search gamers, games, posts..."
              className="w-full pl-10 pr-4 py-2 bg-[#F4F6FC] hover:bg-[#EEF2FA] focus:bg-white text-sm text-[#172033] rounded-full border border-transparent focus:border-[#1768DF] focus:outline-hidden transition-all duration-150 placeholder-[#697386]"
            />
          </form>
        </div>

        {/* Center-Right: Main Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`relative flex flex-col items-center justify-center min-w-[58px] sm:min-w-[72px] h-16 px-1.5 transition-colors cursor-pointer group ${
                  isActive
                    ? 'text-[#1768DF] font-semibold'
                    : 'text-[#697386] hover:text-[#172033]'
                }`}
              >
                <div className="relative">
                  <Icon
                    className={`h-5 w-5 transition-transform group-hover:scale-105 ${
                      isActive ? 'stroke-[2.5px] text-[#1768DF]' : 'stroke-[1.8px]'
                    }`}
                  />
                  {item.badge && (
                    <span className="absolute -top-1.5 -right-2.5 bg-[#EF4444] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-[17px] text-center shadow-xs">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[11px] mt-1 tracking-tight truncate max-w-[70px]">
                  {item.label}
                </span>

                {/* Active Underline Indicator */}
                {isActive && (
                  <span className="absolute bottom-0 left-2 right-2 h-[3px] bg-[#1768DF] rounded-t-full" />
                )}
              </button>
            );
          })}

          {/* User Avatar & Dropdown Menu */}
          <div className="relative ml-2 pl-2 border-l border-[#E4E9F2]">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-1.5 p-1 rounded-full hover:bg-[#F4F6FC] transition-colors cursor-pointer group"
              aria-label="User profile menu"
            >
              <div className="relative">
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.displayName}
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=150&q=80';
                  }}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-[#E4E9F2] group-hover:ring-[#1768DF] transition-all"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#16A36A] ring-2 ring-white rounded-full" />
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#697386] group-hover:text-[#172033] hidden sm:block" />
            </button>

            {/* Profile Menu Dropdown */}
            {showProfileMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowProfileMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-[#E4E9F2] py-2 z-50 text-sm">
                  {/* User Header */}
                  <div className="px-4 py-3 border-b border-[#E4E9F2]">
                    <div className="flex items-center gap-3">
                      <img
                        src={currentUser.avatarUrl}
                        alt={currentUser.displayName}
                        className="w-11 h-11 rounded-full object-cover ring-2 ring-[#1768DF]/20"
                      />
                      <div className="overflow-hidden">
                        <div className="font-bold text-[#172033] truncate flex items-center gap-1">
                          {currentUser.displayName}
                          <span className="text-xs text-white bg-[#1768DF] rounded-full px-1.5 py-0.2">
                            Lvl {currentUser.level}
                          </span>
                        </div>
                        <p className="text-xs text-[#697386] truncate">@{currentUser.username}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        onNavigate('profile');
                      }}
                      className="mt-3 w-full py-1.5 px-3 bg-[#EEF4FE] hover:bg-[#E0ECFD] text-[#1768DF] font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                    >
                      View Full Gaming Profile
                    </button>
                  </div>

                  {/* Nav Links inside Dropdown */}
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        onNavigate('experience');
                      }}
                      className="w-full px-4 py-2 text-left text-[#172033] hover:bg-[#F4F6FC] flex items-center gap-2.5 cursor-pointer"
                    >
                      <Gamepad2 className="w-4 h-4 text-[#697386]" />
                      <span>Gaming Experience</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        onNavigate('adventures');
                      }}
                      className="w-full px-4 py-2 text-left text-[#172033] hover:bg-[#F4F6FC] flex items-center gap-2.5 cursor-pointer"
                    >
                      <Compass className="w-4 h-4 text-[#697386]" />
                      <span>Gaming Adventures</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        onNavigate('achievements');
                      }}
                      className="w-full px-4 py-2 text-left text-[#172033] hover:bg-[#F4F6FC] flex items-center gap-2.5 cursor-pointer"
                    >
                      <Trophy className="w-4 h-4 text-[#697386]" />
                      <span>Game Achievements</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        onNavigate('settings');
                      }}
                      className="w-full px-4 py-2 text-left text-[#172033] hover:bg-[#F4F6FC] flex items-center gap-2.5 cursor-pointer"
                    >
                      <Settings className="w-4 h-4 text-[#697386]" />
                      <span>Account & Privacy Settings</span>
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          onNavigate('admin');
                        }}
                        className="w-full px-4 py-2 text-left text-[#1768DF] hover:bg-[#EEF4FE] flex items-center gap-2.5 font-medium cursor-pointer"
                      >
                        <Shield className="w-4 h-4 text-[#1768DF]" />
                        <span>Admin Dashboard</span>
                      </button>
                    )}
                  </div>

                  <div className="border-t border-[#E4E9F2] pt-1">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        onNavigate('landing');
                      }}
                      className="w-full px-4 py-2 text-left text-[#697386] hover:bg-[#F4F6FC] flex items-center gap-2.5 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Switch to Public Landing Page</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </nav>
      </div>

      {/* Mobile search bar */}
      <div className="px-4 pb-2 md:hidden">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#697386]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search gamers, games, posts..."
            className="w-full pl-9 pr-4 py-1.5 bg-[#F4F6FC] text-xs text-[#172033] rounded-full border border-transparent focus:border-[#1768DF] focus:outline-hidden"
          />
        </form>
      </div>
    </header>
  );
};
