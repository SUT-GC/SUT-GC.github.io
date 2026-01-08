import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { slides, type SlideData } from '@/lib/slides-data';
import { ChevronRight, ChevronLeft, ExternalLink, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================
// Slide 1: Cover Slide - 封面
// ============================================
const CoverSlide = ({ slide }: { slide: SlideData }) => (
  <div className="relative w-full h-full flex flex-col items-center justify-center text-center p-12">
    {slide.image && (
      <div className="absolute inset-0 z-0">
        <img src={slide.image} alt="Background" className="w-full h-full object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/30" />
      </div>
    )}
    <div className="relative z-10 space-y-6 max-w-5xl">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-blue via-white to-neon-purple drop-shadow-lg">
          {slide.title}
        </h1>
        {slide.subtitle && (
          <h2 className="text-5xl md:text-7xl lg:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-cyan mt-2 neon-text-purple">
            {slide.subtitle}
          </h2>
        )}
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="space-y-4 mt-8"
      >
        {slide.points?.map((point, i) => (
          <p key={i} className="text-xl md:text-2xl lg:text-3xl text-gray-300 font-light tracking-wide">
            {point}
          </p>
        ))}
      </motion.div>
    </div>
    {/* 装饰元素 */}
    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2">
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="w-2 h-2 bg-neon-cyan rounded-full"
      />
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
        className="w-2 h-2 bg-neon-purple rounded-full"
      />
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.4 }}
        className="w-2 h-2 bg-neon-blue rounded-full"
      />
    </div>
  </div>
);

// ============================================
// Slide Type: Comparison - 左右对比
// ============================================
const ComparisonSlide = ({ slide }: { slide: SlideData }) => (
  <div className="w-full h-full flex flex-col p-8 md:p-12 relative overflow-hidden">
    {/* 背景装饰 */}
    <div className="absolute top-0 left-0 w-96 h-96 bg-neon-blue/10 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" />
    <div className="absolute bottom-0 right-0 w-96 h-96 bg-neon-purple/10 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2" />

    {/* 标题 */}
    <motion.h2
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-3xl md:text-4xl font-bold text-center mb-8 text-white"
    >
      {slide.title}
    </motion.h2>

    {/* 对比卡片 */}
    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto w-full">
      {/* 左侧 */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-panel p-8 rounded-2xl border-l-4 border-neon-blue/50 flex flex-col"
      >
        <div className="flex items-center gap-4 mb-6">
          <span className="text-5xl">{slide.leftIcon}</span>
          <h3 className="text-2xl md:text-3xl font-bold text-neon-blue">{slide.leftTitle}</h3>
        </div>
        <div className="space-y-4 flex-1">
          {slide.leftPoints?.map((point, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="flex items-start gap-3"
            >
              <div className="w-2 h-2 rounded-full bg-neon-blue mt-2 shrink-0" />
              <p className="text-lg text-gray-300">{point}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* 右侧 */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-panel p-8 rounded-2xl border-r-4 border-neon-purple/50 flex flex-col"
      >
        <div className="flex items-center gap-4 mb-6">
          <span className="text-5xl">{slide.rightIcon}</span>
          <h3 className="text-2xl md:text-3xl font-bold text-neon-purple">{slide.rightTitle}</h3>
        </div>
        <div className="space-y-4 flex-1">
          {slide.rightPoints?.map((point, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="flex items-start gap-3"
            >
              <div className="w-2 h-2 rounded-full bg-neon-purple mt-2 shrink-0" />
              <p className="text-lg text-gray-300">{point}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>

    {/* 底部金句 */}
    {slide.quote && (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-8 text-center"
      >
        <p className="text-xl md:text-2xl text-neon-cyan italic font-light">
          "{slide.quote}"
        </p>
        {slide.quoteCn && (
          <p className="text-lg text-gray-400 mt-2">{slide.quoteCn}</p>
        )}
        {slide.extra && !slide.quoteCn && (
          <p className="text-lg text-gray-400 mt-2">{slide.extra}</p>
        )}
      </motion.div>
    )}
  </div>
);

// ============================================
// Slide Type: Quote - 大引用金句
// ============================================
const QuoteSlide = ({ slide }: { slide: SlideData }) => (
  <div className="w-full h-full flex flex-col items-center justify-center p-12 relative overflow-hidden">
    {/* 背景装饰 */}
    <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/5 via-transparent to-neon-blue/5" />
    <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-neon-purple/20 rounded-full blur-[100px]" />
    <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-neon-blue/20 rounded-full blur-[100px]" />

    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="relative z-10 max-w-4xl text-center"
    >
      {/* 标题 */}
      <h2 className="text-4xl md:text-6xl font-bold mb-4 text-white">
        {slide.title}
      </h2>
      {slide.subtitle && (
        <h3 className="text-3xl md:text-5xl font-bold mb-8 text-neon-cyan">
          {slide.subtitle}
        </h3>
      )}

      {/* 大引号装饰 */}
      <div className="relative">
        <span className="absolute -top-8 -left-4 text-8xl text-neon-purple/30 font-serif">"</span>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-xl md:text-2xl lg:text-3xl text-gray-200 leading-relaxed px-8"
        >
          {slide.quote}
        </motion.p>
        <span className="absolute -bottom-12 -right-4 text-8xl text-neon-purple/30 font-serif">"</span>
      </div>

      {slide.extra && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-xl text-neon-cyan"
        >
          {slide.extra}
        </motion.p>
      )}
    </motion.div>
  </div>
);

// ============================================
// Slide Type: Content - 内容页
// ============================================
const ContentSlide = ({ slide }: { slide: SlideData }) => {
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
        <div className={cn(
          "space-y-2 overflow-y-auto pr-2",
          slide.extra ? "md:col-span-8" : "md:col-span-12"
        )}>
          {slide.points?.map((point, i) => {
            const isSub = isSubItem(point);
            const displayText = isSub ? point.replace(/^[•\-]\s*/, '').replace(/^\d+\.\s*/, '') : point;

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

      {/* 底部金句 */}
      {slide.quote && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-4 pt-4 border-t border-white/10 text-center"
        >
          <p className="text-lg text-neon-cyan/80 italic">"{slide.quote}"</p>
          {slide.quoteCn && (
            <p className="text-base text-gray-400 mt-1">{slide.quoteCn}</p>
          )}
        </motion.div>
      )}
    </div>
  );
};

// ============================================
// Slide Type: Code Example - 代码示例
// ============================================
const CodeExampleSlide = ({ slide }: { slide: SlideData }) => (
  <div className="w-full h-full flex flex-col p-8 md:p-12 relative overflow-hidden">
    {/* Header */}
    <motion.h2
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-2xl md:text-3xl font-bold text-white mb-6"
    >
      {slide.title}
    </motion.h2>

    <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 min-h-0">
      {/* Code Block */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="md:col-span-8 relative"
      >
        <div className="absolute top-0 left-0 right-0 h-8 bg-gray-800 rounded-t-xl flex items-center gap-2 px-4">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
          <span className="ml-4 text-xs text-gray-400 font-mono">{slide.codeLanguage || 'code'}</span>
        </div>
        <pre className="bg-gray-900/90 rounded-xl pt-12 pb-6 px-6 overflow-auto h-full border border-white/10">
          <code className="text-sm md:text-base text-gray-300 font-mono whitespace-pre leading-relaxed">
            {slide.code}
          </code>
        </pre>
        {/* 发光效果 */}
        <div className="absolute -inset-1 bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 rounded-xl blur-xl -z-10" />
      </motion.div>

      {/* Side Note */}
      {slide.extra && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="md:col-span-4 flex flex-col justify-center"
        >
          <div className="glass-panel p-6 rounded-xl">
            <div className="w-12 h-12 rounded-full bg-neon-cyan/20 flex items-center justify-center mb-4">
              <span className="text-2xl">💡</span>
            </div>
            <p className="text-xl md:text-2xl text-white font-medium leading-relaxed">
              {slide.extra}
            </p>
          </div>
        </motion.div>
      )}
    </div>
  </div>
);

// ============================================
// Slide Type: Pyramid - 金字塔图
// ============================================
const PyramidSlide = ({ slide }: { slide: SlideData }) => (
  <div className="w-full h-full flex flex-col p-8 md:p-12 relative overflow-hidden">
    {/* Header */}
    <motion.h2
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-2xl md:text-3xl font-bold text-white text-center mb-8"
    >
      {slide.title}
    </motion.h2>

    {/* Pyramid */}
    <div className="flex-1 flex flex-col items-center justify-center gap-4 max-w-4xl mx-auto w-full">
      {slide.pyramidLevels?.map((level, i) => {
        const widths = ['60%', '75%', '90%'];
        const colors = [
          'from-neon-cyan to-neon-blue',
          'from-neon-blue to-neon-purple',
          'from-neon-purple to-pink-500'
        ];
        const glowColors = [
          'shadow-[0_0_30px_rgba(0,255,240,0.3)]',
          'shadow-[0_0_30px_rgba(0,243,255,0.3)]',
          'shadow-[0_0_30px_rgba(188,19,254,0.3)]'
        ];

        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: i * 0.2 + 0.2 }}
            style={{ width: widths[i] }}
            className={cn(
              "relative p-6 rounded-xl bg-gradient-to-r",
              colors[i],
              glowColors[i]
            )}
          >
            <div className="flex items-center gap-4">
              <span className="text-3xl">{level.icon}</span>
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-white">{level.title}</h3>
                <p className="text-sm md:text-base text-white/80 mt-1">{level.description}</p>
              </div>
            </div>
            {/* 连接线 */}
            {i < (slide.pyramidLevels?.length || 0) - 1 && (
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-0.5 h-4 bg-white/30" />
            )}
          </motion.div>
        );
      })}
    </div>
  </div>
);

// ============================================
// Slide Type: Stats - 数据统计
// ============================================
const StatsSlide = ({ slide }: { slide: SlideData }) => (
  <div className="w-full h-full flex flex-col p-8 md:p-12 relative overflow-hidden">
    {/* Header */}
    <motion.h2
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-2xl md:text-3xl font-bold text-white text-center mb-8"
    >
      {slide.title}
    </motion.h2>

    {/* Stats Grid */}
    <div className="flex-1 flex flex-col justify-center">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto w-full mb-8">
        {slide.stats?.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15 + 0.2 }}
            className="glass-panel p-8 rounded-2xl text-center group hover:border-neon-cyan/30 transition-all"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.15 + 0.4, type: "spring" }}
              className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-blue mb-2"
            >
              {stat.value}
            </motion.div>
            <div className="text-lg font-semibold text-white mb-1">{stat.label}</div>
            {stat.description && (
              <div className="text-sm text-gray-400">{stat.description}</div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Additional Points */}
      {slide.points && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="max-w-3xl mx-auto space-y-2"
        >
          {slide.points.map((point, i) => (
            <p key={i} className="text-lg text-gray-300 text-center">{point}</p>
          ))}
        </motion.div>
      )}

      {slide.extra && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-xl text-neon-cyan text-center mt-6 font-medium"
        >
          {slide.extra}
        </motion.p>
      )}
    </div>
  </div>
);

// ============================================
// Slide Type: CTA - 行动号召
// ============================================
const CTASlide = ({ slide }: { slide: SlideData }) => {
  const isSubItem = (point: string) =>
    point.startsWith('•') || point.startsWith('- ');

  // 把 points 分组
  const groups: { title: string; items: string[] }[] = [];
  let currentGroup: { title: string; items: string[] } | null = null;

  slide.points?.forEach(point => {
    if (!isSubItem(point)) {
      if (currentGroup) groups.push(currentGroup);
      currentGroup = { title: point.replace('：', ''), items: [] };
    } else if (currentGroup) {
      currentGroup.items.push(point.replace(/^[•\-]\s*/, ''));
    }
  });
  if (currentGroup) groups.push(currentGroup);

  const icons = ['👨‍💻', '📝', '👔'];

  return (
    <div className="w-full h-full flex flex-col p-8 md:p-12 relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 bg-gradient-to-br from-neon-blue/5 via-transparent to-neon-purple/5" />

      {/* Header */}
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl md:text-4xl font-bold text-white text-center mb-8"
      >
        {slide.title}
      </motion.h2>

      {/* CTA Cards */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto w-full">
        {groups.map((group, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15 + 0.2 }}
            className="glass-panel p-6 rounded-2xl border-t-4 border-neon-cyan/50 hover:border-neon-cyan transition-all"
          >
            <div className="text-4xl mb-4">{icons[i]}</div>
            <h3 className="text-xl font-bold text-neon-cyan mb-4">{group.title}</h3>
            <ul className="space-y-3">
              {group.items.map((item, j) => (
                <li key={j} className="flex items-start gap-2 text-gray-300">
                  <span className="text-neon-purple">→</span>
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// ============================================
// Slide Type: Resources - 资源链接
// ============================================
const ResourcesSlide = ({ slide }: { slide: SlideData }) => (
  <div className="w-full h-full flex flex-col p-8 md:p-12 relative overflow-hidden">
    {/* Header */}
    <motion.h2
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-2xl md:text-3xl font-bold text-white text-center mb-8"
    >
      {slide.title}
    </motion.h2>

    {/* Resources Grid */}
    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto w-full">
      {slide.resources?.map((resource, i) => (
        <motion.a
          key={i}
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 + 0.2 }}
          className="glass-panel p-6 rounded-xl group hover:border-neon-cyan/50 transition-all cursor-pointer"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold text-white group-hover:text-neon-cyan transition-colors">
                {resource.title}
              </h3>
              {resource.description && (
                <p className="text-gray-400 mt-2">{resource.description}</p>
              )}
              <p className="text-sm text-neon-blue/70 mt-2 font-mono truncate max-w-xs">
                {resource.url}
              </p>
            </div>
            <ExternalLink className="text-gray-500 group-hover:text-neon-cyan transition-colors shrink-0" size={20} />
          </div>
        </motion.a>
      ))}
    </div>

    {slide.extra && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-8 text-center"
      >
        <p className="text-lg text-neon-cyan">{slide.extra}</p>
      </motion.div>
    )}
  </div>
);

// ============================================
// Slide Type: Demo - 演示页
// ============================================
const DemoSlide = ({ slide }: { slide: SlideData }) => (
  <div className="w-full h-full flex flex-col items-center justify-center p-12 relative overflow-hidden">
    {/* 动态背景 */}
    <div className="absolute inset-0">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full border border-neon-blue/20"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute inset-8 rounded-full border border-neon-purple/20"
        />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute inset-16 rounded-full border border-neon-cyan/20"
        />
      </div>
    </div>

    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="relative z-10 text-center"
    >
      <div className="w-24 h-24 rounded-full bg-gradient-to-r from-neon-blue to-neon-purple flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(0,243,255,0.5)]">
        <Play className="text-white" size={40} />
      </div>
      <h2 className="text-6xl md:text-8xl font-bold text-white neon-text-blue mb-4">
        {slide.title}
      </h2>
      {slide.subtitle && (
        <p className="text-2xl text-gray-400">{slide.subtitle}</p>
      )}
    </motion.div>
  </div>
);

// ============================================
// Slide Type: Timeline - 时间线成长图
// ============================================
const TimelineSlide = ({ slide }: { slide: SlideData }) => {
  // 文件夹图标 SVG
  const FolderIcon = ({ size = 32 }: { size?: number }) => (
    <svg width={size} height={size * 0.9} viewBox="0 0 40 36" fill="none">
      <path d="M4 8C4 5.79086 5.79086 4 8 4H14L18 8H32C34.2091 8 36 9.79086 36 12V28C36 30.2091 34.2091 32 32 32H8C5.79086 32 4 30.2091 4 28V8Z" fill="#F97316" />
      <path d="M4 12H36V28C36 30.2091 34.2091 32 32 32H8C5.79086 32 4 30.2091 4 28V12Z" fill="#FB923C" />
    </svg>
  );

  // 机器人图标
  const RobotIcon = ({ size = 80, glow = false }: { size?: number; glow?: boolean }) => (
    <div className={cn("relative", glow && "drop-shadow-[0_0_30px_rgba(251,146,60,0.6)]")}>
      <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
        <rect x="15" y="20" width="50" height="40" rx="8" fill="#1E3A5F" stroke="#3B82F6" strokeWidth="2" />
        <circle cx="30" cy="38" r="6" fill="#3B82F6" />
        <circle cx="50" cy="38" r="6" fill="#3B82F6" />
        <circle cx="30" cy="38" r="3" fill="#93C5FD" />
        <circle cx="50" cy="38" r="3" fill="#93C5FD" />
        <line x1="40" y1="20" x2="40" y2="10" stroke="#3B82F6" strokeWidth="2" />
        <circle cx="40" cy="8" r="4" fill="#3B82F6" />
        <rect x="28" y="48" width="24" height="4" rx="2" fill="#3B82F6" />
        <path d="M25 62H55" stroke="#3B82F6" strokeWidth="2" />
        <path d="M20 70H60" stroke="#3B82F6" strokeWidth="2" />
      </svg>
    </div>
  );

  return (
    <div className="w-full h-full flex flex-col p-8 md:p-12 relative overflow-hidden">
      {/* 标题 */}
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl md:text-3xl font-bold text-white text-center mb-6"
      >
        {slide.title}
      </motion.h2>

      {/* 上半部分：左右两栏文字 */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        {/* 左侧：概念 + 例子 */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <div className="glass-panel p-5 rounded-xl">
            <h3 className="text-lg font-bold text-white mb-2">核心概念</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Skills 为持续学习创造了具体路径。标准化格式保证「Claude 写下的任何东西，都能被未来版本的自己高效使用」。
            </p>
            <p className="text-neon-cyan text-sm mt-2">这让学习变得可传递。</p>
          </div>
          <div className="glass-panel p-5 rounded-xl">
            <h3 className="text-lg font-bold text-white mb-2">例子</h3>
            <p className="text-gray-400 text-sm italic leading-relaxed">
              "我们不断看到 Claude 反复写同一个 Python 脚本... 于是我们让 Claude 把它保存到 Skill 里，作为给未来自己的工具。"
            </p>
          </div>
        </motion.div>

        {/* 右侧：影响 */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center"
        >
          <div className="glass-panel p-5 rounded-xl border-l-4 border-neon-cyan w-full">
            <h3 className="text-lg font-bold text-white mb-2">影响</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              第 30 天的 Agent 明显比第 1 天更强，因为它积累了你们团队的<span className="text-neon-cyan font-medium">特定程序性知识</span>。
            </p>
          </div>
        </motion.div>
      </div>

      {/* 下半部分：时间线图 - 使用 flex 布局确保对齐 */}
      <div className="flex-1 flex items-center justify-center">
        <div className="flex items-center gap-4 w-full max-w-4xl">
          {/* Day 1 机器人 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col items-center shrink-0"
          >
            <RobotIcon size={70} />
            <p className="text-neon-blue font-orbitron text-sm mt-2">Day 1</p>
          </motion.div>

          {/* 中间：时间线 + 文件夹 */}
          <div className="flex-1 relative h-32">
            {/* 时间线 - 垂直居中 */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-neon-blue via-neon-purple to-neon-cyan origin-left -translate-y-1/2"
            />

            {/* 文件夹们 - 沿着时间线上下交错 */}
            <div className="absolute inset-x-4 top-0 bottom-0 flex justify-between items-center">
              {[
                { delay: 0.8, top: true },
                { delay: 1.0, top: false },
                { delay: 1.2, top: true },
                { delay: 1.4, top: false },
                { delay: 1.6, top: true },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: item.top ? -20 : 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: item.delay, duration: 0.4 }}
                  className={cn(
                    "flex flex-col items-center",
                    item.top ? "-translate-y-8" : "translate-y-8"
                  )}
                >
                  <div className={item.top ? "order-1" : "order-2"}>
                    <FolderIcon size={32} />
                  </div>
                  {/* 虚线连接到时间线 */}
                  <div className={cn(
                    "w-px h-3 border-l border-dashed border-orange-400/60",
                    item.top ? "order-2" : "order-1"
                  )} />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Day 30 机器人 + 文件夹堆 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.8 }}
            className="flex items-end gap-2 shrink-0"
          >
            {/* 文件夹堆 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.0 }}
              className="flex flex-col gap-0.5 mb-6"
            >
              <FolderIcon size={24} />
              <FolderIcon size={24} />
              <FolderIcon size={24} />
            </motion.div>
            <div className="flex flex-col items-center">
              <RobotIcon size={90} glow />
              <p className="text-neon-cyan font-orbitron text-sm mt-2">Day 30</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// Slide Type: Closing - 结尾
// ============================================
const ClosingSlide = ({ slide }: { slide: SlideData }) => (
  <div className="relative w-full h-full flex flex-col items-center justify-center p-12">
    {slide.image && (
      <div className="absolute inset-0 z-0">
        <img src={slide.image} alt="Background" className="w-full h-full object-cover opacity-50" />
        <div className="absolute inset-0 bg-black/60" />
      </div>
    )}
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="relative z-10 text-center glass-panel px-20 py-16 rounded-3xl border-neon-blue/20"
    >
      <h2 className="text-6xl md:text-8xl font-bold text-white mb-6 neon-text-blue">
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

// ============================================
// Main Deck Component
// ============================================
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

  const renderSlide = () => {
    switch (slide.type) {
      case 'title-cover':
        return <CoverSlide slide={slide} />;
      case 'comparison':
        return <ComparisonSlide slide={slide} />;
      case 'quote':
        return <QuoteSlide slide={slide} />;
      case 'content':
        return <ContentSlide slide={slide} />;
      case 'code-example':
        return <CodeExampleSlide slide={slide} />;
      case 'pyramid':
        return <PyramidSlide slide={slide} />;
      case 'stats':
        return <StatsSlide slide={slide} />;
      case 'cta':
        return <CTASlide slide={slide} />;
      case 'resources':
        return <ResourcesSlide slide={slide} />;
      case 'demo':
        return <DemoSlide slide={slide} />;
      case 'timeline':
        return <TimelineSlide slide={slide} />;
      case 'closing':
        return <ClosingSlide slide={slide} />;
      default:
        return <ContentSlide slide={slide} />;
    }
  };

  return (
    <div
      className="w-full h-screen bg-background text-foreground relative overflow-hidden"
      onClick={nextSlide}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.3 }}
          className="w-full h-full absolute inset-0"
        >
          {renderSlide()}
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
          className="h-full bg-gradient-to-r from-neon-cyan to-neon-blue shadow-[0_0_10px_#00fff0]"
          initial={{ width: 0 }}
          animate={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  );
}
