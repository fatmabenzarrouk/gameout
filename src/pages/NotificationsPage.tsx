import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCircle2,
  Heart,
  MessageSquare,
  UserPlus,
  Trophy,
  Check,
  Trash2,
  Filter,
  Sparkles,
  Settings,
  Flame,
  AtSign,
  ArrowRight,
  CheckCheck
} from 'lucide-react';
import { NotificationItem, ActivePage, GamerProfile, NotificationType } from '../types';
import {
  subscribeToNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  seedInitialNotifications
} from '../services/notificationService';

interface NotificationsPageProps {
  currentUser: GamerProfile;
  onNavigate: (page: ActivePage, extra?: any) => void;
  onSelectConversation?: (conversationId: string) => void;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({
  currentUser,
  onNavigate,
  onSelectConversation
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'likes' | 'comments' | 'social' | 'achievements'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    seedInitialNotifications(currentUser.id).then(() => {
      if (!isMounted) return;
      const unsubscribe = subscribeToNotifications(
        currentUser.id,
        (fetched) => {
          if (!isMounted) return;
          setNotifications(fetched);
          setIsLoading(false);
        },
        (err) => {
          if (!isMounted) return;
          console.warn('Notifications stream notice:', err);
          setIsLoading(false);
        }
      );

      return () => {
        unsubscribe();
      };
    });

    return () => {
      isMounted = false;
    };
  }, [currentUser.id]);

  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      await markNotificationAsRead(id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead(currentUser.id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteNotification(id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = (item: NotificationItem) => {
    // Mark as read
    if (!item.isRead) {
      handleMarkAsRead(item.id);
    }

    // Navigate to target
    if (item.type === 'message' || item.targetType === 'conversation') {
      if (item.targetId && onSelectConversation) {
        onSelectConversation(item.targetId);
      }
      onNavigate('messages');
    } else if (item.type === 'achievement' || item.targetType === 'achievement') {
      onNavigate('achievements');
    } else if (item.type === 'friend_request' || item.type === 'friend_request_accepted' || item.targetType === 'friends') {
      onNavigate('friends');
    } else if (item.type === 'follow' || item.targetType === 'profile') {
      onNavigate('profile');
    } else if (item.type === 'like' || item.type === 'comment' || item.type === 'reply' || item.type === 'mention') {
      onNavigate('home');
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'likes') return n.type === 'like';
    if (filter === 'comments') return n.type === 'comment' || n.type === 'reply' || n.type === 'mention';
    if (filter === 'social') return n.type === 'friend_request' || n.type === 'friend_request_accepted' || n.type === 'follow' || n.type === 'message';
    if (filter === 'achievements') return n.type === 'achievement';
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'like':
        return <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />;
      case 'comment':
        return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case 'reply':
        return <MessageSquare className="w-4 h-4 text-cyan-500" />;
      case 'mention':
        return <AtSign className="w-4 h-4 text-purple-500" />;
      case 'friend_request':
        return <UserPlus className="w-4 h-4 text-[#1768DF]" />;
      case 'friend_request_accepted':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'achievement':
        return <Trophy className="w-4 h-4 text-amber-500 fill-amber-500" />;
      case 'follow':
        return <CheckCircle2 className="w-4 h-4 text-indigo-500" />;
      case 'message':
        return <MessageSquare className="w-4 h-4 text-blue-600 fill-blue-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="max-w-[880px] mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-[#E4E9F2] p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EEF4FE] text-[#1768DF] text-xs font-bold mb-2">
            <Bell className="w-3.5 h-3.5" />
            <span>Activity Stream</span>
            {unreadCount > 0 && (
              <span className="bg-[#1768DF] text-white px-2 py-0.2 rounded-full text-[10px]">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <h1 className="text-2xl font-black text-[#10234A] tracking-tight">Notifications</h1>
          <p className="text-xs text-[#697386] mt-1">
            Real-time alerts for squad invites, post reactions, comments, mentions, and trophies.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            onClick={() => onNavigate('settings')}
            className="px-3 py-2 bg-[#F4F6FC] hover:bg-[#EEF4FE] text-[#697386] hover:text-[#1768DF] text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Notification Preferences"
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Preferences</span>
          </button>

          <button
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
            className="px-4 py-2 bg-[#1768DF] hover:bg-[#1255be] disabled:opacity-40 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark all read</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {[
          { id: 'all', label: 'All Alerts' },
          { id: 'unread', label: `Unread (${unreadCount})` },
          { id: 'likes', label: 'Reactions' },
          { id: 'comments', label: 'Comments & Mentions' },
          { id: 'social', label: 'Squad & Messages' },
          { id: 'achievements', label: 'Trophies' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            className={`px-3.5 py-1.5 rounded-full font-bold transition-all shrink-0 cursor-pointer ${
              filter === tab.id
                ? 'bg-[#1768DF] text-white shadow-xs'
                : 'bg-white text-[#697386] border border-[#E4E9F2] hover:bg-[#F8FAFC]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-3xl border border-[#E4E9F2] shadow-xs divide-y divide-[#F4F6FC] overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="w-12 h-12 rounded-full bg-slate-200 shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-3 bg-slate-200 rounded-sm w-2/3" />
                  <div className="h-2.5 bg-slate-100 rounded-sm w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-12 text-center space-y-3 text-[#697386]">
            <div className="w-12 h-12 rounded-2xl bg-[#F4F6FC] mx-auto flex items-center justify-center text-[#94a3b8]">
              <Bell className="w-6 h-6" />
            </div>
            <p className="font-bold text-xs text-[#10234A]">No notifications in this filter</p>
            <p className="text-[11px]">When other gamers interact with you, updates will stream here live.</p>
          </div>
        ) : (
          filteredNotifications.map((item) => (
            <div
              key={item.id}
              onClick={() => handleNotificationClick(item)}
              className={`p-4 sm:p-5 flex items-start gap-3.5 sm:gap-4 transition-all cursor-pointer group ${
                item.isRead ? 'hover:bg-[#FBFBFE]' : 'bg-[#EEF4FE]/45 hover:bg-[#EEF4FE]/70'
              }`}
            >
              {/* Actor Avatar with event badge */}
              <div className="relative shrink-0">
                <img
                  src={item.actor.avatarUrl}
                  alt={item.actor.name}
                  className="w-11 h-11 rounded-full object-cover ring-2 ring-white shadow-2xs"
                />
                <span className="absolute -bottom-1 -right-1 p-1 bg-white rounded-full shadow-xs border border-slate-100">
                  {getIcon(item.type)}
                </span>
              </div>

              {/* Notification Content */}
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-[#172033] leading-relaxed">
                  <strong className="font-bold text-[#10234A]">{item.actor.name}</strong>{' '}
                  <span className="text-[#334155]">{item.content}</span>
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] text-[#94a3b8] font-medium">{item.timestamp}</span>
                  <span className="text-[10px] text-[#1768DF] font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                    <span>View</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>

              {/* Actions & Unread indicator */}
              <div className="flex items-center gap-2 shrink-0 self-center">
                {!item.isRead && (
                  <button
                    onClick={(e) => handleMarkAsRead(item.id, e)}
                    className="p-1.5 text-[#1768DF] hover:bg-white rounded-lg transition-colors cursor-pointer"
                    title="Mark as read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={(e) => handleDelete(item.id, e)}
                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-white rounded-lg transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                  title="Remove alert"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                {!item.isRead && (
                  <span className="w-2.5 h-2.5 bg-[#1768DF] rounded-full shrink-0" />
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
