import React, { useState, useEffect, useRef } from 'react';
import { format, addHours, startOfHour, isWithinInterval, differenceInMinutes, addMinutes } from 'date-fns';
import { Channel, Program } from './types';
import { getMockChannels } from './mockData';
import { cn } from './lib/utils';
import { Search, Calendar, Info, Clock, Play, ChevronLeft, ChevronRight, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const HOUR_WIDTH = 300; // pixels per hour
const CHANNEL_HEIGHT = 80;
const CHANNEL_LIST_WIDTH = 120;

export default function App() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [startTime, setStartTime] = useState(startOfHour(new Date()));
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setChannels(getMockChannels());
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const timeSlots = Array.from({ length: 24 }).map((_, i) => addHours(startTime, i));

  const filteredChannels = channels.filter(channel => 
    channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    channel.programs.some(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -HOUR_WIDTH * 2 : HOUR_WIDTH * 2;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const getProgramWidth = (program: Program) => {
    const duration = differenceInMinutes(program.end, program.start);
    return (duration / 60) * HOUR_WIDTH;
  };

  const getProgramOffset = (program: Program) => {
    const offset = differenceInMinutes(program.start, startTime);
    return (offset / 60) * HOUR_WIDTH;
  };

  const nowOffset = (differenceInMinutes(currentTime, startTime) / 60) * HOUR_WIDTH;

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0a] text-white font-sans overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#141414] z-50">
        <div className="flex items-center gap-4">
          <Menu className="w-6 h-6 text-white/70 cursor-pointer hover:text-white" />
          <h1 className="text-xl font-bold tracking-tighter text-white">TV24</h1>
        </div>
        
        <div className="flex-1 max-w-md mx-8 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input 
            type="text" 
            placeholder="Search channels or shows..."
            className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-white/30 transition-colors"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-4 text-sm font-medium">
          <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
            <Calendar className="w-4 h-4 text-white/70" />
            <span>{format(currentTime, 'EEE, MMM d')}</span>
          </div>
          <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
            <Clock className="w-4 h-4 text-white/70" />
            <span>{format(currentTime, 'HH:mm')}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative overflow-hidden flex flex-col">
        {/* Time Header */}
        <div className="flex bg-[#141414] border-b border-white/10 sticky top-0 z-40">
          <div className="w-[120px] shrink-0 border-r border-white/10 flex items-center justify-center bg-[#141414]">
            <span className="text-[10px] uppercase tracking-widest font-bold text-white/40">Channels</span>
          </div>
          <div className="flex-1 overflow-hidden relative">
            <div className="flex" style={{ width: `${24 * HOUR_WIDTH}px` }}>
              {timeSlots.map((time, i) => (
                <div 
                  key={i} 
                  className="shrink-0 border-r border-white/5 py-3 px-4 text-xs font-mono text-white/60"
                  style={{ width: `${HOUR_WIDTH}px` }}
                >
                  {format(time, 'HH:mm')}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scrollable Guide */}
        <div className="flex-1 flex overflow-hidden">
          {/* Channel List (Sticky) */}
          <div className="w-[120px] shrink-0 bg-[#141414] border-r border-white/10 z-30 overflow-y-auto no-scrollbar">
            {filteredChannels.map(channel => (
              <div 
                key={channel.id} 
                className="h-[80px] flex flex-col items-center justify-center p-2 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
              >
                <img 
                  src={channel.logo} 
                  alt={channel.name} 
                  className="w-10 h-10 rounded-lg mb-1 object-cover grayscale hover:grayscale-0 transition-all"
                  referrerPolicy="no-referrer"
                />
                <span className="text-[10px] font-bold text-white/60 text-center truncate w-full">{channel.name}</span>
              </div>
            ))}
          </div>

          {/* Programs Grid */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-auto relative scroll-smooth"
          >
            {/* Now Indicator */}
            <div 
              className="absolute top-0 bottom-0 w-[2px] bg-red-500 z-20 pointer-events-none"
              style={{ left: `${nowOffset}px` }}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
            </div>

            <div className="relative" style={{ width: `${24 * HOUR_WIDTH}px` }}>
              {filteredChannels.map(channel => (
                <div key={channel.id} className="h-[80px] border-b border-white/5 relative group">
                  {channel.programs.map(program => {
                    const width = getProgramWidth(program);
                    const left = getProgramOffset(program);
                    const isLive = isWithinInterval(currentTime, { start: program.start, end: program.end });

                    return (
                      <div
                        key={program.id}
                        className={cn(
                          "absolute top-1 bottom-1 rounded-md p-3 cursor-pointer transition-all border border-white/5 overflow-hidden",
                          isLive ? "bg-white/10 border-white/20" : "bg-white/5 hover:bg-white/10",
                          selectedProgram?.id === program.id && "ring-2 ring-white/50 bg-white/20"
                        )}
                        style={{ left: `${left}px`, width: `${width - 4}px` }}
                        onClick={() => setSelectedProgram(program)}
                      >
                        <div className="flex flex-col h-full justify-between">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-xs font-bold truncate leading-tight">{program.title}</h3>
                            {isLive && (
                              <span className="shrink-0 text-[8px] font-black bg-red-500 text-white px-1 rounded uppercase animate-pulse">Live</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-white/40 font-mono">
                            <span>{format(program.start, 'HH:mm')}</span>
                            <span>-</span>
                            <span>{format(program.end, 'HH:mm')}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="absolute bottom-6 right-6 flex gap-2 z-50">
          <button 
            onClick={() => handleScroll('left')}
            className="p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md border border-white/10 transition-all"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button 
            onClick={() => handleScroll('right')}
            className="p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md border border-white/10 transition-all"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </main>

      {/* Program Detail Modal */}
      <AnimatePresence>
        {selectedProgram && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
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
              className="relative w-full max-w-2xl bg-[#1a1a1a] rounded-3xl overflow-hidden border border-white/10 shadow-2xl"
            >
              <div className="relative h-64">
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
                  <ChevronRight className="w-6 h-6 rotate-45" />
                </button>
              </div>
              
              <div className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-wider text-white/70 border border-white/10">
                    {selectedProgram.category}
                  </span>
                  <div className="flex items-center gap-2 text-white/40 text-sm font-mono">
                    <Clock className="w-4 h-4" />
                    <span>{format(selectedProgram.start, 'HH:mm')} - {format(selectedProgram.end, 'HH:mm')}</span>
                  </div>
                </div>

                <h2 className="text-3xl font-bold mb-4 tracking-tight">{selectedProgram.title}</h2>
                <p className="text-white/60 leading-relaxed mb-8 text-lg">
                  {selectedProgram.description}
                </p>

                <div className="flex gap-4">
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
      <nav className="md:hidden flex items-center justify-around py-4 bg-[#141414] border-t border-white/10">
        <div className="flex flex-col items-center gap-1 text-white">
          <Menu className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase">Guide</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-white/40">
          <Search className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase">Search</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-white/40">
          <Calendar className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase">Calendar</span>
        </div>
      </nav>
    </div>
  );
}
