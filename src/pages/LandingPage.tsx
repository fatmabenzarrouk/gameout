import React from 'react';
import {
  Gamepad2,
  Trophy,
  Compass,
  Users,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Flame,
  Star,
  PlayCircle,
  ExternalLink
} from 'lucide-react';
import { GameOutLogo } from '../components/common/GameOutLogo';
import { ActivePage } from '../types';

interface LandingPageProps {
  onEnterApp: () => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onNavigate: (page: ActivePage) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterApp,
  onOpenAuth,
  onNavigate
}) => {
  return (
    <div className="min-h-screen bg-[#F4F6FC] text-[#172033] flex flex-col font-sans selection:bg-[#1768DF] selection:text-white">
      {/* 1. Header / Navbar */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#E4E9F2]">
        <div className="max-w-[1300px] mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          <GameOutLogo size="lg" onClick={onEnterApp} />

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-[#697386]">
            <a href="#features" className="hover:text-[#1768DF] transition-colors">Features</a>
            <a href="#preview" className="hover:text-[#1768DF] transition-colors">Platform Preview</a>
            <a href="#how-it-works" className="hover:text-[#1768DF] transition-colors">How It Works</a>
            <a href="#community" className="hover:text-[#1768DF] transition-colors">Community</a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onOpenAuth('login')}
              className="px-4 py-2 text-xs sm:text-sm font-bold text-[#1768DF] hover:bg-[#EEF4FE] rounded-full transition-colors cursor-pointer"
            >
              Log In
            </button>
            <button
              onClick={onEnterApp}
              className="px-5 py-2.5 bg-[#1768DF] hover:bg-[#1255be] text-white text-xs sm:text-sm font-bold rounded-full shadow-md shadow-blue-500/20 hover:shadow-lg transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>Launch App</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#D5E4FC] shadow-2xs mb-6 text-xs font-bold text-[#1768DF]">
            <Sparkles className="w-3.5 h-3.5 text-[#1768DF]" />
            <span>The Premier Professional Gaming Social Network</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-[#10234A] max-w-4xl mx-auto leading-[1.12]">
            Your Gaming Life <br className="hidden sm:inline" />
            <span className="text-[#1768DF]">Deserves an Identity.</span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-lg md:text-xl text-[#697386] max-w-2xl mx-auto leading-relaxed">
            GameOut is the social network inspired by the structure of modern professional networks, but built purely for video games. Document your gaming history, showcase verified achievements, share adventures, and connect with teammates worldwide.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onOpenAuth('register')}
              className="w-full sm:w-auto px-8 py-3.5 bg-[#1768DF] hover:bg-[#1255be] text-white font-bold text-sm sm:text-base rounded-full shadow-xl shadow-blue-600/25 hover:shadow-2xl transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Join GameOut Free</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={onEnterApp}
              className="w-full sm:w-auto px-7 py-3.5 bg-white hover:bg-[#F4F6FC] text-[#172033] border border-[#E4E9F2] font-bold text-sm sm:text-base rounded-full shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Users className="w-5 h-5 text-[#1768DF]" />
              <span>Explore Gamers & Feed</span>
            </button>
          </div>

          {/* Live Micro Stats */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 sm:gap-14 text-xs font-semibold text-[#697386]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#16A36A] animate-pulse" />
              <span>180K+ Active Gamers</span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>1.4M+ Trophies Logged</span>
            </div>
            <div className="flex items-center gap-2">
              <Gamepad2 className="w-4 h-4 text-[#1768DF]" />
              <span>500+ Tracked Games</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Product Preview Section */}
      <section id="preview" className="pb-20">
        <div className="max-w-[1300px] mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-3xl border border-[#E4E9F2] p-3 sm:p-5 shadow-2xl shadow-blue-900/5 relative">
            {/* Window bar mockup */}
            <div className="flex items-center justify-between pb-3 px-3 border-b border-[#E4E9F2] text-xs text-[#697386]">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-400 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
                <span className="ml-2 font-mono text-[11px] text-[#94a3b8]">gameout.gg/feed</span>
              </div>
              <button
                onClick={onEnterApp}
                className="text-[#1768DF] font-bold text-xs flex items-center gap-1 hover:underline cursor-pointer"
              >
                <span>Live Interactive View</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Embedded interactive preview of the 3-column feed */}
            <div className="pt-4 overflow-hidden rounded-2xl">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Mini Left Sidebar */}
                <div className="md:col-span-3 space-y-3">
                  <div className="bg-[#F8FAFC] border border-[#E4E9F2] rounded-2xl p-4 text-center">
                    <div className="w-16 h-16 mx-auto rounded-full ring-2 ring-[#1768DF] overflow-hidden mb-2">
                      <img
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
                        alt="Fatma"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="font-bold text-sm text-[#172033]">Fatma Ben Zarrouk</div>
                    <div className="text-xs text-[#1768DF] font-semibold">★ Level 24 • 72%</div>
                    <div className="text-[11px] text-[#697386] mt-1">Play • Connect • Level Up 🎮</div>
                  </div>
                </div>

                {/* Mini Center Post */}
                <div className="md:col-span-6 space-y-3">
                  <div className="bg-white border border-[#E4E9F2] rounded-2xl p-4 shadow-xs">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-full bg-[#1768DF] text-white flex items-center justify-center font-bold text-xs">
                        GO
                      </div>
                      <div>
                        <div className="font-bold text-xs">GameOut Official</div>
                        <div className="text-[10px] text-[#697386]">2h ago • Public Feed</div>
                      </div>
                    </div>
                    <p className="text-xs text-[#172033] leading-relaxed">
                      The new update of Valorant is here! What do you think about the new agent? #Valorant #Update
                    </p>
                    <div className="mt-3 rounded-xl overflow-hidden bg-slate-900 h-44 relative">
                      <img
                        src="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80"
                        alt="Valorant"
                        className="w-full h-full object-cover opacity-90"
                      />
                      <div className="absolute bottom-2 left-2 bg-black/70 px-2 py-0.5 rounded text-[10px] text-white font-mono">
                        VALORANT PROTOCOL // LIVE
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mini Right Trends */}
                <div className="md:col-span-3 space-y-3">
                  <div className="bg-[#F8FAFC] border border-[#E4E9F2] rounded-2xl p-4">
                    <div className="font-bold text-xs text-[#172033] mb-2 flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-[#1768DF]" />
                      <span>Gaming Trends</span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between text-[#172033] font-medium">
                        <span>1. Marvel Rivals</span>
                        <span className="text-[10px] text-[#697386]">312K</span>
                      </div>
                      <div className="flex justify-between text-[#172033] font-medium">
                        <span>2. GTA VI</span>
                        <span className="text-[10px] text-[#697386]">287K</span>
                      </div>
                      <div className="flex justify-between text-[#172033] font-medium">
                        <span>3. Minecraft 1.22</span>
                        <span className="text-[10px] text-[#697386]">245K</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Core Features Section */}
      <section id="features" className="py-20 bg-white border-y border-[#E4E9F2]">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#1768DF]">
              Purpose-Built for Gamers
            </h2>
            <p className="mt-2 text-3xl sm:text-4xl font-extrabold text-[#10234A] tracking-tight">
              A True Professional Experience Without The Corporate Slop
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="bg-[#F4F6FC] rounded-3xl p-6 border border-[#E4E9F2] hover:border-[#1768DF] transition-all hover:shadow-lg">
              <div className="w-12 h-12 rounded-2xl bg-[#EEF4FE] text-[#1768DF] flex items-center justify-center mb-5">
                <Gamepad2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-[#10234A]">Gaming Experience</h3>
              <p className="mt-2 text-xs text-[#697386] leading-relaxed">
                Log your competitive history, hours played, ranks, roles, and tactical skills across games like Valorant, Minecraft, Apex, and CS2.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-[#F4F6FC] rounded-3xl p-6 border border-[#E4E9F2] hover:border-[#1768DF] transition-all hover:shadow-lg">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-5">
                <Trophy className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-[#10234A]">Achievement Showcase</h3>
              <p className="mt-2 text-xs text-[#697386] leading-relaxed">
                Display Common, Rare, Epic, and Legendary gaming trophies with XP rewards and transparent self-reported or verified status.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-[#F4F6FC] rounded-3xl p-6 border border-[#E4E9F2] hover:border-[#1768DF] transition-all hover:shadow-lg">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-5">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-[#10234A]">Gaming Adventures</h3>
              <p className="mt-2 text-xs text-[#697386] leading-relaxed">
                Document tournament runs, mega-build projects, raid victories, and epic gaming memories with photos, videos, and squad rosters.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-[#F4F6FC] rounded-3xl p-6 border border-[#E4E9F2] hover:border-[#1768DF] transition-all hover:shadow-lg">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-[#10234A]">Find Your Teammates</h3>
              <p className="mt-2 text-xs text-[#697386] leading-relaxed">
                Filter gamers by preferred title, hardware platform, rank, and role. Connect directly to form scrim stacks or casual guilds.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. How It Works Section */}
      <section id="how-it-works" className="py-20 bg-[#F4F6FC]">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#1768DF]">
              Simple & Powerful
            </h2>
            <p className="mt-2 text-3xl sm:text-4xl font-extrabold text-[#10234A] tracking-tight">
              How GameOut Works
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-3xl p-8 border border-[#E4E9F2] shadow-xs relative">
              <div className="w-10 h-10 rounded-full bg-[#1768DF] text-white font-extrabold flex items-center justify-center mb-6">
                1
              </div>
              <h3 className="font-bold text-lg text-[#10234A]">Create Your Gamer Identity</h3>
              <p className="mt-2 text-xs text-[#697386] leading-relaxed">
                Claim your handle, set up your avatar and gaming cover, pick your main games, and display your level, roles, and platforms.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-[#E4E9F2] shadow-xs relative">
              <div className="w-10 h-10 rounded-full bg-[#1768DF] text-white font-extrabold flex items-center justify-center mb-6">
                2
              </div>
              <h3 className="font-bold text-lg text-[#10234A]">Document Your Journey</h3>
              <p className="mt-2 text-xs text-[#697386] leading-relaxed">
                Replace boring resume jobs with Gaming Experience logs, tournament triumphs, personal stories, and trophies.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-[#E4E9F2] shadow-xs relative">
              <div className="w-10 h-10 rounded-full bg-[#1768DF] text-white font-extrabold flex items-center justify-center mb-6">
                3
              </div>
              <h3 className="font-bold text-lg text-[#10234A]">Connect & Squad Up</h3>
              <p className="mt-2 text-xs text-[#697386] leading-relaxed">
                Share clips and moments to the feed, message friends, discover trending titles, and team up for ranked victories.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Footer */}
      <footer className="mt-auto bg-white border-t border-[#E4E9F2] py-12">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <GameOutLogo size="md" onClick={onEnterApp} />
            <p className="text-xs text-[#697386]">
              Your Gaming Life. Your Identity. Your Community.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-[#697386]">
            <button onClick={() => onNavigate('home')} className="hover:text-[#1768DF]">Home Feed</button>
            <button onClick={() => onNavigate('explore')} className="hover:text-[#1768DF]">Explore Games</button>
            <button onClick={() => onNavigate('friends')} className="hover:text-[#1768DF]">Gaming Friends</button>
            <button onClick={() => onNavigate('achievements')} className="hover:text-[#1768DF]">Achievements</button>
            <button onClick={() => onNavigate('admin')} className="hover:text-[#1768DF]">Admin Area</button>
          </div>

          <div className="text-xs text-[#94a3b8]">
            © 2026 GameOut. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
