import React, { useState, useRef } from 'react';
import {
  Gamepad2,
  Image,
  Video,
  Trophy,
  X,
  Sparkles,
  Send,
  Hash,
  Upload,
  Globe,
  Lock,
  Compass,
  Zap,
  AlertCircle
} from 'lucide-react';
import { GamerProfile, GamingPost } from '../../types';
import { uploadGamerMedia, validateMediaFile } from '../../services/storageService';

interface PostComposerProps {
  currentUser: GamerProfile;
  onAddPost: (
    post: Omit<GamingPost, 'id' | 'timestamp' | 'reactions' | 'commentsCount' | 'sharesCount' | 'comments'>
  ) => void;
}

export const PostComposer: React.FC<PostComposerProps> = ({
  currentUser,
  onAddPost
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState('');
  const [selectedGame, setSelectedGame] = useState('Valorant');
  const [postType, setPostType] = useState<
    'status' | 'photo' | 'clip' | 'achievement' | 'adventure' | 'moment'
  >('status');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaKind, setMediaKind] = useState<'image' | 'video' | null>(null);
  const [badgeTitle, setBadgeTitle] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'friends_only'>('public');

  // File upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const gameOptions = [
    'Valorant',
    'Minecraft',
    'Marvel Rivals',
    'Grand Theft Auto VI',
    'Apex Legends',
    'Cyberpunk 2077',
    'Fortnite',
    'Roblox'
  ];

  const handleOpenWith = (
    type: 'status' | 'photo' | 'clip' | 'achievement' | 'adventure' | 'moment'
  ) => {
    setPostType(type);
    setUploadError(null);

    if (type === 'achievement') {
      setBadgeTitle('CLUTCH MASTER // ACED OVERTIME');
      setContent('Just secured a 1v4 ace in competitive overtime! Never surrender 🔥🏆');
      setMediaUrl('https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80');
      setMediaKind('image');
    } else if (type === 'adventure') {
      setBadgeTitle('SQUAD ADVENTURE // 42-HOUR SMP EXPEDITION');
      setContent('Led the expedition through the Nether wastes to secure ancient debris. Our base is fully armored now! 🏰⛏️');
      setMediaUrl('https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80');
      setMediaKind('image');
    } else if (type === 'photo') {
      setMediaUrl('https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80');
      setMediaKind('image');
      setContent('Check out our outpost after days of continuous mining and building! 🏰');
    } else if (type === 'clip') {
      setMediaUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4');
      setMediaKind('video');
      setContent('Insane cross-map Sova dart lineup that caught three enemies off guard! 🎯 Watch the defuse:');
    } else if (type === 'moment') {
      setContent('Just queued into Radiant lobbies with top collegiate players. High-stakes communication on Point A! 🎮');
      setMediaUrl('');
      setMediaKind(null);
    }
    setIsOpen(true);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateMediaFile(file);
    if (!validation.valid) {
      setUploadError(validation.error || 'Invalid file.');
      return;
    }

    setUploadError(null);
    setIsUploading(true);
    setUploadProgress(10);

    try {
      const result = await uploadGamerMedia(file, currentUser.id, 'post', (pct) => {
        setUploadProgress(pct);
      });
      setMediaUrl(result.url);
      setMediaKind(result.mediaKind);
      if (result.mediaKind === 'video') {
        setPostType('clip');
      } else {
        setPostType('photo');
      }
    } catch (err: any) {
      setUploadError(err.message || 'Media upload failed.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    // Extract hashtags
    const hashtags = content.match(/#[a-zA-Z0-9_]+/g)?.map((t) => t.substring(1)) || [];
    if (!hashtags.includes(selectedGame)) {
      hashtags.push(selectedGame);
    }

    onAddPost({
      author: {
        id: currentUser.id,
        username: currentUser.username,
        displayName: currentUser.displayName,
        avatarUrl: currentUser.avatarUrl,
        isVerified: currentUser.isVerified
      },
      content: content.trim(),
      gameTag: selectedGame,
      tags: hashtags,
      mediaUrl: mediaUrl || undefined,
      mediaType: mediaKind === 'video' ? 'video' : postType === 'achievement' ? 'achievement' : mediaUrl ? 'image' : undefined,
      badgeTitle: badgeTitle || undefined,
      postType,
      visibility
    });

    // Reset
    setContent('');
    setMediaUrl('');
    setMediaKind(null);
    setBadgeTitle('');
    setIsOpen(false);
  };

  return (
    <>
      {/* Hidden file input for native image/video upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png,image/jpeg,image/webp,image/gif,video/mp4,video/webm"
        className="hidden"
      />

      {/* Closed Post Composer Card (Matches GameOut design) */}
      <div className="bg-white rounded-2xl border border-[#E4E9F2] p-4 shadow-xs relative overflow-hidden group">
        <div className="flex items-center gap-3">
          <img
            src={currentUser.avatarUrl}
            alt={currentUser.displayName}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-[#E4E9F2]"
          />
          <button
            type="button"
            onClick={() => handleOpenWith('status')}
            className="flex-1 text-left px-4 py-2.5 bg-[#F4F6FC] hover:bg-[#EEF2FA] rounded-full text-xs sm:text-sm text-[#697386] font-medium border border-transparent hover:border-[#E4E9F2] transition-all cursor-pointer flex items-center justify-between"
          >
            <span>Share your gaming moment...</span>
            <span className="text-[10px] font-mono text-[#1768DF] font-bold hidden sm:inline-block">
              + POST
            </span>
          </button>
        </div>

        {/* Bottom Action Bar */}
        <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#E4E9F2] px-1 sm:px-2 flex-wrap gap-1">
          <button
            type="button"
            onClick={() => handleOpenWith('moment')}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#172033] hover:text-[#1768DF] hover:bg-[#F4F6FC] px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer"
          >
            <Gamepad2 className="w-4 h-4 text-[#1768DF]" />
            <span>Moment</span>
          </button>

          <button
            type="button"
            onClick={() => {
              handleOpenWith('photo');
              if (fileInputRef.current) fileInputRef.current.click();
            }}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#172033] hover:text-[#2563EB] hover:bg-[#F4F6FC] px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer"
          >
            <Image className="w-4 h-4 text-[#2563EB]" />
            <span>Photo</span>
          </button>

          <button
            type="button"
            onClick={() => {
              handleOpenWith('clip');
              if (fileInputRef.current) fileInputRef.current.click();
            }}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#172033] hover:text-[#7C3AED] hover:bg-[#F4F6FC] px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer"
          >
            <Video className="w-4 h-4 text-[#7C3AED]" />
            <span>Video Clip</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenWith('achievement')}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#172033] hover:text-[#D97706] hover:bg-[#F4F6FC] px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer"
          >
            <Trophy className="w-4 h-4 text-[#D97706]" />
            <span>Achievement</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenWith('adventure')}
            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-[#172033] hover:text-emerald-600 hover:bg-[#F4F6FC] px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer"
          >
            <Compass className="w-4 h-4 text-emerald-600" />
            <span>Adventure</span>
          </button>
        </div>
      </div>

      {/* Modal / Dialog when composing */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-[#E4E9F2] overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header with Cyan/Magenta Glitch Art cyber touch */}
            <div className="px-6 py-4 border-b border-[#E4E9F2] flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
              <div className="flex items-center gap-2 font-bold text-base text-[#10234A]">
                <Gamepad2 className="w-5 h-5 text-[#1768DF]" />
                <span className="tracking-tight">Publish Gaming Moment</span>
                <span className="text-[10px] font-mono font-bold bg-[#10234A] text-cyan-300 px-2 py-0.5 rounded-md">
                  V6_FEED
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full text-[#697386] hover:text-[#172033] hover:bg-[#F4F6FC] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 flex-1 overflow-y-auto space-y-4 text-xs">
              {/* Author & Visibility Selector */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.displayName}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-[#E4E9F2]"
                  />
                  <div>
                    <span className="font-bold text-xs text-[#10234A] block">
                      {currentUser.displayName}
                    </span>
                    <div className="flex items-center gap-1 mt-0.5">
                      <select
                        value={visibility}
                        onChange={(e) => setVisibility(e.target.value as any)}
                        className="bg-[#F4F6FC] text-[11px] font-semibold text-[#697386] rounded-lg px-2 py-0.5 border border-[#E4E9F2] focus:outline-hidden"
                      >
                        <option value="public">🌐 Public (All Gamers)</option>
                        <option value="friends_only">🔒 Squad Only</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Game Tag Selector */}
                <div className="flex items-center gap-1.5 bg-[#F4F6FC] px-3 py-1.5 rounded-xl border border-[#E4E9F2]">
                  <Hash className="w-3.5 h-3.5 text-[#1768DF]" />
                  <select
                    value={selectedGame}
                    onChange={(e) => setSelectedGame(e.target.value)}
                    className="bg-transparent text-xs font-bold text-[#10234A] focus:outline-hidden cursor-pointer"
                  >
                    {gameOptions.map((game) => (
                      <option key={game} value={game}>
                        {game}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Text Content Area */}
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your competitive clutch, building schematics, speedrun victory, or gaming story... #Valorant #Ranked"
                rows={4}
                className="w-full text-xs text-[#172033] placeholder-[#697386] border border-[#E4E9F2] focus:border-[#1768DF] rounded-2xl p-3.5 focus:outline-hidden resize-none leading-relaxed"
                autoFocus
              />

              {/* Achievement Badge Input if postType is achievement */}
              {postType === 'achievement' && (
                <div className="bg-[#FEF3C7]/50 border border-[#FDE68A] p-3 rounded-2xl space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#B45309]">
                    <Trophy className="w-4 h-4 text-[#D97706]" />
                    <span>Achievement Trophy Title</span>
                  </div>
                  <input
                    type="text"
                    value={badgeTitle}
                    onChange={(e) => setBadgeTitle(e.target.value)}
                    placeholder="e.g. RADIANT ACE // 1V4 CLUTCH"
                    className="w-full bg-white text-xs font-mono font-bold uppercase tracking-wider text-[#10234A] border border-[#FDE68A] rounded-xl px-3 py-2 focus:outline-hidden"
                  />
                </div>
              )}

              {/* Media Upload Area (Supports both direct URL & File Upload) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-[#697386]">
                  <span>Attach Media (Image or Video)</span>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[#1768DF] hover:underline flex items-center gap-1 font-bold cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Local File</span>
                  </button>
                </div>

                {/* Upload progress indicator */}
                {isUploading && (
                  <div className="p-3 rounded-xl bg-[#EEF4FE] border border-blue-200 space-y-1.5 animate-pulse">
                    <div className="flex justify-between text-[11px] font-bold text-[#1768DF]">
                      <span>Uploading to Firebase Storage...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-blue-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#1768DF] transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {uploadError && (
                  <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 flex items-center gap-2 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}

                {/* Direct URL input fallback */}
                <input
                  type="url"
                  value={mediaUrl}
                  onChange={(e) => {
                    setMediaUrl(e.target.value);
                    if (e.target.value.endsWith('.mp4') || e.target.value.endsWith('.webm')) {
                      setMediaKind('video');
                    } else if (e.target.value) {
                      setMediaKind('image');
                    }
                  }}
                  placeholder="Paste direct Image/Video URL or upload from device..."
                  className="w-full text-xs text-[#172033] border border-[#E4E9F2] focus:border-[#1768DF] rounded-xl p-2.5 focus:outline-hidden"
                />

                {/* Media Preview Box */}
                {mediaUrl && (
                  <div className="relative rounded-2xl overflow-hidden border border-[#E4E9F2] max-h-52 bg-slate-950 flex items-center justify-center">
                    {mediaKind === 'video' ? (
                      <video
                        src={mediaUrl}
                        controls
                        className="w-full max-h-52 object-contain"
                      />
                    ) : (
                      <img
                        src={mediaUrl}
                        alt="Upload preview"
                        className="w-full max-h-52 object-cover"
                        onError={() => {}}
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setMediaUrl('');
                        setMediaKind(null);
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-black text-white rounded-full transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Format selector buttons */}
              <div className="pt-3 border-t border-[#E4E9F2] flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setPostType('status')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                      postType === 'status'
                        ? 'bg-[#EEF4FE] text-[#1768DF]'
                        : 'text-[#697386] hover:bg-[#F4F6FC]'
                    }`}
                  >
                    Status
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPostType('photo');
                      if (!mediaUrl) {
                        setMediaUrl('https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80');
                        setMediaKind('image');
                      }
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                      postType === 'photo'
                        ? 'bg-[#EEF4FE] text-[#2563EB]'
                        : 'text-[#697386] hover:bg-[#F4F6FC]'
                    }`}
                  >
                    Photo
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPostType('clip');
                      if (!mediaUrl) {
                        setMediaUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4');
                        setMediaKind('video');
                      }
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                      postType === 'clip'
                        ? 'bg-[#EEF4FE] text-[#7C3AED]'
                        : 'text-[#697386] hover:bg-[#F4F6FC]'
                    }`}
                  >
                    Clip
                  </button>
                  <button
                    type="button"
                    onClick={() => setPostType('achievement')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                      postType === 'achievement'
                        ? 'bg-[#FEF3C7] text-[#D97706]'
                        : 'text-[#697386] hover:bg-[#F4F6FC]'
                    }`}
                  >
                    Achievement
                  </button>
                </div>

                {/* Cancel & Submit */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-[#697386] hover:bg-[#F4F6FC] rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!content.trim() || isUploading}
                    className="flex items-center gap-2 px-5 py-2 bg-[#1768DF] hover:bg-[#1255be] disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Publish Post</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
