import React, { useState, useEffect, Component, ErrorInfo, ReactNode } from 'react';
import { format, isWithinInterval } from 'date-fns';
import { Channel, Program } from './types';
import { getMockChannels } from './mockData';
import { cn } from './lib/utils';
import { Search, Calendar, Info, Clock, Play, ChevronRight, Menu, Plus, X, Check, Settings, LogIn, LogOut, User as UserIcon, Trophy, Zap, Star, Sparkles, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, signInWithGoogle, signOut, db, handleFirestoreError, OperationType } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot, setDoc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { Toaster, toast } from 'sonner';

// Gamification Constants
const XP_PER_WATCH = 15;
const XP_PER_INFO = 5;
const XP_PER_LEVEL = 100;

const ACHIEVEMENTS = [
  { id: 'early_bird', name: 'Early Bird', description: 'Check the guide before 8 AM', icon: <Clock className="w-5 h-5 text-yellow-400" /> },
  { id: 'night_owl', name: 'Night Owl', description: 'Watch something after midnight', icon: <Star className="w-5 h-5 text-purple-400" /> },
  { id: 'movie_buff', name: 'Movie Buff', description: 'Check details for 5 movies', icon: <Play className="w-5 h-5 text-red-400" /> },
  { id: 'channel_surfer', name: 'Channel Surfer', description: 'Select 10 or more channels', icon: <TrendingUp className="w-5 h-5 text-blue-400" /> },
];

// Error Boundary Component
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = { hasError: false, error: null };
  public props: ErrorBoundaryProps;
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.props = props;
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-[#0a0a0a] text-white p-6 text-center">
          <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
          <p className="text-white/60 mb-8 max-w-md">
            {this.state.error?.message.startsWith('{') 
              ? "A database error occurred. Please try again later." 
              : this.state.error?.message || "An unexpected error occurred."}
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-white text-black px-6 py-2 rounded-full font-bold"
          >
            Reload App
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

function AppContent() {
  const [allChannels, setAllChannels] = useState<Channel[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [userChannelIds, setUserChannelIds] = useState<string[]>(['bbc1', 'bbc2', 'itv1', 'ch4', 'ch5']);
  const [userStats, setUserStats] = useState({
    xp: 0,
    level: 1,
    streak: 0,
    lastCheckIn: '',
    achievements: [] as string[]
  });
  const [showAchievements, setShowAchievements] = useState(false);
  const [xpPopups, setXpPopups] = useState<{ id: number, amount: number, x: number, y: number }[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isManageMode, setIsManageMode] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'time'>('name');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // iOS Viewport Height Fix
  useEffect(() => {
    const setVh = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    setVh();
    window.addEventListener('resize', setVh);
    return () => window.removeEventListener('resize', setVh);
  }, []);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // Sync with Firestore
  useEffect(() => {
    if (!isAuthReady || !user) {
      // Load from local storage if not logged in
      const saved = localStorage.getItem('myFreeview_channels');
      if (saved) setUserChannelIds(JSON.parse(saved));
      return;
    }

    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userDocRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.selectedChannelIds) {
          setUserChannelIds(data.selectedChannelIds);
        }
        setUserStats({
          xp: data.xp || 0,
          level: data.level || 1,
          streak: data.streak || 0,
          lastCheckIn: data.lastCheckIn || '',
          achievements: data.achievements || []
        });

        // Check for daily streak
        const today = new Date().toDateString();
        const last = data.lastCheckIn ? new Date(data.lastCheckIn).toDateString() : '';
        
        if (last !== today) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const wasYesterday = last === yesterday.toDateString();
          
          const newStreak = wasYesterday ? (data.streak || 0) + 1 : 1;
          
          updateDoc(userDocRef, {
            streak: newStreak,
            lastCheckIn: new Date().toISOString(),
            xp: increment(20) // Bonus for daily check-in
          }).then(() => {
            toast.success(`Daily Streak: ${newStreak} Days!`, {
              description: "You earned 20 bonus XP!",
              icon: <Zap className="w-5 h-5 text-yellow-400" />
            });
          }).catch(err => console.error("Streak update failed", err));
        }
      } else {
        // Create initial user doc if it doesn't exist
        const initialIds = ['bbc1', 'bbc2', 'itv1', 'ch4', 'ch5'];
        setDoc(userDocRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          selectedChannelIds: initialIds,
          xp: 0,
          level: 1,
          streak: 1,
          lastCheckIn: new Date().toISOString(),
          achievements: [],
          updatedAt: new Date().toISOString()
        }).catch(err => handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}`));
      }
    }, (err) => handleFirestoreError(err, OperationType.GET, `users/${user.uid}`));

    return () => unsubscribe();
  }, [user, isAuthReady]);

  useEffect(() => {
    setAllChannels(getMockChannels());
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!user) {
      localStorage.setItem('myFreeview_channels', JSON.stringify(userChannelIds));
    }
  }, [userChannelIds, user]);

  const awardXP = async (amount: number, e?: React.MouseEvent) => {
    if (!user) return;

    // Add visual popup
    if (e) {
      const id = Date.now();
      setXpPopups(prev => [...prev, { id, amount, x: e.clientX, y: e.clientY }]);
      setTimeout(() => setXpPopups(prev => prev.filter(p => p.id !== id)), 1000);
    }

    const newXp = userStats.xp + amount;
    const newLevel = Math.floor(newXp / XP_PER_LEVEL) + 1;
    
    const updates: any = {
      xp: increment(amount),
      updatedAt: new Date().toISOString()
    };

    if (newLevel > userStats.level) {
      updates.level = newLevel;
      toast.success(`Level Up!`, {
        description: `Welcome to Level ${newLevel}!`,
        icon: <Sparkles className="w-6 h-6 text-yellow-400" />
      });
    }

    // Check for achievements
    const hour = new Date().getHours();
    const newAchievements = [...userStats.achievements];
    let earned = false;

    if (hour < 8 && !newAchievements.includes('early_bird')) {
      newAchievements.push('early_bird');
      earned = true;
    }
    if (hour >= 0 && hour < 4 && !newAchievements.includes('night_owl')) {
      newAchievements.push('night_owl');
      earned = true;
    }
    if (userChannelIds.length >= 10 && !newAchievements.includes('channel_surfer')) {
      newAchievements.push('channel_surfer');
      earned = true;
    }

    if (earned) {
      updates.achievements = newAchievements;
      const latest = ACHIEVEMENTS.find(a => a.id === newAchievements[newAchievements.length - 1]);
      toast.success(`Achievement Earned!`, {
        description: latest?.name,
        icon: <Trophy className="w-6 h-6 text-yellow-400" />
      });
    }

    try {
      await updateDoc(doc(db, 'users', user.uid), updates);
    } catch (err) {
      console.error("XP update failed", err);
    }
  };

  const updateSelectedChannels = async (newIds: string[]) => {
    setUserChannelIds(newIds);
    if (user) {
      try {
        await setDoc(doc(db, 'users', user.uid), {
          selectedChannelIds: newIds,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
      }
    }
  };

  const getCurrentProgram = (channel: Channel) => {
    return channel.programs.find(p => 
      isWithinInterval(currentTime, { start: p.start, end: p.end })
    ) || channel.programs[0];
  };

  const myChannels = allChannels.filter(c => userChannelIds.includes(c.id));
  
  const sortedChannels = [...myChannels].sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    } else {
      const progA = getCurrentProgram(a);
      const progB = getCurrentProgram(b);
      return progA.start.getTime() - progB.start.getTime();
    }
  });

  const filteredChannels = sortedChannels.filter(channel => {
    const currentProgram = getCurrentProgram(channel);
    const isNowPlayingMovie = currentProgram.category === 'Movies';
    
    if (selectedCategory === 'Now Playing Movies') {
      return isNowPlayingMovie && (
        channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        channel.programs.some(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    return (selectedCategory === 'All' || channel.category === selectedCategory) &&
      (channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
       channel.programs.some(p => p.title.toLowerCase().includes(searchQuery.toLowerCase())));
  });

  const categories: string[] = [
    'All', 
    'Now Playing Movies',
    ...(Array.from(new Set(allChannels.map(c => c.category))) as string[])
  ].sort((a, b) => {
    if (a === 'All') return -1;
    if (b === 'All') return 1;
    if (a === 'Now Playing Movies') return -1;
    if (b === 'Now Playing Movies') return 1;
    return a.localeCompare(b);
  });

  const toggleChannel = (id: string) => {
    const newIds = userChannelIds.includes(id)
      ? userChannelIds.filter(i => i !== id)
      : userChannelIds.length < 25 ? [...userChannelIds, id] : userChannelIds;
    
    updateSelectedChannels(newIds);
  };

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0a] text-white font-sans overflow-hidden safe-top safe-bottom">
      {/* Header */}
      <header className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-white/10 bg-[#141414] z-50">
        <div className="flex items-center gap-3 md:gap-4">
          <Menu className="w-5 h-5 md:w-6 md:h-6 text-white/70 cursor-pointer hover:text-white" />
          <h1 className="text-lg md:text-xl font-bold tracking-tighter text-white">myFreeview</h1>
        </div>
        
        <div className="hidden md:flex flex-1 max-w-md mx-8 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input 
            type="text" 
            placeholder="Search channels or shows..."
            className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-white/30 transition-colors"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden lg:flex items-center bg-white/5 rounded-full p-1 border border-white/10">
            <button 
              onClick={() => setSortBy('name')}
              className={cn(
                "px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all",
                sortBy === 'name' ? "bg-white text-black" : "text-white/40 hover:text-white"
              )}
            >
              A-Z
            </button>
            <button 
              onClick={() => setSortBy('time')}
              className={cn(
                "px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all",
                sortBy === 'time' ? "bg-white text-black" : "text-white/40 hover:text-white"
              )}
            >
              Time
            </button>
          </div>
          <button 
            onClick={() => setIsManageMode(true)}
            className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-full border border-white/10 hover:bg-white/10 transition-all"
          >
            <Settings className="w-4 h-4 text-white/70" />
            <span className="hidden sm:inline text-xs font-bold uppercase tracking-wider">Manage</span>
          </button>

          {/* Login/Logout */}
          <div className="flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-3">
                {/* Level & Streak */}
                <div className="hidden sm:flex items-center gap-4 mr-2">
                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1 text-yellow-400">
                      <Zap className="w-3 h-3 fill-current" />
                      <span className="text-[10px] font-black uppercase tracking-widest">{userStats.streak} Day Streak</span>
                    </div>
                    <div className="w-24 h-1.5 bg-white/10 rounded-full mt-1 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(userStats.xp % XP_PER_LEVEL)}%` }}
                        className="h-full bg-gradient-to-r from-yellow-400 to-orange-500"
                      />
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowAchievements(true)}
                    className="flex flex-col items-center group"
                  >
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest group-hover:text-white/60">Level</span>
                    <span className="text-sm font-black text-white group-hover:scale-110 transition-transform">{userStats.level}</span>
                  </button>
                </div>

                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Logged In</span>
                  <span className="text-xs font-bold truncate max-w-[100px]">{user.displayName}</span>
                </div>
                <button 
                  onClick={() => signOut()}
                  className="p-2 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-all group"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4 text-white/70 group-hover:text-white" />
                </button>
                {user.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt="" 
                    className="w-8 h-8 rounded-full border border-white/20 cursor-pointer hover:scale-110 transition-transform" 
                    onClick={() => setShowAchievements(true)}
                  />
                ) : (
                  <div 
                    className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/20 cursor-pointer hover:scale-110 transition-transform"
                    onClick={() => setShowAchievements(true)}
                  >
                    <UserIcon className="w-4 h-4 text-white/40" />
                  </div>
                )}
              </div>
            ) : (
              <button 
                onClick={() => signInWithGoogle()}
                className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-full font-bold text-xs hover:bg-white/90 transition-all"
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
            <Clock className="w-4 h-4 text-white/70" />
            <span className="text-xs font-mono font-bold">{format(currentTime, 'HH:mm')}</span>
          </div>
        </div>
      </header>

      {/* Category Filter Bar */}
      <div className="bg-[#141414] border-b border-white/10 px-4 md:px-6 py-3 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={cn(
              "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all border",
              selectedCategory === cat 
                ? "bg-white text-black border-white" 
                : "bg-white/5 text-white/40 border-white/10 hover:text-white hover:border-white/30"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Mobile Search & Sort Bar */}
      <div className="md:hidden px-4 py-3 bg-[#141414] border-b border-white/10 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input 
            type="text" 
            placeholder="Search..."
            className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Sort By</span>
          <div className="flex items-center bg-white/5 rounded-full p-1 border border-white/10">
            <button 
              onClick={() => setSortBy('name')}
              className={cn(
                "px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all",
                sortBy === 'name' ? "bg-white text-black" : "text-white/40"
              )}
            >
              A-Z
            </button>
            <button 
              onClick={() => setSortBy('time')}
              className={cn(
                "px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all",
                sortBy === 'time' ? "bg-white text-black" : "text-white/40"
              )}
            >
              Time
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-[#0a0a0a] overscroll-contain">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8">
          {/* Table Header - Hidden on small mobile */}
          <div className="hidden md:grid grid-cols-[200px_150px_1fr] gap-4 px-6 py-4 bg-[#141414] rounded-t-2xl border border-white/10 text-[10px] uppercase tracking-widest font-bold text-white/40">
            <div>Channel</div>
            <div>Time</div>
            <div>Show Name</div>
          </div>

          {/* Channel Rows */}
          <div className="md:border-x md:border-b border-white/10 md:rounded-b-2xl overflow-hidden divide-y divide-white/5">
            {filteredChannels.length > 0 ? (
              filteredChannels.map(channel => {
                const currentProgram = getCurrentProgram(channel);
                return (
                  <div 
                    key={channel.id} 
                    className="grid grid-cols-1 md:grid-cols-[200px_150px_1fr] gap-2 md:gap-4 px-4 md:px-6 py-4 md:py-6 items-center hover:bg-white/5 transition-colors cursor-pointer group"
                    onClick={() => setSelectedProgram(currentProgram)}
                  >
                    {/* Column 1: Channel */}
                    <div className="flex items-center gap-3 md:gap-4">
                      <img 
                        src={channel.logo} 
                        alt={channel.name} 
                        className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl object-cover border border-white/10 group-hover:border-white/30 transition-all"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex flex-col">
                        <span className="font-bold text-sm md:text-base tracking-tight">{channel.name}</span>
                        <span className="text-[10px] uppercase tracking-widest text-white/30 font-bold">{channel.category}</span>
                      </div>
                    </div>

                    {/* Column 2: Time (Mobile: Inline with show) */}
                    <div className="flex items-center gap-2 text-[11px] md:text-sm font-mono text-white/40 md:text-white/60">
                      <span className="md:bg-white/5 md:px-2 md:py-1 md:rounded md:border md:border-white/5">
                        {format(currentProgram.start, 'HH:mm')}
                      </span>
                      <span className="text-white/20">-</span>
                      <span className="md:bg-white/5 md:px-2 md:py-1 md:rounded md:border md:border-white/5">
                        {format(currentProgram.end, 'HH:mm')}
                      </span>
                    </div>

                    {/* Column 3: Show Name */}
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-sm md:text-lg group-hover:text-white transition-colors line-clamp-1">
                          {currentProgram.title}
                        </span>
                        <span className="text-[11px] md:text-xs text-white/40 line-clamp-1">
                          {currentProgram.description}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[8px] font-black bg-red-500 text-white px-1.5 py-0.5 rounded uppercase">Live</span>
                        <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/60 transition-all" />
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-12 text-center flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center">
                  <Plus className="w-8 h-8 text-white/20" />
                </div>
                <div className="max-w-xs">
                  <h3 className="text-lg font-bold mb-1">No channels found</h3>
                  <p className="text-sm text-white/40 mb-6">Search for a channel or add some to your list.</p>
                  <button 
                    onClick={() => setIsManageMode(true)}
                    className="bg-white text-black px-6 py-2 rounded-full font-bold text-sm hover:bg-white/90 transition-all"
                  >
                    Manage My Channels
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Manage Channels Modal */}
      <AnimatePresence>
        {isManageMode && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsManageMode(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-[#141414] rounded-3xl overflow-hidden border border-white/10 shadow-2xl flex flex-col max-h-[80vh]"
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between shrink-0">
                <div>
                  <h2 className="text-xl font-bold tracking-tight">Manage Channels</h2>
                  <p className="text-xs text-white/40">
                    Select up to 25 channels ({userChannelIds.length}/25)
                  </p>
                </div>
                <button 
                  onClick={() => setIsManageMode(false)}
                  className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Category Filter in Modal */}
              <div className="px-6 py-4 bg-white/[0.02] border-b border-white/10 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all border",
                      selectedCategory === cat 
                        ? "bg-white text-black border-white" 
                        : "bg-white/5 text-white/40 border-white/10 hover:text-white hover:border-white/30"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
                {allChannels
                  .filter(c => selectedCategory === 'All' || c.category === selectedCategory)
                  .map(channel => {
                    const isSelected = userChannelIds.includes(channel.id);
                  const isLimitReached = userChannelIds.length >= 25 && !isSelected;

                  return (
                    <div 
                      key={channel.id}
                      onClick={() => !isLimitReached && toggleChannel(channel.id)}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-2xl border transition-all",
                        isSelected 
                          ? "bg-white/10 border-white/20 cursor-pointer" 
                          : isLimitReached 
                            ? "bg-white/[0.02] border-transparent opacity-40 cursor-not-allowed"
                            : "bg-white/5 border-transparent hover:bg-white/10 cursor-pointer"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <img 
                          src={channel.logo} 
                          alt={channel.name} 
                          className="w-10 h-10 rounded-xl object-cover border border-white/10"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex flex-col">
                          <span className="font-bold">{channel.name}</span>
                          <span className="text-[9px] uppercase tracking-widest text-white/30 font-bold">{channel.category}</span>
                        </div>
                      </div>
                      <div className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center transition-all border",
                        isSelected 
                          ? "bg-white border-white text-black" 
                          : "bg-transparent border-white/20 text-transparent"
                      )}>
                        <Check className="w-4 h-4" />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-6 border-t border-white/10 shrink-0">
                <button 
                  onClick={() => setIsManageMode(false)}
                  className="w-full bg-white text-black font-bold py-4 rounded-2xl hover:bg-white/90 transition-all"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Program Detail Modal */}
      <AnimatePresence>
        {selectedProgram && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProgram(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-[#1a1a1a] rounded-3xl overflow-hidden border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar"
            >
              <div className="relative h-48 md:h-64 shrink-0">
                <img 
                  src={selectedProgram.image} 
                  alt={selectedProgram.title} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-transparent to-transparent" />
                <button 
                  onClick={() => setSelectedProgram(null)}
                  className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white/70 hover:text-white transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 md:p-8">
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                  <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-wider text-white/70 border border-white/10">
                    {selectedProgram.category}
                  </span>
                  <div className="flex items-center gap-2 text-white/40 text-xs md:text-sm font-mono">
                    <Clock className="w-4 h-4" />
                    <span>{format(selectedProgram.start, 'HH:mm')} - {format(selectedProgram.end, 'HH:mm')}</span>
                  </div>
                </div>

                <h2 className="text-2xl md:text-3xl font-bold mb-4 tracking-tight">{selectedProgram.title}</h2>
                <p className="text-white/60 leading-relaxed mb-8 text-sm md:text-lg">
                  {selectedProgram.description}
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={(e) => {
                      awardXP(XP_PER_WATCH, e);
                      // In a real app, this would open the stream
                    }}
                    className="flex-1 flex items-center justify-center gap-2 bg-white text-black font-bold py-4 rounded-2xl hover:bg-white/90 transition-all active:scale-95"
                  >
                    <Play className="w-5 h-5 fill-current" />
                    Watch Now
                  </button>
                  <button 
                    onClick={(e) => awardXP(XP_PER_INFO, e)}
                    className="flex-1 flex items-center justify-center gap-2 bg-white/10 text-white font-bold py-4 rounded-2xl hover:bg-white/20 border border-white/10 transition-all active:scale-95"
                  >
                    <Info className="w-5 h-5" />
                    More Info
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Achievements Modal */}
      <AnimatePresence>
        {showAchievements && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAchievements(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-[#1a1a1a] rounded-3xl overflow-hidden border border-white/10 shadow-2xl p-8"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
                    <Trophy className="w-8 h-8 text-black" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter">Your Progress</h2>
                    <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Level {userStats.level} • {userStats.xp} Total XP</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowAchievements(false)}
                  className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {ACHIEVEMENTS.map(achievement => {
                  const isEarned = userStats.achievements.includes(achievement.id);
                  return (
                    <div 
                      key={achievement.id}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-2xl border transition-all",
                        isEarned ? "bg-white/10 border-white/20" : "bg-white/[0.02] border-white/5 opacity-40"
                      )}
                    >
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center",
                        isEarned ? "bg-white/10" : "bg-white/5"
                      )}>
                        {achievement.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-sm">{achievement.name}</h3>
                        <p className="text-xs text-white/40">{achievement.description}</p>
                      </div>
                      {isEarned && <Check className="w-4 h-4 text-green-400" />}
                    </div>
                  );
                })}
              </div>

              <button 
                onClick={() => setShowAchievements(false)}
                className="w-full mt-8 bg-white text-black font-bold py-4 rounded-2xl hover:bg-white/90 transition-all"
              >
                Keep Surfing
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* XP Popups */}
      <AnimatePresence>
        {xpPopups.map(popup => (
          <motion.div
            key={popup.id}
            initial={{ opacity: 1, y: popup.y - 20, x: popup.x }}
            animate={{ opacity: 0, y: popup.y - 100 }}
            exit={{ opacity: 0 }}
            className="fixed z-[200] pointer-events-none text-yellow-400 font-black text-xl flex items-center gap-1 drop-shadow-lg"
          >
            <Sparkles className="w-4 h-4" />
            +{popup.amount} XP
          </motion.div>
        ))}
      </AnimatePresence>

      <Toaster position="bottom-right" theme="dark" expand={false} richColors />

      {/* Footer / Tab Bar (Mobile) */}
      <nav className="md:hidden flex items-center justify-around py-4 bg-[#141414] border-t border-white/10 shrink-0">
        <div className="flex flex-col items-center gap-1 text-white">
          <Menu className="w-5 h-5" />
          <span className="text-[9px] font-bold uppercase tracking-tighter">Guide</span>
        </div>
        <div 
          onClick={() => setIsManageMode(true)}
          className="flex flex-col items-center gap-1 text-white/40"
        >
          <Plus className="w-5 h-5" />
          <span className="text-[9px] font-bold uppercase tracking-tighter">Add</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-white/40">
          <Calendar className="w-5 h-5" />
          <span className="text-[9px] font-bold uppercase tracking-tighter">Calendar</span>
        </div>
      </nav>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}
