import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Unsubscribe,
  serverTimestamp
} from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/errorHandler';
import { Conversation, ChatMessage, ConversationParticipant, GamerProfile } from '../types';
import { INITIAL_CONVERSATIONS, SUGGESTED_GAMERS } from './mockData';
import { notifyNewMessage } from './notificationService';

/**
 * Format timestamp nicely for messages
 */
export function formatMessageTime(date: Date = new Date()): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * Seed initial conversations for a gamer so there is lively chat data out of the box
 */
export async function seedInitialConversations(user: GamerProfile): Promise<void> {
  // Only execute Firestore operations if auth is ready and user is authenticated
  if (!auth.currentUser) return;
  try {
    const alexGamer = SUGGESTED_GAMERS[0];
    const marcusGamer = SUGGESTED_GAMERS[1];
    const elenaGamer = SUGGESTED_GAMERS[2];

    const conv1Id = `conv_direct_${user.id}_${alexGamer.id}`;
    const conv2Id = `conv_direct_${user.id}_${marcusGamer.id}`;
    const groupConvId = `conv_group_apex_squad_${user.id}`;

    // Direct Conversation 1: Alex Chen
    const conv1Ref = doc(db, 'conversations', conv1Id);
    const snap1 = await getDoc(conv1Ref);
    if (!snap1.exists()) {
      const alexParticipant: ConversationParticipant = {
        id: alexGamer.id,
        displayName: alexGamer.name,
        username: alexGamer.username,
        avatarUrl: alexGamer.avatarUrl,
        isOnline: true,
        lastActive: 'In Game: Valorant Ranked'
      };
      const userParticipant: ConversationParticipant = {
        id: user.id,
        displayName: user.displayName,
        username: user.username,
        avatarUrl: user.avatarUrl,
        isOnline: true
      };

      await setDoc(conv1Ref, {
        id: conv1Id,
        type: 'direct',
        participantIds: [user.id, alexGamer.id],
        participants: [userParticipant, alexParticipant],
        lastMessage: 'Yo! Ready for the Valorant tournament qualifiers tonight?',
        lastMessageSenderId: alexGamer.id,
        lastMessageTime: '10:42 AM',
        updatedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        unreadCounts: { [user.id]: 1, [alexGamer.id]: 0 },
        readBy: [alexGamer.id]
      });

      // Add sample initial messages in subcollection
      const m1Ref = doc(db, 'conversations', conv1Id, 'messages', `msg_${conv1Id}_1`);
      await setDoc(m1Ref, {
        id: `msg_${conv1Id}_1`,
        conversationId: conv1Id,
        senderId: alexGamer.id,
        senderName: alexGamer.name,
        senderUsername: alexGamer.username,
        senderAvatar: alexGamer.avatarUrl,
        text: 'Hey! Loved your clip on the Haven site retake yesterday 🔥',
        timestamp: '10:38 AM',
        createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
        isRead: true,
        readBy: [alexGamer.id, user.id]
      });

      const m2Ref = doc(db, 'conversations', conv1Id, 'messages', `msg_${conv1Id}_2`);
      await setDoc(m2Ref, {
        id: `msg_${conv1Id}_2`,
        conversationId: conv1Id,
        senderId: alexGamer.id,
        senderName: alexGamer.name,
        senderUsername: alexGamer.username,
        senderAvatar: alexGamer.avatarUrl,
        text: 'Yo! Ready for the Valorant tournament qualifiers tonight?',
        timestamp: '10:42 AM',
        createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        isRead: false,
        readBy: [alexGamer.id]
      });
    }

    // Direct Conversation 2: Marcus Vance
    const conv2Ref = doc(db, 'conversations', conv2Id);
    const snap2 = await getDoc(conv2Ref);
    if (!snap2.exists()) {
      const marcusParticipant: ConversationParticipant = {
        id: marcusGamer.id,
        displayName: marcusGamer.name,
        username: marcusGamer.username,
        avatarUrl: marcusGamer.avatarUrl,
        isOnline: false,
        lastActive: 'Offline (2 hours ago)'
      };
      const userParticipant: ConversationParticipant = {
        id: user.id,
        displayName: user.displayName,
        username: user.username,
        avatarUrl: user.avatarUrl,
        isOnline: true
      };

      await setDoc(conv2Ref, {
        id: conv2Id,
        type: 'direct',
        participantIds: [user.id, marcusGamer.id],
        participants: [userParticipant, marcusParticipant],
        lastMessage: 'Sent you the Discord invite for our scrims room.',
        lastMessageSenderId: marcusGamer.id,
        lastMessageTime: 'Yesterday',
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        unreadCounts: { [user.id]: 0, [marcusGamer.id]: 0 },
        readBy: [marcusGamer.id, user.id]
      });

      const m3Ref = doc(db, 'conversations', conv2Id, 'messages', `msg_${conv2Id}_1`);
      await setDoc(m3Ref, {
        id: `msg_${conv2Id}_1`,
        conversationId: conv2Id,
        senderId: marcusGamer.id,
        senderName: marcusGamer.name,
        senderUsername: marcusGamer.username,
        senderAvatar: marcusGamer.avatarUrl,
        text: 'Sent you the Discord invite for our scrims room.',
        timestamp: 'Yesterday',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        isRead: true,
        readBy: [marcusGamer.id, user.id]
      });
    }

    // Group Conversation: Apex Champions Squad
    const groupRef = doc(db, 'conversations', groupConvId);
    const snapGroup = await getDoc(groupRef);
    if (!snapGroup.exists()) {
      const groupParticipants: ConversationParticipant[] = [
        {
          id: user.id,
          displayName: user.displayName,
          username: user.username,
          avatarUrl: user.avatarUrl,
          isOnline: true
        },
        {
          id: alexGamer.id,
          displayName: alexGamer.name,
          username: alexGamer.username,
          avatarUrl: alexGamer.avatarUrl,
          isOnline: true
        },
        {
          id: elenaGamer.id,
          displayName: elenaGamer.name,
          username: elenaGamer.username,
          avatarUrl: elenaGamer.avatarUrl,
          isOnline: true
        }
      ];

      await setDoc(groupRef, {
        id: groupConvId,
        type: 'group',
        name: 'Apex Predator Squad 🏆',
        gameTag: 'Apex Legends',
        avatarUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=150&q=80',
        creatorId: user.id,
        adminIds: [user.id],
        participantIds: [user.id, alexGamer.id, elenaGamer.id],
        participants: groupParticipants,
        lastMessage: 'Elena: Ranked session tonight at 8 PM EST. Lock in!',
        lastMessageSenderId: elenaGamer.id,
        lastMessageTime: '01:15 PM',
        updatedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        unreadCounts: { [user.id]: 1, [alexGamer.id]: 0, [elenaGamer.id]: 0 },
        readBy: [elenaGamer.id]
      });

      const mGroupRef = doc(db, 'conversations', groupConvId, 'messages', `msg_${groupConvId}_1`);
      await setDoc(mGroupRef, {
        id: `msg_${groupConvId}_1`,
        conversationId: groupConvId,
        senderId: elenaGamer.id,
        senderName: elenaGamer.name,
        senderUsername: elenaGamer.username,
        senderAvatar: elenaGamer.avatarUrl,
        text: 'Ranked session tonight at 8 PM EST. Lock in!',
        timestamp: '01:15 PM',
        createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        isRead: false,
        readBy: [elenaGamer.id]
      });
    }
  } catch (err) {
    console.warn('Seed conversations notice (non-fatal):', err);
  }
}

/**
 * Real-time subscription to conversations where current user is a participant
 */
export function subscribeToConversations(
  userId: string,
  onUpdate: (conversations: Conversation[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  // CRITICAL: Only attach onSnapshot listeners if auth is ready and user is authenticated
  if (!auth.currentUser) {
    onUpdate(INITIAL_CONVERSATIONS);
    return () => {};
  }

  try {
    const convsRef = collection(db, 'conversations');
    const q = query(
      convsRef,
      where('participantIds', 'array-contains', userId)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const convList: Conversation[] = snapshot.docs.map((d) => {
          const data = d.data() as any;
          const participants: ConversationParticipant[] = data.participants || [];

          // Determine other participant for 1-to-1 representation
          const otherParticipant =
            participants.find((p) => p.id !== userId) ||
            participants[0] || {
              id: 'unknown',
              displayName: data.name || 'Gamer',
              username: 'gamer',
              avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
              isOnline: false
            };

          const userUnread = (data.unreadCounts && data.unreadCounts[userId]) || 0;

          return {
            id: d.id,
            type: data.type || 'direct',
            name: data.name,
            avatarUrl: data.avatarUrl,
            gameTag: data.gameTag,
            participantIds: data.participantIds || [userId],
            participants,
            creatorId: data.creatorId,
            adminIds: data.adminIds || [],
            lastMessage: data.lastMessage || 'No messages yet',
            lastMessageSenderId: data.lastMessageSenderId,
            lastMessageTime: data.lastMessageTime || '',
            updatedAt: data.updatedAt,
            unreadCount: userUnread,
            unreadCounts: data.unreadCounts || {},
            readBy: data.readBy || [],
            participant: data.type === 'group'
              ? {
                  id: d.id,
                  displayName: data.name || 'Gaming Squad',
                  username: `${participants.length} members`,
                  avatarUrl: data.avatarUrl || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=150&q=80',
                  isOnline: true
                }
              : otherParticipant,
            messages: []
          };
        });

        // Sort latest updated first
        convList.sort((a, b) => {
          const timeA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
          const timeB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
          return timeB - timeA;
        });

        onUpdate(convList);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'conversations');
        if (onError) onError(error);
      }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'conversations');
    return () => {};
  }
}

/**
 * Real-time subscription to messages inside a specific conversation
 */
export function subscribeToMessages(
  conversationId: string,
  onUpdate: (messages: ChatMessage[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  // CRITICAL: Only attach onSnapshot listeners if auth is ready and user is authenticated
  if (!auth.currentUser) {
    const demoConv = INITIAL_CONVERSATIONS.find((c) => c.id === conversationId);
    onUpdate(demoConv?.messages || []);
    return () => {};
  }

  try {
    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    const q = query(messagesRef, limit(100));

    return onSnapshot(
      q,
      (snapshot) => {
        const msgs: ChatMessage[] = snapshot.docs.map((d) => {
          const data = d.data() as any;
          return {
            id: d.id,
            conversationId,
            senderId: data.senderId,
            senderName: data.senderName,
            senderUsername: data.senderUsername,
            senderAvatar: data.senderAvatar,
            text: data.text,
            timestamp: data.timestamp || formatMessageTime(data.createdAt ? new Date(data.createdAt) : undefined),
            createdAt: data.createdAt,
            isRead: Boolean(data.isRead),
            readBy: data.readBy || []
          };
        });

        // Sort by createdAt ascending (chronological chat flow)
        msgs.sort((a, b) => {
          const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return timeA - timeB;
        });

        onUpdate(msgs);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, `conversations/${conversationId}/messages`);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, `conversations/${conversationId}/messages`);
    return () => {};
  }
}

/**
 * Send a message in a conversation with real-time sync, unread counters, and notification generation
 */
export async function sendChatMessage(
  conversationId: string,
  sender: GamerProfile,
  text: string,
  targetConversation?: Conversation
): Promise<ChatMessage> {
  const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date();
  const timeStr = formatMessageTime(now);
  const nowIso = now.toISOString();

  const newMessage: ChatMessage = {
    id: messageId,
    conversationId,
    senderId: sender.id,
    senderName: sender.displayName,
    senderUsername: sender.username,
    senderAvatar: sender.avatarUrl,
    text: text.trim(),
    timestamp: timeStr,
    createdAt: nowIso,
    isRead: false,
    readBy: [sender.id]
  };

  try {
    // 1. Write message document to subcollection
    const msgRef = doc(db, 'conversations', conversationId, 'messages', messageId);
    await setDoc(msgRef, newMessage);

    // 2. Fetch conversation to update metadata and unread counts
    const convRef = doc(db, 'conversations', conversationId);
    const convSnap = await getDoc(convRef);

    if (convSnap.exists()) {
      const convData = convSnap.data() as any;
      const participantIds: string[] = convData.participantIds || [];
      const updatedUnreadCounts = { ...(convData.unreadCounts || {}) };

      // Increment unread count for everyone except the sender
      participantIds.forEach((pid) => {
        if (pid !== sender.id) {
          updatedUnreadCounts[pid] = (updatedUnreadCounts[pid] || 0) + 1;

          // Trigger real-time notification for recipient
          notifyNewMessage(
            pid,
            {
              id: sender.id,
              name: sender.displayName,
              username: sender.username,
              avatarUrl: sender.avatarUrl
            },
            text.trim(),
            conversationId
          ).catch((e) => console.warn('Message notification failed:', e));
        } else {
          updatedUnreadCounts[pid] = 0;
        }
      });

      const displaySnippet = convData.type === 'group'
        ? `${sender.displayName.split(' ')[0]}: ${text.trim()}`
        : text.trim();

      await updateDoc(convRef, {
        lastMessage: displaySnippet,
        lastMessageSenderId: sender.id,
        lastMessageTime: timeStr,
        updatedAt: nowIso,
        unreadCounts: updatedUnreadCounts,
        readBy: [sender.id]
      });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `conversations/${conversationId}/messages/${messageId}`);
  }

  return newMessage;
}

/**
 * Mark a conversation as read for the current user
 */
export async function markConversationAsRead(
  conversationId: string,
  userId: string
): Promise<void> {
  try {
    const convRef = doc(db, 'conversations', conversationId);
    const snap = await getDoc(convRef);
    if (!snap.exists()) return;

    const data = snap.data() as any;
    const currentUnreads = { ...(data.unreadCounts || {}) };
    currentUnreads[userId] = 0;

    const readBy: string[] = Array.from(new Set([...(data.readBy || []), userId]));

    await updateDoc(convRef, {
      unreadCounts: currentUnreads,
      readBy
    });
  } catch (err) {
    // Non-fatal, prevent blocking UI
    console.warn('markConversationAsRead notice:', err);
  }
}

/**
 * Create a new direct 1-to-1 conversation or return existing
 */
export async function getOrCreateDirectConversation(
  currentUser: GamerProfile,
  targetUser: { id: string; displayName: string; username: string; avatarUrl: string; isOnline?: boolean }
): Promise<string> {
  const conversationId = `conv_direct_${[currentUser.id, targetUser.id].sort().join('_')}`;
  const convRef = doc(db, 'conversations', conversationId);

  try {
    const snap = await getDoc(convRef);
    if (snap.exists()) {
      return conversationId;
    }

    const participants: ConversationParticipant[] = [
      {
        id: currentUser.id,
        displayName: currentUser.displayName,
        username: currentUser.username,
        avatarUrl: currentUser.avatarUrl,
        isOnline: true
      },
      {
        id: targetUser.id,
        displayName: targetUser.displayName,
        username: targetUser.username,
        avatarUrl: targetUser.avatarUrl,
        isOnline: targetUser.isOnline ?? true
      }
    ];

    await setDoc(convRef, {
      id: conversationId,
      type: 'direct',
      participantIds: [currentUser.id, targetUser.id],
      participants,
      lastMessage: 'Started a new conversation',
      lastMessageSenderId: currentUser.id,
      lastMessageTime: formatMessageTime(),
      updatedAt: new Date().toISOString(),
      unreadCounts: { [currentUser.id]: 0, [targetUser.id]: 0 },
      readBy: [currentUser.id]
    });

    return conversationId;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `conversations/${conversationId}`);
    return conversationId;
  }
}

/**
 * Create a new group conversation
 */
export async function createGroupConversation(
  creator: GamerProfile,
  name: string,
  participants: ConversationParticipant[],
  gameTag?: string,
  avatarUrl?: string
): Promise<string> {
  const groupConvId = `conv_group_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date();

  const allParticipants = [
    {
      id: creator.id,
      displayName: creator.displayName,
      username: creator.username,
      avatarUrl: creator.avatarUrl,
      isOnline: true
    },
    ...participants.filter((p) => p.id !== creator.id)
  ];

  const participantIds = allParticipants.map((p) => p.id);
  const unreadCounts: { [key: string]: number } = {};
  participantIds.forEach((id) => (unreadCounts[id] = 0));

  const groupPayload = {
    id: groupConvId,
    type: 'group',
    name: name.trim(),
    gameTag: gameTag?.trim() || 'All Games',
    avatarUrl: avatarUrl || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=150&q=80',
    creatorId: creator.id,
    adminIds: [creator.id],
    participantIds,
    participants: allParticipants,
    lastMessage: `${creator.displayName} created the group "${name.trim()}"`,
    lastMessageSenderId: creator.id,
    lastMessageTime: formatMessageTime(now),
    updatedAt: now.toISOString(),
    unreadCounts,
    readBy: [creator.id]
  };

  try {
    const groupRef = doc(db, 'conversations', groupConvId);
    await setDoc(groupRef, groupPayload);

    // Initial system announcement message
    const msgRef = doc(db, 'conversations', groupConvId, 'messages', `msg_init_${Date.now()}`);
    await setDoc(msgRef, {
      id: `msg_init_${Date.now()}`,
      conversationId: groupConvId,
      senderId: creator.id,
      senderName: creator.displayName,
      senderUsername: creator.username,
      senderAvatar: creator.avatarUrl,
      text: `🎮 Welcome everyone to ${name.trim()}! Let's game together.`,
      timestamp: formatMessageTime(now),
      createdAt: now.toISOString(),
      isRead: true,
      readBy: [creator.id]
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `conversations/${groupConvId}`);
  }

  return groupConvId;
}

/**
 * Add a participant to a group conversation
 */
export async function addGroupParticipant(
  conversationId: string,
  newParticipant: ConversationParticipant
): Promise<void> {
  try {
    const convRef = doc(db, 'conversations', conversationId);
    const snap = await getDoc(convRef);
    if (!snap.exists()) return;

    const data = snap.data() as any;
    const currentParticipants: ConversationParticipant[] = data.participants || [];
    const currentIds: string[] = data.participantIds || [];

    if (currentIds.includes(newParticipant.id)) return;

    const updatedParticipants = [...currentParticipants, newParticipant];
    const updatedIds = [...currentIds, newParticipant.id];
    const updatedUnreads = { ...(data.unreadCounts || {}), [newParticipant.id]: 0 };

    await updateDoc(convRef, {
      participants: updatedParticipants,
      participantIds: updatedIds,
      unreadCounts: updatedUnreads
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `conversations/${conversationId}`);
  }
}

/**
 * Remove a participant from a group conversation
 */
export async function removeGroupParticipant(
  conversationId: string,
  participantIdToRemove: string
): Promise<void> {
  try {
    const convRef = doc(db, 'conversations', conversationId);
    const snap = await getDoc(convRef);
    if (!snap.exists()) return;

    const data = snap.data() as any;
    const updatedParticipants = (data.participants || []).filter((p: any) => p.id !== participantIdToRemove);
    const updatedIds = (data.participantIds || []).filter((id: string) => id !== participantIdToRemove);

    await updateDoc(convRef, {
      participants: updatedParticipants,
      participantIds: updatedIds
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `conversations/${conversationId}`);
  }
}
