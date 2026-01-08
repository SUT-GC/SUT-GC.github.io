import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { slides, type SlideData } from '@/lib/slides-data';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

// --- Sub-components for different slide types ---

const CoverSlide = ({ slide }: { slide: SlideData }) => (
  <div className="relative w-full h-full flex flex-col items-center justify-center text-center p-12">
    {slide.image && (
      <div className="absolute inset-0 z-0">
        <img src={slide.image} alt="Background" className="w-full h-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      </div>
    )}
    <div className="relative z-10 space-y-6 max-w-4xl">
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-purple drop-shadow-lg neon-text-blue"
      >
        {slide.title}
      </motion.h1>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        className="space-y-4"
      >
        {slide.points?.map((point, i) => (
          <p key={i} className="text-xl md:text-2xl text-gray-300 font-light tracking-wide">
            {point}
          </p>
        ))}
      </motion.div>
    </div>
  </div>
);

const AgendaSlide = ({ slide }: { slide: SlideData }) => (
  <div className="w-full h-full flex flex-col p-16 md:p-24 relative overflow-hidden">
    <div className="absolute top-0 right-0 w-96 h-96 bg-neon-purple/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
    
    <motion.h2 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="text-4xl md:text-5xl font-bold mb-16 text-neon-blue flex items-center gap-4"
    >
      <span className="w-2 h-12 bg-neon-purple rounded-full" />
      {slide.title}
    </motion.h2>
    
    <div className="flex-1 flex flex-col justify-center space-y-8 pl-8 border-l border-white/10">
      {slide.points?.map((point, i) => (
        <motion.div 
          key={i}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 + 0.3 }}
          className="flex items-center gap-6 group"
        >
          <span className="text-2xl font-orbitron text-white/30 group-hover:text-neon-cyan transition-colors">
            {(i + 1).toString().padStart(2, '0')}
          </span>
          <span className="text-2xl md:text-3xl text-gray-200 group-hover:text-white transition-colors group-hover:translate-x-2 duration-300">
            {point}
          </span>
        </motion.div>
      ))}
    </div>
  </div>
);

const SectionDividerSlide = ({ slide }: { slide: SlideData }) => (
  <div className="w-full h-full flex flex-col items-center justify-center p-12 relative bg-gradient-to-br from-background via-background to-neon-blue/10">
    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
    
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="relative z-10 text-center"
    >
      <h2 className="text-5xl md:text-7xl font-bold mb-8 text-white neon-text-purple">
        {slide.title}
      </h2>
      <div className="w-32 h-2 bg-gradient-to-r from-neon-blue to-neon-purple mx-auto rounded-full mb-8" />
      {slide.points?.map((point, i) => (
        <p key={i} className="text-2xl text-gray-400 max-w-2xl mx-auto">
          {point}
        </p>
      ))}
    </motion.div>
  </div>
);

const ContentSlide = ({ slide }: { slide: SlideData }) => {
  // Check if a point is a sub-item (starts with •, -, or numbered like 1. 2. 3.)
  const isSubItem = (point: string) =>
    point.startsWith('•') || point.startsWith('- ') || /^\d+\.\s/.test(point);

  return (
    <div className="w-full h-full flex flex-col p-8 md:p-12 relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 shrink-0">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl md:text-3xl font-bold text-white/90 border-b-2 border-neon-blue/50 pb-3 inline-block pr-8"
        >
          {slide.title}
        </motion.h2>
        <div className="text-neon-cyan/50 font-orbitron text-sm">AGENT SKILLS</div>
      </div>

      {/* Content Area */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 min-h-0">
        {/* Main Points */}
        <div className="md:col-span-8 space-y-2 overflow-y-auto pr-2">
          {slide.points?.map((point, i) => {
            const isSub = isSubItem(point);
            const displayText = isSub ? point.replace(/^[•\-]\s*/, '') : point;

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 + 0.1 }}
                className={cn(
                  "flex items-start gap-3 transition-colors",
                  isSub
                    ? "ml-6 pl-4 py-2 border-l-2 border-neon-purple/30"
                    : "glass-panel p-4 hover:border-neon-blue/30"
                )}
              >
                {!isSub && (
                  <div className="mt-1.5 w-2 h-2 rounded-full bg-neon-purple shrink-0" />
                )}
                {isSub && (
                  <div className="mt-2 w-1.5 h-1.5 rounded-full bg-neon-cyan/60 shrink-0" />
                )}
                <p className={cn(
                  "leading-relaxed",
                  isSub
                    ? "text-sm md:text-base text-gray-300"
                    : "text-base md:text-lg text-gray-200"
                )}>
                  {displayText}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Extra/Notes Side Panel */}
        {slide.extra && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="md:col-span-4 bg-white/5 rounded-xl p-6 border border-white/5 h-fit backdrop-blur-sm"
          >
            <h3 className="text-neon-cyan text-sm font-bold uppercase tracking-widest mb-4">Key Insights</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              {slide.extra}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

const ClosingSlide = ({ slide }: { slide: SlideData }) => (
  <div className="relative w-full h-full flex flex-col items-center justify-center p-12">
    {slide.image && (
      <div className="absolute inset-0 z-0">
        <img src={slide.image} alt="Background" className="w-full h-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-black/50" />
      </div>
    )}
    <motion.div 
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="relative z-10 text-center glass-panel px-20 py-16 rounded-3xl border-neon-blue/20"
    >
      <h2 className="text-6xl md:text-7xl font-bold text-white mb-6 neon-text-blue">
        {slide.title}
      </h2>
      {slide.points?.map((point, i) => (
        <p key={i} className="text-2xl text-neon-cyan/80 mt-4 font-light">
          {point}
        </p>
      ))}
    </motion.div>
  </div>
);

// --- Main Deck Component ---

export default function SlideDeck() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentSlide(prev => Math.min(prev + 1, slides.length - 1));
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide(prev => Math.max(prev - 1, 0));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide]);

  const slide = slides[currentSlide];

  return (
    <div 
      className="w-full h-screen bg-background text-foreground relative overflow-hidden"
      onClick={nextSlide}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.4 }}
          className="w-full h-full absolute inset-0"
        >
          {slide.type === 'title-cover' && <CoverSlide slide={slide} />}
          {slide.type === 'agenda' && <AgendaSlide slide={slide} />}
          {slide.type === 'section-divider' && <SectionDividerSlide slide={slide} />}
          {slide.type === 'content' && <ContentSlide slide={slide} />}
          {slide.type === 'closing' && <ClosingSlide slide={slide} />}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Controls (Bottom Bar) */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-between px-8 pb-4 z-50 pointer-events-none"
      >
        <div className="text-xs text-white/30 font-orbitron pointer-events-auto">
          AGENT SKILLS
        </div>
        
        <div className="flex items-center gap-4 pointer-events-auto">
          <button 
            onClick={(e) => { e.stopPropagation(); prevSlide(); }}
            className="p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors disabled:opacity-30"
            disabled={currentSlide === 0}
          >
            <ChevronLeft size={24} />
          </button>
          
          <span className="text-neon-blue font-orbitron text-lg tracking-widest">
            {(currentSlide + 1).toString().padStart(2, '0')} 
            <span className="text-white/30 mx-2">/</span> 
            {slides.length.toString().padStart(2, '0')}
          </span>

          <button 
            onClick={(e) => { e.stopPropagation(); nextSlide(); }}
            className="p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors disabled:opacity-30"
            disabled={currentSlide === slides.length - 1}
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 h-1 bg-neon-purple/30 w-full z-50">
        <motion.div 
          className="h-full bg-neon-cyan shadow-[0_0_10px_#00fff0]"
          initial={{ width: 0 }}
          animate={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
        />
      </div>
    </div>
  );
}
