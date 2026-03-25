import React, { useState, useEffect } from 'react';
import { format, isWithinInterval } from 'date-fns';
import { Channel, Program } from './types';
import { getMockChannels } from './mockData';
import { cn } from './lib/utils';
import { Search, Calendar, Info, Clock, Play, ChevronRight, Menu, Plus, X, Check, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [allChannels, setAllChannels] = useState<Channel[]>([]);
  const [userChannelIds, setUserChannelIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('myFreeview_channels');
    return saved ? JSON.parse(saved) : ['bbc1', 'bbc2', 'itv1', 'ch4', 'ch5'];
  });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isManageMode, setIsManageMode] = useState(false);

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

  useEffect(() => {
    setAllChannels(getMockChannels());
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem('myFreeview_channels', JSON.stringify(userChannelIds));
  }, [userChannelIds]);

  const myChannels = allChannels.filter(c => userChannelIds.includes(c.id));
  
  const filteredChannels = myChannels.filter(channel => 
    channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    channel.programs.some(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const toggleChannel = (id: string) => {
    setUserChannelIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const getCurrentProgram = (channel: Channel) => {
    return channel.programs.find(p => 
      isWithinInterval(currentTime, { start: p.start, end: p.end })
    ) || channel.programs[0];
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
          <button 
            onClick={() => setIsManageMode(true)}
            className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-full border border-white/10 hover:bg-white/10 transition-all"
          >
            <Settings className="w-4 h-4 text-white/70" />
            <span className="hidden sm:inline text-xs font-bold uppercase tracking-wider">Manage</span>
          </button>
          <div className="hidden sm:flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
            <Clock className="w-4 h-4 text-white/70" />
            <span className="text-xs font-mono font-bold">{format(currentTime, 'HH:mm')}</span>
          </div>
        </div>
      </header>

      {/* Mobile Search Bar */}
      <div className="md:hidden px-4 py-3 bg-[#141414] border-b border-white/10">
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
                      <span className="font-bold text-sm md:text-base tracking-tight">{channel.name}</span>
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
                  <p className="text-xs text-white/40">Select the channels you want to see in your list.</p>
                </div>
                <button 
                  onClick={() => setIsManageMode(false)}
                  className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
                {allChannels.map(channel => {
                  const isSelected = userChannelIds.includes(channel.id);
                  return (
                    <div 
                      key={channel.id}
                      onClick={() => toggleChannel(channel.id)}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer",
                        isSelected 
                          ? "bg-white/10 border-white/20" 
                          : "bg-white/5 border-transparent hover:bg-white/10"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <img 
                          src={channel.logo} 
                          alt={channel.name} 
                          className="w-10 h-10 rounded-xl object-cover border border-white/10"
                          referrerPolicy="no-referrer"
                        />
                        <span className="font-bold">{channel.name}</span>
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
                  <button className="flex-1 flex items-center justify-center gap-2 bg-white text-black font-bold py-4 rounded-2xl hover:bg-white/90 transition-all">
                    <Play className="w-5 h-5 fill-current" />
                    Watch Now
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 bg-white/10 text-white font-bold py-4 rounded-2xl hover:bg-white/20 border border-white/10 transition-all">
                    <Info className="w-5 h-5" />
                    More Info
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
