import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  updateDoc,
  getDoc
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/errorHandler';
import { GamingPost, GamingPostComment } from '../types';
import { INITIAL_POSTS } from './mockData';

// Helper to sanitize post object for Firestore
function serializePost(post: GamingPost) {
  return {
    id: post.id,
    author: {
      id: post.author.id,
      username: post.author.username,
      displayName: post.author.displayName,
      avatarUrl: post.author.avatarUrl,
      isVerified: Boolean(post.author.isVerified)
    },
    content: post.content,
    gameTag: post.gameTag || '',
    tags: post.tags || [],
    timestamp: post.timestamp || 'Just now',
    createdAt: post.createdAt || new Date().toISOString(),
    editedAt: post.editedAt || null,
    mediaUrl: post.mediaUrl || '',
    mediaType: post.mediaType || '',
    badgeTitle: post.badgeTitle || '',
    postType: post.postType || 'status',
    visibility: post.visibility || 'public',
    likesCount: post.reactions.likes || 0,
    heartsCount: post.reactions.hearts || 0,
    firesCount: post.reactions.fires || 0,
    commentsCount: post.commentsCount || 0,
    sharesCount: post.sharesCount || 0
  };
}

/**
 * Fetch social feed posts with real Firestore persistence and seed reconciliation.
 * Refreshing the page preserves all created, edited, and deleted posts!
 */
export async function fetchFeedPosts(): Promise<GamingPost[]> {
  try {
    const postsRef = collection(db, 'posts');
    const q = query(postsRef, limit(40));
    const snap = await getDocs(q);

    if (snap.empty) {
      // Seed initial posts into Firestore so there's always rich starting data
      const seeded: GamingPost[] = [...INITIAL_POSTS];
      for (const p of seeded) {
        try {
          await setDoc(doc(db, 'posts', p.id), serializePost(p), { merge: true });
        } catch {
          // ignore seed errors
        }
      }
      return seeded;
    }

    // Map documents to GamingPost
    const fetchedPosts: GamingPost[] = snap.docs.map((d) => {
      const data = d.data() as any;
      return {
        id: d.id,
        author: {
          id: data.author?.id || 'unknown',
          username: data.author?.username || 'gamer',
          displayName: data.author?.displayName || 'GameOut Player',
          avatarUrl: data.author?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
          isVerified: Boolean(data.author?.isVerified)
        },
        content: data.content || '',
        gameTag: data.gameTag || '',
        tags: data.tags || [],
        timestamp: data.timestamp || 'Recent',
        createdAt: data.createdAt,
        editedAt: data.editedAt,
        mediaUrl: data.mediaUrl || undefined,
        mediaType: data.mediaType || undefined,
        badgeTitle: data.badgeTitle || undefined,
        postType: data.postType || 'status',
        visibility: data.visibility || 'public',
        reactions: {
          likes: data.likesCount || 0,
          hearts: data.heartsCount || 0,
          fires: data.firesCount || 0,
          userReaction: null
        },
        commentsCount: data.commentsCount || 0,
        sharesCount: data.sharesCount || 0,
        comments: []
      };
    });

    // Sort newest first by createdAt or fallback
    fetchedPosts.sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });

    return fetchedPosts;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'posts');
    return INITIAL_POSTS;
  }
}

/**
 * Creates or updates a post in Firestore
 */
export async function savePostToFirestore(post: GamingPost): Promise<void> {
  try {
    const postDocRef = doc(db, 'posts', post.id);
    await setDoc(postDocRef, serializePost(post), { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `posts/${post.id}`);
  }
}

/**
 * Deletes a post from Firestore
 */
export async function deletePostFromFirestore(postId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'posts', postId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `posts/${postId}`);
  }
}

/**
 * Adds a comment to a post in Firestore and increments comment counter
 */
export async function addCommentToFirestore(
  postId: string,
  comment: GamingPostComment
): Promise<void> {
  try {
    // 1. Write comment document
    const commentRef = doc(db, 'comments', comment.id);
    await setDoc(commentRef, {
      id: comment.id,
      postId,
      author: comment.author,
      content: comment.content,
      parentId: comment.parentId || null,
      timestamp: comment.timestamp || 'Just now',
      createdAt: new Date().toISOString(),
      likesCount: 0
    });

    // 2. Increment post commentsCount
    const postRef = doc(db, 'posts', postId);
    const postSnap = await getDoc(postRef);
    if (postSnap.exists()) {
      const currentCount = postSnap.data().commentsCount || 0;
      await updateDoc(postRef, { commentsCount: currentCount + 1 });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `comments/${comment.id}`);
  }
}

/**
 * Edits an existing comment in Firestore
 */
export async function editCommentInFirestore(
  commentId: string,
  newContent: string
): Promise<void> {
  try {
    const commentRef = doc(db, 'comments', commentId);
    await updateDoc(commentRef, {
      content: newContent,
      editedAt: new Date().toISOString()
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `comments/${commentId}`);
  }
}

/**
 * Deletes a comment in Firestore and decrements post commentsCount
 */
export async function deleteCommentFromFirestore(
  postId: string,
  commentId: string
): Promise<void> {
  try {
    await deleteDoc(doc(db, 'comments', commentId));

    const postRef = doc(db, 'posts', postId);
    const postSnap = await getDoc(postRef);
    if (postSnap.exists()) {
      const currentCount = postSnap.data().commentsCount || 1;
      await updateDoc(postRef, { commentsCount: Math.max(0, currentCount - 1) });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `comments/${commentId}`);
  }
}

/**
 * Fetches comments for a specific post
 */
export async function fetchCommentsForPost(postId: string): Promise<GamingPostComment[]> {
  try {
    const commentsRef = collection(db, 'comments');
    const q = query(commentsRef, where('postId', '==', postId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        postId: data.postId,
        author: data.author,
        content: data.content,
        timestamp: data.timestamp || 'Recent',
        createdAt: data.createdAt,
        editedAt: data.editedAt,
        likesCount: data.likesCount || 0,
        parentId: data.parentId || undefined
      };
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'comments');
    return [];
  }
}

/**
 * Anti-duplicate reaction handling: writes to /likes/{userId}_{postId}
 */
export async function togglePostReaction(
  postId: string,
  userId: string,
  reactionType: 'like' | 'heart' | 'fire',
  currentReaction: 'like' | 'heart' | 'fire' | null,
  currentPost: GamingPost
): Promise<{ userReaction: 'like' | 'heart' | 'fire' | null; reactions: { likes: number; hearts: number; fires: number } }> {
  const likeDocId = `${userId}_${postId}`;
  const likeRef = doc(db, 'likes', likeDocId);

  const updatedReactions = { ...currentPost.reactions };

  // Remove existing reaction count if there was one
  if (currentReaction) {
    if (currentReaction === 'like') updatedReactions.likes = Math.max(0, updatedReactions.likes - 1);
    else if (currentReaction === 'heart') updatedReactions.hearts = Math.max(0, updatedReactions.hearts - 1);
    else if (currentReaction === 'fire') updatedReactions.fires = Math.max(0, updatedReactions.fires - 1);
  }

  let nextReaction: 'like' | 'heart' | 'fire' | null = null;

  if (currentReaction === reactionType) {
    // User clicked the same reaction: UNLIKE
    nextReaction = null;
    try {
      await deleteDoc(likeRef);
    } catch {
      // non-fatal
    }
  } else {
    // User added new reaction
    nextReaction = reactionType;
    if (reactionType === 'like') updatedReactions.likes += 1;
    else if (reactionType === 'heart') updatedReactions.hearts += 1;
    else if (reactionType === 'fire') updatedReactions.fires += 1;

    try {
      await setDoc(likeRef, {
        userId,
        targetId: postId,
        targetType: 'post',
        reactionType,
        createdAt: new Date().toISOString()
      });
    } catch {
      // non-fatal
    }
  }

  // Update counters on post document
  try {
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      likesCount: updatedReactions.likes,
      heartsCount: updatedReactions.hearts,
      firesCount: updatedReactions.fires
    });
  } catch {
    // non-fatal
  }

  return {
    userReaction: nextReaction,
    reactions: updatedReactions
  };
}

/**
 * Bookmark / Save post
 */
export async function toggleSavePost(
  postId: string,
  userId: string,
  isCurrentlySaved: boolean
): Promise<boolean> {
  const saveDocId = `${userId}_${postId}`;
  const saveRef = doc(db, 'savedPosts', saveDocId);

  try {
    if (isCurrentlySaved) {
      await deleteDoc(saveRef);
      return false;
    } else {
      await setDoc(saveRef, {
        userId,
        postId,
        createdAt: new Date().toISOString()
      });
      return true;
    }
  } catch {
    return !isCurrentlySaved;
  }
}

/**
 * Report a post or comment
 */
export async function reportContent(
  reporterId: string,
  targetId: string,
  targetType: 'post' | 'comment',
  reason: string,
  details?: string
): Promise<void> {
  const reportId = `report_${Date.now()}`;
  try {
    await setDoc(doc(db, 'reports', reportId), {
      id: reportId,
      reporterId,
      targetId,
      targetType,
      reason,
      details: details || '',
      status: 'pending_moderation',
      createdAt: new Date().toISOString()
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `reports/${reportId}`);
  }
}
