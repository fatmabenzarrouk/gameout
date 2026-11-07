import React, { useState } from 'react';
import {
  CheckCircle2,
  MoreHorizontal,
  Globe,
  ThumbsUp,
  Heart,
  Flame,
  MessageSquare,
  Share2,
  Send,
  Bookmark,
  Sparkles,
  Trophy,
  Check,
  Trash2,
  Edit2,
  AlertTriangle,
  Lock,
  CornerDownRight,
  X
} from 'lucide-react';
import { GamingPost, GamerProfile, GamingPostComment } from '../../types';

interface FeedPostCardProps {
  post: GamingPost;
  currentUser: GamerProfile;
  onLike?: (postId: string, reactionType: 'like' | 'heart' | 'fire') => void;
  onComment?: (postId: string, text: string, parentId?: string) => void;
  onEditPost?: (postId: string, newContent: string) => void;
  onDeletePost?: (postId: string) => void;
  onBookmarkPost?: (postId: string) => void;
  onReportPost?: (postId: string, reason: string) => void;
  onEditComment?: (postId: string, commentId: string, newText: string) => void;
  onDeleteComment?: (postId: string, commentId: string) => void;
  onReportComment?: (commentId: string, reason: string) => void;
}

export const FeedPostCard: React.FC<FeedPostCardProps> = ({
  post,
  currentUser,
  onLike,
  onComment,
  onEditPost,
  onDeletePost,
  onBookmarkPost,
  onReportPost,
  onEditComment,
  onDeleteComment,
  onReportComment
}) => {
  const [showComments, setShowComments] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null);
  const [replyInput, setReplyInput] = useState('');

  // Editing comment
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentText, setEditCommentText] = useState('');

  // Editing post
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [editPostContent, setEditPostContent] = useState(post.content);

  // Post dropdown menu
  const [showMenu, setShowMenu] = useState(false);

  // Report modal
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('Inappropriate content or spam');

  // Local reaction state with optimistic update
  const [userReaction, setUserReaction] = useState<'like' | 'heart' | 'fire' | null>(
    post.reactions.userReaction || null
  );
  const [reactionCounts, setReactionCounts] = useState({
    likes: post.reactions.likes || 0,
    hearts: post.reactions.hearts || 0,
    fires: post.reactions.fires || 0
  });

  const [isSaved, setIsSaved] = useState(post.isSaved || false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);

  const isAuthor = currentUser.id === post.author.id || currentUser.username === post.author.username;
  const totalReactions = reactionCounts.likes + reactionCounts.hearts + reactionCounts.fires;

  const handleToggleReaction = (type: 'like' | 'heart' | 'fire') => {
    if (userReaction === type) {
      // Unlike
      setUserReaction(null);
      setReactionCounts((prev) => ({
        ...prev,
        [type === 'like' ? 'likes' : type === 'heart' ? 'hearts' : 'fires']: Math.max(
          0,
          prev[type === 'like' ? 'likes' : type === 'heart' ? 'hearts' : 'fires'] - 1
        )
      }));
    } else {
      // Switch or add
      if (userReaction) {
        setReactionCounts((prev) => ({
          ...prev,
          [userReaction === 'like' ? 'likes' : userReaction === 'heart' ? 'hearts' : 'fires']: Math.max(
            0,
            prev[userReaction === 'like' ? 'likes' : userReaction === 'heart' ? 'hearts' : 'fires'] - 1
          )
        }));
      }
      setUserReaction(type);
      setReactionCounts((prev) => ({
        ...prev,
        [type === 'like' ? 'likes' : type === 'heart' ? 'hearts' : 'fires']:
          prev[type === 'like' ? 'likes' : type === 'heart' ? 'hearts' : 'fires'] + 1
      }));
    }

    if (onLike) onLike(post.id, type);
    setShowReactionPicker(false);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    const newComment: GamingPostComment = {
      id: `c_${Date.now()}`,
      postId: post.id,
      author: {
        id: currentUser.id,
        username: currentUser.username,
        displayName: currentUser.displayName,
        avatarUrl: currentUser.avatarUrl,
        isVerified: currentUser.isVerified
      },
      content: commentInput.trim(),
      timestamp: 'Just now',
      likesCount: 0
    };

    post.comments = [...post.comments, newComment];
    post.commentsCount += 1;

    if (onComment) onComment(post.id, commentInput.trim());
    setCommentInput('');
  };

  const handleAddReply = (parentId: string) => {
    if (!replyInput.trim()) return;

    const newReply: GamingPostComment = {
      id: `rep_${Date.now()}`,
      postId: post.id,
      author: {
        id: currentUser.id,
        username: currentUser.username,
        displayName: currentUser.displayName,
        avatarUrl: currentUser.avatarUrl,
        isVerified: currentUser.isVerified
      },
      content: replyInput.trim(),
      timestamp: 'Just now',
      parentId,
      likesCount: 0
    };

    post.comments = [...post.comments, newReply];
    post.commentsCount += 1;

    if (onComment) onComment(post.id, replyInput.trim(), parentId);
    setReplyInput('');
    setReplyingToCommentId(null);
  };

  const handleShare = () => {
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  const handleToggleSave = () => {
    setIsSaved(!isSaved);
    if (onBookmarkPost) onBookmarkPost(post.id);
  };

  const handleSaveEditedPost = () => {
    if (!editPostContent.trim()) return;
    post.content = editPostContent.trim();
    post.editedAt = 'Just now';
    setIsEditingPost(false);
    if (onEditPost) onEditPost(post.id, editPostContent.trim());
  };

  // Group comments and replies
  const rootComments = post.comments.filter((c) => !c.parentId);
  const getReplies = (commentId: string) => post.comments.filter((c) => c.parentId === commentId);

  return (
    <article className="bg-white rounded-3xl border border-[#E4E9F2] shadow-xs overflow-hidden transition-all duration-200">
      {/* Header */}
      <div className="p-4 sm:p-5 pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <img
              src={post.author.avatarUrl}
              alt={post.author.displayName}
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=150&q=80';
              }}
              className="w-12 h-12 rounded-2xl object-cover ring-2 ring-[#E4E9F2]"
            />
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-sm text-[#10234A] hover:text-[#1768DF] cursor-pointer transition-colors">
                  {post.author.displayName}
                </span>
                {post.author.isVerified && (
                  <CheckCircle2 className="w-4 h-4 text-[#1768DF] fill-[#1768DF] text-white" />
                )}
                {post.gameTag && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#EEF4FE] text-[#1768DF]">
                    {post.gameTag}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#697386] font-mono">
                <span>@{post.author.username}</span>
                <span>•</span>
                <span>{post.timestamp}</span>
                {post.editedAt && <span className="text-[10px] italic">(edited)</span>}
              </div>
            </div>
          </div>

          {/* Right Action Icons & Dropdown */}
          <div className="flex items-center gap-1 relative">
            <button
              onClick={handleToggleSave}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                isSaved ? 'text-[#1768DF] bg-[#EEF4FE]' : 'text-[#697386] hover:bg-[#F4F6FC]'
              }`}
              title={isSaved ? 'Saved to bookmarks' : 'Save post'}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-xl text-[#697386] hover:text-[#10234A] hover:bg-[#F4F6FC] transition-colors cursor-pointer"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>

            {/* Post Options Dropdown */}
            {showMenu && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-10 w-44 bg-white rounded-2xl shadow-xl border border-[#E4E9F2] py-1.5 z-40 text-xs">
                  {isAuthor && (
                    <>
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          setIsEditingPost(true);
                        }}
                        className="w-full px-3.5 py-2 text-left hover:bg-[#F4F6FC] flex items-center gap-2 font-semibold text-[#10234A] cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-[#1768DF]" />
                        <span>Edit Post</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          if (onDeletePost) onDeletePost(post.id);
                        }}
                        className="w-full px-3.5 py-2 text-left hover:bg-red-50 flex items-center gap-2 font-semibold text-red-600 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Post</span>
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      setShowReportModal(true);
                    }}
                    className="w-full px-3.5 py-2 text-left hover:bg-[#F4F6FC] flex items-center gap-2 text-[#697386] cursor-pointer"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    <span>Report Post</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Content text or Edit Form */}
        {isEditingPost ? (
          <div className="mt-3 space-y-2">
            <textarea
              value={editPostContent}
              onChange={(e) => setEditPostContent(e.target.value)}
              rows={3}
              className="w-full p-3 bg-[#F4F6FC] border border-[#1768DF] rounded-xl text-xs text-[#172033] focus:outline-hidden resize-none"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setIsEditingPost(false)}
                className="px-3 py-1.5 bg-[#F4F6FC] text-[#697386] rounded-lg text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEditedPost}
                className="px-4 py-1.5 bg-[#1768DF] text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                Save Edits
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-3 text-xs sm:text-sm text-[#10234A] leading-relaxed whitespace-pre-line font-normal">
            {post.content.split('\n').map((line, i) => (
              <p key={i} className={i > 0 ? 'mt-2' : ''}>
                {line.split(' ').map((word, wIdx) => {
                  if (word.startsWith('#')) {
                    return (
                      <span
                        key={wIdx}
                        className="text-[#1768DF] font-semibold hover:underline cursor-pointer mr-1"
                      >
                        {word}{' '}
                      </span>
                    );
                  }
                  return word + ' ';
                })}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* Media: Image or Video with Glitch Art cyber banner */}
      {post.mediaUrl && (
        <div className="relative w-full bg-slate-950 overflow-hidden border-y border-[#E4E9F2]">
          {post.badgeTitle && (
            <div className="absolute top-4 left-4 z-10 bg-black/80 backdrop-blur-md border border-white/20 text-white px-3 py-1.5 rounded-xl text-xs font-mono font-bold tracking-wider uppercase flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>{post.badgeTitle}</span>
            </div>
          )}

          {post.mediaType === 'video' ? (
            <div className="relative w-full bg-black max-h-[480px]">
              <video
                src={post.mediaUrl}
                controls
                className="w-full max-h-[480px] object-contain mx-auto"
              />
            </div>
          ) : post.mediaType === 'achievement' ? (
            <div className="relative h-64 sm:h-72 w-full flex items-center justify-center bg-gradient-to-br from-[#0B1528] via-[#10234A] to-[#1E1B4B]">
              <img
                src={post.mediaUrl}
                alt="Achievement Banner"
                className="absolute inset-0 w-full h-full object-cover opacity-25 mix-blend-overlay"
              />
              <div className="relative z-10 text-center px-4">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-tr from-cyan-400 to-blue-600 p-0.5 shadow-xl shadow-cyan-500/20 mb-3 flex items-center justify-center glitch-hover">
                  <div className="w-full h-full bg-[#0A1128] rounded-[14px] flex items-center justify-center">
                    <Trophy className="w-10 h-10 text-cyan-400 drop-shadow-md" />
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-black text-white tracking-widest font-mono">
                  {post.badgeTitle || 'ACHIEVEMENT UNLOCKED'}
                </div>
                <div className="text-xs text-cyan-300 font-bold uppercase tracking-widest mt-1">
                  OFFICIAL GAMEOUT VERIFICATION // S5
                </div>
              </div>
            </div>
          ) : (
            <div className="relative group">
              <img
                src={post.mediaUrl}
                alt="Post Media"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
                className="w-full max-h-[480px] object-cover transition-transform duration-300 group-hover:scale-[1.01]"
              />
            </div>
          )}
        </div>
      )}

      {/* Engagement Counter Row */}
      <div className="px-4 sm:px-5 py-2.5 flex items-center justify-between text-xs text-[#697386] border-b border-[#F4F6FC]">
        <div className="flex items-center gap-1.5">
          <div className="flex items-center -space-x-1">
            <span className="w-5 h-5 rounded-full bg-[#1768DF] text-white flex items-center justify-center text-[10px] ring-2 ring-white">
              👍
            </span>
            <span className="w-5 h-5 rounded-full bg-[#EF4444] text-white flex items-center justify-center text-[10px] ring-2 ring-white">
              ❤️
            </span>
            <span className="w-5 h-5 rounded-full bg-[#F59E0B] text-white flex items-center justify-center text-[10px] ring-2 ring-white">
              🔥
            </span>
          </div>
          <span className="font-bold text-[#10234A] ml-1 font-mono">
            {totalReactions > 999 ? `${(totalReactions / 1000).toFixed(1)}K` : totalReactions}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowComments(!showComments)}
            className="hover:underline hover:text-[#10234A] cursor-pointer"
          >
            {post.commentsCount} comments
          </button>
          <span>•</span>
          <span>{post.sharesCount} shares</span>
        </div>
      </div>

      {/* Social Action Buttons */}
      <div className="px-2 sm:px-4 py-1.5 flex items-center justify-between relative">
        {/* Like Button */}
        <div
          className="relative flex-1"
          onMouseEnter={() => setShowReactionPicker(true)}
          onMouseLeave={() => setShowReactionPicker(false)}
        >
          <button
            onClick={() => handleToggleReaction(userReaction ? userReaction : 'like')}
            className={`w-full py-2 px-1 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold transition-colors cursor-pointer ${
              userReaction === 'like'
                ? 'text-[#1768DF] bg-[#EEF4FE]'
                : userReaction === 'heart'
                ? 'text-[#EF4444] bg-red-50'
                : userReaction === 'fire'
                ? 'text-[#F59E0B] bg-amber-50'
                : 'text-[#697386] hover:bg-[#F4F6FC] hover:text-[#10234A]'
            }`}
          >
            {userReaction === 'like' ? (
              <ThumbsUp className="w-4 h-4 fill-current" />
            ) : userReaction === 'heart' ? (
              <Heart className="w-4 h-4 fill-current" />
            ) : userReaction === 'fire' ? (
              <Flame className="w-4 h-4 fill-current" />
            ) : (
              <ThumbsUp className="w-4 h-4" />
            )}
            <span>
              {userReaction === 'like'
                ? 'Liked'
                : userReaction === 'heart'
                ? 'Loved'
                : userReaction === 'fire'
                ? 'Fire'
                : 'Like'}
            </span>
          </button>

          {/* Quick Reaction floating box */}
          {showReactionPicker && (
            <div className="absolute -top-11 left-0 bg-white border border-[#E4E9F2] shadow-xl rounded-full px-2 py-1 flex items-center gap-1.5 z-30 animate-in fade-in">
              <button
                type="button"
                onClick={() => handleToggleReaction('like')}
                className="w-8 h-8 rounded-full hover:scale-125 transition-transform flex items-center justify-center text-lg cursor-pointer"
                title="Like"
              >
                👍
              </button>
              <button
                type="button"
                onClick={() => handleToggleReaction('heart')}
                className="w-8 h-8 rounded-full hover:scale-125 transition-transform flex items-center justify-center text-lg cursor-pointer"
                title="Love"
              >
                ❤️
              </button>
              <button
                type="button"
                onClick={() => handleToggleReaction('fire')}
                className="w-8 h-8 rounded-full hover:scale-125 transition-transform flex items-center justify-center text-lg cursor-pointer"
                title="Fire"
              >
                🔥
              </button>
            </div>
          )}
        </div>

        {/* Comment Button */}
        <button
          onClick={() => setShowComments(!showComments)}
          className={`flex-1 py-2 px-1 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold transition-colors cursor-pointer ${
            showComments ? 'text-[#1768DF] bg-[#EEF4FE]' : 'text-[#697386] hover:bg-[#F4F6FC]'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Comment</span>
        </button>

        {/* Share Button */}
        <button
          onClick={handleShare}
          className="flex-1 py-2 px-1 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold text-[#697386] hover:bg-[#F4F6FC] transition-colors cursor-pointer"
        >
          {copiedShare ? (
            <>
              <Check className="w-4 h-4 text-emerald-600" />
              <span className="text-emerald-600">Copied!</span>
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </>
          )}
        </button>
      </div>

      {/* Expanded Comments & Replies Module */}
      {showComments && (
        <div className="p-4 sm:p-5 pt-3 bg-[#FBFBFE] border-t border-[#E4E9F2] space-y-3.5">
          {/* Post Comment Input */}
          <form onSubmit={handleAddComment} className="flex items-center gap-3">
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.displayName}
              className="w-8 h-8 rounded-xl object-cover ring-1 ring-[#E4E9F2]"
            />
            <div className="flex-1 relative flex items-center">
              <input
                type="text"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="Share your gaming thoughts or tactical reply..."
                className="w-full text-xs bg-white text-[#172033] placeholder-[#697386] border border-[#E4E9F2] focus:border-[#1768DF] rounded-full pl-4 pr-16 py-2.5 focus:outline-hidden shadow-2xs"
              />
              <button
                type="submit"
                disabled={!commentInput.trim()}
                className="absolute right-1 px-3.5 py-1 bg-[#1768DF] disabled:opacity-40 text-white rounded-full text-xs font-bold transition-opacity cursor-pointer"
              >
                Post
              </button>
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-3 pt-2">
            {rootComments.length === 0 ? (
              <p className="text-xs text-[#697386] text-center py-2">
                No replies yet. Be the first to share your thoughts!
              </p>
            ) : (
              rootComments.map((comment) => {
                const replies = getReplies(comment.id);
                const isCommentAuthor =
                  currentUser.id === comment.author.id ||
                  currentUser.username === comment.author.username;

                return (
                  <div key={comment.id} className="space-y-2">
                    <div className="flex items-start gap-2.5 text-xs">
                      <img
                        src={comment.author.avatarUrl}
                        alt={comment.author.displayName}
                        className="w-8 h-8 rounded-xl object-cover mt-0.5 ring-1 ring-[#E4E9F2]"
                      />
                      <div className="flex-1 bg-white p-3 rounded-2xl border border-[#E4E9F2]">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-[#10234A]">
                              {comment.author.displayName}
                            </span>
                            <span className="text-[10px] text-[#697386] font-mono">
                              @{comment.author.username}
                            </span>
                          </div>
                          <span className="text-[10px] text-[#94a3b8]">{comment.timestamp}</span>
                        </div>

                        {/* Comment Text or Edit Form */}
                        {editingCommentId === comment.id ? (
                          <div className="mt-2 space-y-1.5">
                            <input
                              type="text"
                              value={editCommentText}
                              onChange={(e) => setEditCommentText(e.target.value)}
                              className="w-full p-2 bg-[#F4F6FC] border border-[#1768DF] rounded-lg text-xs"
                            />
                            <div className="flex justify-end gap-1.5">
                              <button
                                onClick={() => setEditingCommentId(null)}
                                className="px-2 py-1 bg-slate-100 rounded text-[10px] font-bold"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => {
                                  comment.content = editCommentText;
                                  setEditingCommentId(null);
                                  if (onEditComment)
                                    onEditComment(post.id, comment.id, editCommentText);
                                }}
                                className="px-3 py-1 bg-[#1768DF] text-white rounded text-[10px] font-bold"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="mt-1 text-[#172033] leading-relaxed">{comment.content}</p>
                        )}

                        {/* Comment Actions */}
                        <div className="mt-2 pt-1 border-t border-slate-50 flex items-center justify-between text-[11px] text-[#697386]">
                          <button
                            onClick={() =>
                              setReplyingToCommentId(
                                replyingToCommentId === comment.id ? null : comment.id
                              )
                            }
                            className="font-bold text-[#1768DF] hover:underline cursor-pointer flex items-center gap-1"
                          >
                            <CornerDownRight className="w-3 h-3" />
                            <span>Reply</span>
                          </button>

                          {isCommentAuthor && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setEditingCommentId(comment.id);
                                  setEditCommentText(comment.content);
                                }}
                                className="hover:text-[#1768DF] cursor-pointer"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => {
                                  post.comments = post.comments.filter((c) => c.id !== comment.id);
                                  post.commentsCount = Math.max(0, post.commentsCount - 1);
                                  if (onDeleteComment) onDeleteComment(post.id, comment.id);
                                }}
                                className="hover:text-red-600 cursor-pointer"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Inline Reply Form */}
                    {replyingToCommentId === comment.id && (
                      <div className="ml-10 flex items-center gap-2">
                        <input
                          type="text"
                          value={replyInput}
                          onChange={(e) => setReplyInput(e.target.value)}
                          placeholder={`Reply to @${comment.author.username}...`}
                          className="flex-1 text-xs bg-white text-[#172033] border border-[#E4E9F2] focus:border-[#1768DF] rounded-xl px-3 py-1.5 focus:outline-hidden"
                          autoFocus
                        />
                        <button
                          onClick={() => handleAddReply(comment.id)}
                          disabled={!replyInput.trim()}
                          className="px-3 py-1.5 bg-[#1768DF] text-white text-xs font-bold rounded-xl disabled:opacity-40"
                        >
                          Send
                        </button>
                      </div>
                    )}

                    {/* Nested Replies */}
                    {replies.length > 0 && (
                      <div className="ml-10 space-y-2 border-l-2 border-blue-100 pl-3">
                        {replies.map((reply) => (
                          <div
                            key={reply.id}
                            className="p-2.5 bg-white rounded-xl border border-[#E4E9F2] text-xs"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-[#10234A]">
                                {reply.author.displayName}
                              </span>
                              <span className="text-[10px] text-[#94a3b8]">{reply.timestamp}</span>
                            </div>
                            <p className="mt-1 text-[#172033]">{reply.content}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Report Post Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-[#E4E9F2] space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-600 font-bold text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>Report Inappropriate Content</span>
              </div>
              <button onClick={() => setShowReportModal(false)} className="p-1 cursor-pointer">
                <X className="w-4 h-4 text-[#697386]" />
              </button>
            </div>

            <p className="text-[#697386]">
              Submit this post by <strong className="text-[#10234A]">@{post.author.username}</strong> to the GameOut moderation council.
            </p>

            <div>
              <label className="block text-xs font-bold text-[#10234A] mb-1">Reason</label>
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full p-2.5 bg-[#F4F6FC] border border-[#E4E9F2] rounded-xl text-xs focus:outline-hidden"
              >
                <option value="Inappropriate content or spam">Inappropriate content or spam</option>
                <option value="Hate speech, harassment, or toxic comms">Hate speech, harassment, or toxic comms</option>
                <option value="Cheating, exploits, or account sales">Cheating, exploits, or account sales</option>
                <option value="Copyright violation or impersonation">Copyright violation or impersonation</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#E4E9F2]">
              <button
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 bg-[#F4F6FC] text-[#697386] rounded-xl font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (onReportPost) onReportPost(post.id, reportReason);
                  setShowReportModal(false);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-xl font-bold cursor-pointer"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
};
