import React, { useState } from 'react';
import { LeftSidebar } from '../components/dashboard/LeftSidebar';
import { PostComposer } from '../components/dashboard/PostComposer';
import { FeedPostCard } from '../components/dashboard/FeedPostCard';
import { RightSidebar } from '../components/dashboard/RightSidebar';
import { GamerProfile, GamingPost, GamingTrend, SuggestedGamer, ActivePage } from '../types';
import { Sparkles, Users, Filter, Clock, Flame, Zap, CheckCircle2 } from 'lucide-react';

interface HomeDashboardProps {
  currentUser: GamerProfile;
  posts: GamingPost[];
  trends: GamingTrend[];
  suggestedGamers: SuggestedGamer[];
  activePage: ActivePage;
  onNavigate: (page: ActivePage) => void;
  onAddPost: (
    post: Omit<GamingPost, 'id' | 'timestamp' | 'reactions' | 'commentsCount' | 'sharesCount' | 'comments'>
  ) => void;
  onLikePost: (postId: string, reactionType: 'like' | 'heart' | 'fire') => void;
  onCommentPost: (postId: string, text: string, parentId?: string) => void;
  onEditPost?: (postId: string, newContent: string) => void;
  onDeletePost?: (postId: string) => void;
  onBookmarkPost?: (postId: string) => void;
  onReportPost?: (postId: string, reason: string) => void;
  onEditComment?: (postId: string, commentId: string, newText: string) => void;
  onDeleteComment?: (postId: string, commentId: string) => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  currentUser,
  posts,
  trends,
  suggestedGamers,
  activePage,
  onNavigate,
  onAddPost,
  onLikePost,
  onCommentPost,
  onEditPost,
  onDeletePost,
  onBookmarkPost,
  onReportPost,
  onEditComment,
  onDeleteComment
}) => {
  // Feed tabs: For You | Following | Latest
  const [activeTab, setActiveTab] = useState<'for_you' | 'following' | 'latest'>('for_you');
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleBookmarkWithToast = (postId: string) => {
    if (onBookmarkPost) onBookmarkPost(postId);
    triggerToast('Updated bookmark collection.');
  };

  const handleReportWithToast = (postId: string, reason: string) => {
    if (onReportPost) onReportPost(postId, reason);
    triggerToast('Report logged. Moderation audit initiated.');
  };

  // Filter posts logic
  let filteredPosts = [...posts];

  if (activeTab === 'following') {
    // Show posts from authors user is following, official gameout account, or self
    filteredPosts = filteredPosts.filter(
      (post) =>
        post.author.id === currentUser.id ||
        post.author.username === 'gameout' ||
        post.author.username === 'shadow_ninja' ||
        post.author.username === 'valkyrie_aim'
    );
  } else if (activeTab === 'latest') {
    // Sort strictly newest
    filteredPosts.sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });
  }

  if (selectedFilter !== 'All') {
    filteredPosts = filteredPosts.filter(
      (post) =>
        post.gameTag?.toLowerCase() === selectedFilter.toLowerCase() ||
        post.tags?.some((t) => t.toLowerCase() === selectedFilter.toLowerCase())
    );
  }

  const filterChips = [
    'All',
    'Valorant',
    'Minecraft',
    'Marvel Rivals',
    'GTA VI',
    'Apex Legends',
    'Competitive',
    'Clips'
  ];

  return (
    <div className="max-w-[1400px] mx-auto px-3 sm:px-6 py-5">
      {/* Toast popup */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#10234A] text-white px-5 py-3 rounded-2xl shadow-2xl border border-cyan-400 flex items-center gap-3 glitch-box">
          <Zap className="w-4 h-4 text-cyan-300 animate-pulse" />
          <span className="text-xs font-bold font-mono tracking-tight">{toastMessage}</span>
        </div>
      )}

      {/* 3-Column Desktop Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column (Span 3 on Desktop) */}
        <div className="lg:col-span-3">
          <LeftSidebar
            currentUser={currentUser}
            activePage={activePage}
            onNavigate={onNavigate}
          />
        </div>

        {/* Center Column (Span 6 on Desktop) */}
        <main className="lg:col-span-6 space-y-4">
          {/* Feed Filter Navigation Bar */}
          <div className="bg-white rounded-3xl border border-[#E4E9F2] p-2.5 shadow-xs space-y-2.5">
            {/* Main Tabs */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setActiveTab('for_you')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'for_you'
                      ? 'bg-[#10234A] text-white shadow-xs'
                      : 'text-[#697386] hover:text-[#10234A] hover:bg-[#F4F6FC]'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>For You</span>
                </button>

                <button
                  onClick={() => setActiveTab('following')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'following'
                      ? 'bg-[#10234A] text-white shadow-xs'
                      : 'text-[#697386] hover:text-[#10234A] hover:bg-[#F4F6FC]'
                  }`}
                >
                  <Users className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Following</span>
                </button>

                <button
                  onClick={() => setActiveTab('latest')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'latest'
                      ? 'bg-[#10234A] text-white shadow-xs'
                      : 'text-[#697386] hover:text-[#10234A] hover:bg-[#F4F6FC]'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Latest</span>
                </button>
              </div>

              <div className="text-[11px] font-mono text-[#697386] hidden sm:block pr-2">
                {filteredPosts.length} posts indexed
              </div>
            </div>

            {/* Gaming Tag Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 border-t border-[#F4F6FC]">
              <span className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider pl-1 mr-1">
                Tag:
              </span>
              {filterChips.map((chip) => (
                <button
                  key={chip}
                  onClick={() => setSelectedFilter(chip)}
                  className={`text-xs font-bold px-3 py-1 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                    selectedFilter === chip
                      ? 'bg-[#1768DF] text-white shadow-2xs'
                      : 'bg-[#F4F6FC] text-[#697386] hover:bg-[#EEF4FE]'
                  }`}
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Post Composer */}
          <PostComposer currentUser={currentUser} onAddPost={onAddPost} />

          {/* Posts Feed */}
          <div className="space-y-4">
            {filteredPosts.length === 0 ? (
              <div className="bg-white rounded-3xl border border-[#E4E9F2] p-10 text-center shadow-xs">
                <p className="text-sm font-bold text-[#10234A]">No gaming posts match your current filter.</p>
                <p className="text-xs text-[#697386] mt-1">Be the first to create a post in this category!</p>
                <button
                  onClick={() => {
                    setActiveTab('for_you');
                    setSelectedFilter('All');
                  }}
                  className="mt-4 px-4 py-2 bg-[#EEF4FE] text-[#1768DF] font-bold text-xs rounded-xl cursor-pointer hover:bg-blue-100"
                >
                  Reset Feed Filters
                </button>
              </div>
            ) : (
              filteredPosts.map((post) => (
                <FeedPostCard
                  key={post.id}
                  post={post}
                  currentUser={currentUser}
                  onLike={onLikePost}
                  onComment={onCommentPost}
                  onEditPost={onEditPost}
                  onDeletePost={onDeletePost}
                  onBookmarkPost={handleBookmarkWithToast}
                  onReportPost={handleReportWithToast}
                  onEditComment={onEditComment}
                  onDeleteComment={onDeleteComment}
                />
              ))
            )}
          </div>
        </main>

        {/* Right Column (Span 3 on Desktop) */}
        <div className="hidden lg:block lg:col-span-3">
          <RightSidebar
            trends={trends}
            suggestedGamers={suggestedGamers}
            onNavigate={onNavigate}
          />
        </div>
      </div>
    </div>
  );
};
