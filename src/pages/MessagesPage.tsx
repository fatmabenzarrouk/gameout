import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Search,
  Send,
  MoreVertical,
  CheckCheck,
  Check,
  Gamepad2,
  Users,
  Plus,
  UserPlus,
  UserMinus,
  Settings,
  X,
  Info,
  Shield,
  Smile,
  Paperclip,
  Clock,
  Sparkles,
  ArrowLeft,
  Volume2,
  UserCheck
} from 'lucide-react';
import { Conversation, ChatMessage, GamerProfile, ConversationParticipant } from '../types';
import {
  subscribeToConversations,
  subscribeToMessages,
  sendChatMessage,
  markConversationAsRead,
  createGroupConversation,
  addGroupParticipant,
  removeGroupParticipant,
  seedInitialConversations,
  getOrCreateDirectConversation
} from '../services/messagingService';
import { SUGGESTED_GAMERS } from '../services/mockData';

interface MessagesPageProps {
  currentUser: GamerProfile;
  initialSelectedConvId?: string;
  onNavigateToProfile?: (username: string) => void;
  onSwitchTestAccount?: (testUser: GamerProfile) => void;
  allTestAccounts?: GamerProfile[];
}

export const MessagesPage: React.FC<MessagesPageProps> = ({
  currentUser,
  initialSelectedConvId,
  onNavigateToProfile,
  onSwitchTestAccount,
  allTestAccounts = []
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string>(initialSelectedConvId || '');
  const [activeMessages, setActiveMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingConvs, setIsLoadingConvs] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Group modals & drawer
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupGame, setNewGroupGame] = useState('Valorant');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [showGroupDetailsDrawer, setShowGroupDetailsDrawer] = useState(false);
  const [showAddParticipantModal, setShowAddParticipantModal] = useState(false);
  const [participantToAdd, setParticipantToAdd] = useState<string>('');

  // Mobile navigation: toggle between list and active chat
  const [mobileChatOpen, setMobileChatOpen] = useState(Boolean(initialSelectedConvId));

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Seed & Subscribe to Conversations for the current user
  useEffect(() => {
    let isMounted = true;
    setIsLoadingConvs(true);

    seedInitialConversations(currentUser).then(() => {
      if (!isMounted) return;
      const unsubscribe = subscribeToConversations(
        currentUser.id,
        (fetched) => {
          if (!isMounted) return;
          setConversations(fetched);
          setIsLoadingConvs(false);

          // If no conversation selected yet, or current selection is invalid, pick first
          setSelectedConvId((current) => {
            if (current && fetched.some((c) => c.id === current)) return current;
            return fetched[0]?.id || '';
          });
        },
        (err) => {
          if (!isMounted) return;
          console.warn('Conversations subscription error:', err);
          setIsLoadingConvs(false);
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

  // 2. Subscribe to Messages for selected conversation
  useEffect(() => {
    if (!selectedConvId) {
      setActiveMessages([]);
      return;
    }

    setIsLoadingMessages(true);
    let isMounted = true;

    // Mark as read immediately when user views conversation
    markConversationAsRead(selectedConvId, currentUser.id).catch(console.warn);

    const unsubscribe = subscribeToMessages(
      selectedConvId,
      (msgs) => {
        if (!isMounted) return;
        setActiveMessages(msgs);
        setIsLoadingMessages(false);
      },
      (err) => {
        if (!isMounted) return;
        console.warn('Messages subscription error:', err);
        setIsLoadingMessages(false);
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [selectedConvId, currentUser.id]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages]);

  const currentConv = conversations.find((c) => c.id === selectedConvId);

  // Handle message submission
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedConvId || isSending) return;

    const textToSend = inputText.trim();
    setInputText('');
    setIsSending(true);

    try {
      await sendChatMessage(selectedConvId, currentUser, textToSend, currentConv);
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsSending(false);
    }
  };

  // Create Group Handler
  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim() || selectedParticipants.length === 0) return;

    const participantsList: ConversationParticipant[] = SUGGESTED_GAMERS.filter((g) =>
      selectedParticipants.includes(g.id)
    ).map((g) => ({
      id: g.id,
      displayName: g.name,
      username: g.username,
      avatarUrl: g.avatarUrl,
      isOnline: true
    }));

    try {
      const newConvId = await createGroupConversation(
        currentUser,
        newGroupName.trim(),
        participantsList,
        newGroupGame
      );
      setShowCreateGroupModal(false);
      setNewGroupName('');
      setSelectedParticipants([]);
      setSelectedConvId(newConvId);
      setMobileChatOpen(true);
    } catch (err) {
      console.error('Create group failed:', err);
    }
  };

  // Add participant to active group
  const handleAddParticipant = async () => {
    if (!participantToAdd || !currentConv) return;
    const target = SUGGESTED_GAMERS.find((g) => g.id === participantToAdd);
    if (!target) return;

    try {
      await addGroupParticipant(currentConv.id, {
        id: target.id,
        displayName: target.name,
        username: target.username,
        avatarUrl: target.avatarUrl,
        isOnline: true
      });
      setShowAddParticipantModal(false);
      setParticipantToAdd('');
    } catch (err) {
      console.error('Add participant failed:', err);
    }
  };

  // Remove participant from active group
  const handleRemoveParticipant = async (participantId: string) => {
    if (!currentConv) return;
    if (confirm('Remove this gamer from the squad chat?')) {
      try {
        await removeGroupParticipant(currentConv.id, participantId);
      } catch (err) {
        console.error('Remove participant failed:', err);
      }
    }
  };

  // Filter conversations
  const filteredConversations = conversations.filter((c) => {
    const term = searchQuery.toLowerCase();
    const title = c.type === 'group' ? c.name || '' : c.participant.displayName;
    const username = c.type === 'group' ? '' : c.participant.username;
    const lastMsg = c.lastMessage || '';
    return (
      title.toLowerCase().includes(term) ||
      username.toLowerCase().includes(term) ||
      lastMsg.toLowerCase().includes(term)
    );
  });

  const totalUnreadCount = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
  const isGroupAdmin = currentConv?.type === 'group' && (currentConv?.adminIds || []).includes(currentUser.id);

  return (
    <div className="max-w-[1300px] mx-auto px-3 sm:px-6 py-4 space-y-4">
      {/* Top Banner & Multi-Account Test Switcher */}
      <div className="bg-white rounded-2xl border border-[#E4E9F2] p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#EEF4FE] text-[#1768DF]">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-lg text-[#10234A] tracking-tight">Gamer Comms Center</h1>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Firestore Stream
              </span>
            </div>
            <p className="text-xs text-[#697386]">
              Real-time one-to-one and squad chats with instant read receipts & unread counters.
            </p>
          </div>
        </div>

        {/* Dual-User Quick Testing Switcher */}
        {onSwitchTestAccount && allTestAccounts.length > 0 && (
          <div className="bg-[#F8FAFC] border border-[#E4E9F2] p-2 rounded-xl flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold text-[#697386] flex items-center gap-1 pl-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Test Account:</span>
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {allTestAccounts.map((account) => {
                const isSelected = account.id === currentUser.id;
                return (
                  <button
                    key={account.id}
                    onClick={() => onSwitchTestAccount(account)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-[#1768DF] text-white shadow-xs'
                        : 'bg-white hover:bg-[#EEF4FE] text-[#172033] border border-[#E4E9F2]'
                    }`}
                  >
                    <img src={account.avatarUrl} alt="" className="w-4 h-4 rounded-full object-cover" />
                    <span>{account.displayName.split(' ')[0]}</span>
                    {isSelected && <span className="text-[10px] bg-white/20 px-1 rounded-sm">Active</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Main Messaging Layout */}
      <div className="bg-white rounded-3xl border border-[#E4E9F2] shadow-xs overflow-hidden h-[720px] flex flex-col md:flex-row relative">
        {/* Left: Conversation List */}
        <div
          className={`w-full md:w-80 lg:w-[360px] border-r border-[#E4E9F2] flex flex-col bg-white shrink-0 ${
            mobileChatOpen ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* List Header */}
          <div className="p-4 border-b border-[#E4E9F2] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-sm text-[#10234A]">Conversations</h2>
                {totalUnreadCount > 0 && (
                  <span className="bg-[#1768DF] text-white text-[11px] font-bold px-2 py-0.2 rounded-full">
                    {totalUnreadCount} new
                  </span>
                )}
              </div>

              <button
                onClick={() => setShowCreateGroupModal(true)}
                className="px-2.5 py-1.5 bg-[#EEF4FE] hover:bg-[#E0ECFD] text-[#1768DF] text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Create Squad Chat"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Squad</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#697386]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search direct chats & squads..."
                className="w-full pl-9 pr-3 py-2 bg-[#F4F6FC] rounded-xl text-xs text-[#172033] border border-[#E4E9F2] focus:border-[#1768DF] focus:bg-white focus:outline-hidden transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-[#697386] hover:text-[#172033]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Conversations Scroll Area */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#F8FAFC]">
            {isLoadingConvs ? (
              <div className="p-8 space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-3 animate-pulse">
                    <div className="w-12 h-12 rounded-full bg-slate-200 shrink-0" />
                    <div className="space-y-2 flex-1">
                      <div className="h-3 bg-slate-200 rounded-sm w-3/4" />
                      <div className="h-2.5 bg-slate-100 rounded-sm w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center space-y-3 text-[#697386]">
                <div className="w-12 h-12 rounded-2xl bg-[#F4F6FC] mx-auto flex items-center justify-center text-[#94a3b8]">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <p className="text-xs font-semibold">
                  {searchQuery ? `No chats found matching "${searchQuery}"` : 'No active conversations yet'}
                </p>
                <p className="text-[11px]">Start a squad group or connect with fellow gamers.</p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = conv.id === selectedConvId;
                const isGroup = conv.type === 'group';
                const displayName = isGroup ? conv.name : conv.participant.displayName;
                const avatar = isGroup ? conv.avatarUrl : conv.participant.avatarUrl;
                const isOnline = isGroup ? true : conv.participant.isOnline;
                const unread = conv.unreadCount || 0;

                return (
                  <div
                    key={conv.id}
                    onClick={() => {
                      setSelectedConvId(conv.id);
                      setMobileChatOpen(true);
                      markConversationAsRead(conv.id, currentUser.id).catch(console.warn);
                    }}
                    className={`p-3.5 sm:p-4 flex items-start gap-3 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#EEF4FE] border-l-4 border-[#1768DF]'
                        : 'hover:bg-[#F8FAFC]'
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <img
                        src={avatar}
                        alt={displayName}
                        className={`w-12 h-12 object-cover ring-2 ring-white ${
                          isGroup ? 'rounded-2xl' : 'rounded-full'
                        }`}
                      />
                      {isOnline && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#16A36A] ring-2 ring-white rounded-full" />
                      )}
                      {isGroup && (
                        <span className="absolute -top-1 -right-1 bg-[#10234A] text-white p-0.5 rounded-md shadow-xs">
                          <Users className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>

                    {/* Meta */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-bold text-xs text-[#172033] truncate flex items-center gap-1">
                          <span className="truncate">{displayName}</span>
                          {conv.gameTag && (
                            <span className="text-[9px] bg-slate-100 text-[#697386] px-1.5 py-0.2 rounded-md font-medium shrink-0">
                              {conv.gameTag}
                            </span>
                          )}
                        </h3>
                        <span className="text-[10px] text-[#94a3b8] shrink-0 font-medium">
                          {conv.lastMessageTime}
                        </span>
                      </div>

                      <p
                        className={`text-xs truncate ${
                          unread > 0 ? 'font-bold text-[#10234A]' : 'text-[#697386]'
                        }`}
                      >
                        {conv.lastMessage}
                      </p>
                    </div>

                    {/* Unread Pill */}
                    {unread > 0 && (
                      <span className="bg-[#1768DF] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 shadow-xs animate-in zoom-in">
                        {unread}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Active Chat View */}
        <div
          className={`flex-1 flex flex-col bg-[#F9FAFD] ${
            mobileChatOpen ? 'flex' : 'hidden md:flex'
          }`}
        >
          {currentConv ? (
            <>
              {/* Active Chat Header */}
              <div className="p-3.5 sm:p-4 bg-white border-b border-[#E4E9F2] flex items-center justify-between gap-3 shadow-2xs z-10">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Back button on mobile */}
                  <button
                    onClick={() => setMobileChatOpen(false)}
                    className="p-1.5 rounded-xl hover:bg-[#F4F6FC] text-[#697386] md:hidden cursor-pointer"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  <div className="relative shrink-0">
                    <img
                      src={currentConv.type === 'group' ? currentConv.avatarUrl : currentConv.participant.avatarUrl}
                      alt=""
                      className={`w-10 h-10 object-cover ring-2 ring-[#E4E9F2] ${
                        currentConv.type === 'group' ? 'rounded-xl' : 'rounded-full'
                      }`}
                    />
                    {(currentConv.type === 'group' || currentConv.participant.isOnline) && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#16A36A] ring-2 ring-white rounded-full" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="font-bold text-sm text-[#172033] truncate">
                        {currentConv.type === 'group' ? currentConv.name : currentConv.participant.displayName}
                      </h2>
                      {currentConv.type === 'group' ? (
                        <span className="text-[10px] font-bold bg-[#EEF4FE] text-[#1768DF] px-2 py-0.2 rounded-full">
                          Squad ({currentConv.participants?.length || 3})
                        </span>
                      ) : (
                        <span className="text-[11px] text-[#697386]">@{currentConv.participant.username}</span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#697386] truncate">
                      {currentConv.type === 'group'
                        ? currentConv.gameTag || 'Squad Chat'
                        : currentConv.participant.isOnline
                        ? '🟢 Online & Ready to Play'
                        : currentConv.participant.lastActive || 'Offline'}
                    </p>
                  </div>
                </div>

                {/* Header Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {currentConv.type === 'group' && (
                    <button
                      onClick={() => setShowGroupDetailsDrawer(!showGroupDetailsDrawer)}
                      className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        showGroupDetailsDrawer
                          ? 'bg-[#EEF4FE] text-[#1768DF]'
                          : 'text-[#697386] hover:bg-[#F4F6FC]'
                      }`}
                      title="Squad details and members"
                    >
                      <Users className="w-4 h-4" />
                      <span className="hidden sm:inline">Squad Info</span>
                    </button>
                  )}

                  {currentConv.type === 'direct' && onNavigateToProfile && (
                    <button
                      onClick={() => onNavigateToProfile(currentConv.participant.username)}
                      className="p-2 text-[#697386] hover:text-[#1768DF] hover:bg-[#F4F6FC] rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                      title="View Gamer Profile"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span className="hidden sm:inline">Profile</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Chat Messages Log */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                {/* Security and Encryption Header */}
                <div className="text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8] bg-white px-3.5 py-1 rounded-full border border-[#E4E9F2] shadow-2xs">
                    🔒 GameOut Secure Real-Time Session
                  </span>
                </div>

                {isLoadingMessages ? (
                  <div className="flex items-center justify-center py-12 text-[#697386] text-xs gap-2">
                    <div className="w-4 h-4 border-2 border-[#1768DF] border-t-transparent rounded-full animate-spin" />
                    <span>Hydrating messages stream...</span>
                  </div>
                ) : activeMessages.length === 0 ? (
                  <div className="text-center py-12 space-y-2 text-[#697386]">
                    <div className="w-12 h-12 bg-white border border-[#E4E9F2] rounded-2xl mx-auto flex items-center justify-center text-[#1768DF]">
                      <Gamepad2 className="w-6 h-6" />
                    </div>
                    <p className="font-bold text-xs text-[#172033]">No messages yet</p>
                    <p className="text-[11px]">Send a friendly cheer or invite them to a squad session!</p>
                  </div>
                ) : (
                  activeMessages.map((msg, idx) => {
                    const isMe = msg.senderId === currentUser.id;
                    const isGroup = currentConv.type === 'group';

                    return (
                      <div
                        key={msg.id || idx}
                        className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        {!isMe && (
                          <img
                            src={msg.senderAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                            alt={msg.senderName}
                            className="w-7 h-7 rounded-full object-cover mb-1 ring-1 ring-slate-200 shrink-0"
                            title={msg.senderName}
                          />
                        )}

                        <div className="max-w-[78%] sm:max-w-md">
                          {/* Sender name for group chats */}
                          {!isMe && isGroup && (
                            <span className="text-[10px] font-bold text-[#697386] ml-1 mb-0.5 block">
                              {msg.senderName}
                            </span>
                          )}

                          <div
                            className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-2xs ${
                              isMe
                                ? 'bg-[#1768DF] text-white rounded-br-xs font-medium'
                                : 'bg-white text-[#172033] border border-[#E4E9F2] rounded-bl-xs'
                            }`}
                          >
                            <p className="break-words whitespace-pre-wrap">{msg.text}</p>
                            <div
                              className={`text-[10px] mt-1.5 flex items-center justify-end gap-1 ${
                                isMe ? 'text-blue-200' : 'text-[#94a3b8]'
                              }`}
                            >
                              <span>{msg.timestamp}</span>
                              {isMe && (
                                <span title={msg.isRead ? 'Read by recipient' : 'Sent'}>
                                  {msg.isRead ? (
                                    <CheckCheck className="w-3.5 h-3.5 text-blue-100" />
                                  ) : (
                                    <Check className="w-3.5 h-3.5 text-blue-200" />
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Bar */}
              <form
                onSubmit={handleSend}
                className="p-3 sm:p-4 bg-white border-t border-[#E4E9F2] flex items-center gap-2"
              >
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={`Message ${
                      currentConv.type === 'group'
                        ? currentConv.name
                        : currentConv.participant.displayName
                    }...`}
                    className="w-full px-4 py-2.5 bg-[#F4F6FC] rounded-2xl text-xs sm:text-sm text-[#172033] border border-[#E4E9F2] focus:border-[#1768DF] focus:bg-white focus:outline-hidden transition-all pr-10"
                  />
                  <div className="absolute right-3 top-2.5 text-[#94a3b8] flex items-center gap-1">
                    <Gamepad2 className="w-4 h-4 hover:text-[#1768DF] cursor-pointer transition-colors" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!inputText.trim() || isSending}
                  className="p-2.5 sm:px-4 sm:py-2.5 bg-[#1768DF] hover:bg-[#1255be] disabled:opacity-40 text-white rounded-2xl transition-all cursor-pointer flex items-center gap-1.5 font-bold text-xs shrink-0 shadow-xs"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">{isSending ? 'Sending...' : 'Send'}</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-[#697386] space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-white border border-[#E4E9F2] flex items-center justify-center text-[#1768DF] shadow-xs">
                <MessageSquare className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-base text-[#10234A]">Select a conversation</h3>
              <p className="text-xs max-w-sm">
                Choose a direct chat or squad room from the left to start coordinating your gaming matches.
              </p>
            </div>
          )}
        </div>

        {/* Group Details Drawer (Slide-in panel for Group chats) */}
        {showGroupDetailsDrawer && currentConv?.type === 'group' && (
          <div className="w-72 bg-white border-l border-[#E4E9F2] flex flex-col p-4 space-y-4 absolute right-0 top-0 bottom-0 shadow-xl z-20 animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between border-b border-[#E4E9F2] pb-3">
              <h3 className="font-bold text-sm text-[#10234A] flex items-center gap-2">
                <Users className="w-4 h-4 text-[#1768DF]" />
                <span>Squad Members</span>
              </h3>
              <button
                onClick={() => setShowGroupDetailsDrawer(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-[#697386]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center space-y-2 py-2">
              <img
                src={currentConv.avatarUrl}
                alt=""
                className="w-16 h-16 rounded-2xl object-cover mx-auto ring-2 ring-[#E4E9F2]"
              />
              <h4 className="font-bold text-xs text-[#172033]">{currentConv.name}</h4>
              <span className="text-[10px] bg-blue-50 text-[#1768DF] font-bold px-2 py-0.5 rounded-full">
                {currentConv.gameTag || 'Gaming Squad'}
              </span>
            </div>

            {/* Add Member button for admins */}
            <button
              onClick={() => setShowAddParticipantModal(true)}
              className="w-full py-2 px-3 bg-[#EEF4FE] hover:bg-[#E0ECFD] text-[#1768DF] font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Gamer to Squad</span>
            </button>

            {/* Members List */}
            <div className="flex-1 overflow-y-auto space-y-2 divide-y divide-slate-100">
              {currentConv.participants?.map((participant) => {
                const isCreator = participant.id === currentConv.creatorId;
                const isMe = participant.id === currentUser.id;

                return (
                  <div key={participant.id} className="pt-2 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <img
                        src={participant.avatarUrl}
                        alt=""
                        className="w-8 h-8 rounded-full object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-[#172033] truncate">
                          {participant.displayName}
                        </div>
                        <div className="text-[10px] text-[#697386] truncate">@{participant.username}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {isCreator && (
                        <span className="text-[9px] bg-amber-50 text-amber-700 font-bold px-1.5 py-0.2 rounded-sm border border-amber-200">
                          Leader
                        </span>
                      )}

                      {/* Remove button if current user is admin and participant is not self */}
                      {isGroupAdmin && !isMe && !isCreator && (
                        <button
                          onClick={() => handleRemoveParticipant(participant.id)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                          title="Remove from squad"
                        >
                          <UserMinus className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* CREATE SQUAD MODAL */}
      {showCreateGroupModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl border border-[#E4E9F2] shadow-2xl max-w-md w-full p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#EEF4FE] text-[#1768DF]">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="font-black text-base text-[#10234A]">Assemble Squad Room</h3>
              </div>
              <button
                onClick={() => setShowCreateGroupModal(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-[#697386] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#172033] mb-1">Squad Name</label>
                <input
                  type="text"
                  required
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="e.g., Valorant Immortals, Raid Team Alpha"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4E9F2] text-xs focus:border-[#1768DF] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#172033] mb-1">Primary Game</label>
                <select
                  value={newGroupGame}
                  onChange={(e) => setNewGroupGame(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4E9F2] text-xs focus:border-[#1768DF] focus:outline-hidden bg-white"
                >
                  <option value="Valorant">Valorant</option>
                  <option value="Apex Legends">Apex Legends</option>
                  <option value="League of Legends">League of Legends</option>
                  <option value="Counter-Strike 2">Counter-Strike 2</option>
                  <option value="Overwatch 2">Overwatch 2</option>
                  <option value="Fortnite">Fortnite</option>
                  <option value="World of Warcraft">World of Warcraft</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#172033] mb-1.5">
                  Invite Squad Members ({selectedParticipants.length} selected)
                </label>
                <div className="max-h-48 overflow-y-auto border border-[#E4E9F2] rounded-xl p-2 space-y-1 divide-y divide-slate-100">
                  {SUGGESTED_GAMERS.map((gamer) => {
                    const isChecked = selectedParticipants.includes(gamer.id);
                    return (
                      <label
                        key={gamer.id}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-[#F4F6FC] cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <img
                            src={gamer.avatarUrl}
                            alt=""
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div>
                            <div className="font-bold text-xs text-[#172033]">{gamer.name}</div>
                            <div className="text-[10px] text-[#697386]">@{gamer.username}</div>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedParticipants([...selectedParticipants, gamer.id]);
                            } else {
                              setSelectedParticipants(selectedParticipants.filter((id) => id !== gamer.id));
                            }
                          }}
                          className="w-4 h-4 rounded text-[#1768DF] focus:ring-[#1768DF]"
                        />
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateGroupModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#697386] hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newGroupName.trim() || selectedParticipants.length === 0}
                  className="px-5 py-2 bg-[#1768DF] hover:bg-[#1255be] disabled:opacity-40 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Create Squad
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD PARTICIPANT MODAL */}
      {showAddParticipantModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl border border-[#E4E9F2] shadow-2xl max-w-sm w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-sm text-[#10234A]">Add Gamer to Squad</h3>
              <button
                onClick={() => setShowAddParticipantModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-[#697386]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#172033]">Select Gamer</label>
              <select
                value={participantToAdd}
                onChange={(e) => setParticipantToAdd(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4E9F2] text-xs focus:border-[#1768DF] focus:outline-hidden bg-white"
              >
                <option value="">-- Choose a gamer --</option>
                {SUGGESTED_GAMERS.filter(
                  (g) => !currentConv?.participantIds?.includes(g.id)
                ).map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name} (@{g.username}) - {g.primaryGame}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddParticipantModal(false)}
                className="px-4 py-2 text-xs font-bold text-[#697386] hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddParticipant}
                disabled={!participantToAdd}
                className="px-4 py-2 bg-[#1768DF] hover:bg-[#1255be] disabled:opacity-40 text-white text-xs font-bold rounded-xl"
              >
                Add Member
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
