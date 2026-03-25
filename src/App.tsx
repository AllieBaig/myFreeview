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
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setChannels(getMockChannels());
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const filteredChannels = channels.filter(channel => 
    channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    channel.programs.some(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Helper to find the current program for a channel
  const getCurrentProgram = (channel: Channel) => {
    return channel.programs.find(p => 
      isWithinInterval(currentTime, { start: p.start, end: p.end })
    ) || channel.programs[0]; // Fallback to first if none active (e.g. late night)
  };

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0a] text-white font-sans overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#141414] z-50">
        <div className="flex items-center gap-4">
          <Menu className="w-6 h-6 text-white/70 cursor-pointer hover:text-white" />
          <h1 className="text-xl font-bold tracking-tighter text-white">myFreeview</h1>
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

      {/* Main Content - 3 Column List View */}
      <main className="flex-1 overflow-y-auto bg-[#0a0a0a]">
        <div className="max-w-6xl mx-auto px-6 py-8">
          {/* Table Header */}
          <div className="grid grid-cols-[200px_150px_1fr] gap-4 px-6 py-4 bg-[#141414] rounded-t-2xl border border-white/10 text-[10px] uppercase tracking-widest font-bold text-white/40">
            <div>Channel</div>
            <div>Time</div>
            <div>Show Name</div>
          </div>

          {/* Channel Rows */}
          <div className="border-x border-b border-white/10 rounded-b-2xl overflow-hidden divide-y divide-white/5">
            {filteredChannels.map(channel => {
              const currentProgram = getCurrentProgram(channel);
              return (
                <div 
                  key={channel.id} 
                  className="grid grid-cols-[200px_150px_1fr] gap-4 px-6 py-6 items-center hover:bg-white/5 transition-colors cursor-pointer group"
                  onClick={() => setSelectedProgram(currentProgram)}
                >
                  {/* Column 1: Channel */}
                  <div className="flex items-center gap-4">
                    <img 
                      src={channel.logo} 
                      alt={channel.name} 
                      className="w-12 h-12 rounded-xl object-cover border border-white/10 group-hover:border-white/30 transition-all"
                      referrerPolicy="no-referrer"
                    />
                    <span className="font-bold text-sm tracking-tight">{channel.name}</span>
                  </div>

                  {/* Column 2: Time */}
                  <div className="flex items-center gap-2 text-sm font-mono text-white/60">
                    <span className="bg-white/5 px-2 py-1 rounded border border-white/5">
                      {format(currentProgram.start, 'HH:mm')}
                    </span>
                    <span className="text-white/20">-</span>
                    <span className="bg-white/5 px-2 py-1 rounded border border-white/5">
                      {format(currentProgram.end, 'HH:mm')}
                    </span>
                  </div>

                  {/* Column 3: Show Name */}
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-base group-hover:text-white transition-colors">
                        {currentProgram.title}
                      </span>
                      <span className="text-xs text-white/40 line-clamp-1">
                        {currentProgram.description}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[8px] font-black bg-red-500 text-white px-1.5 py-0.5 rounded uppercase">Live</span>
                      <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/60 transition-all" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
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
