import { useEffect, useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { CosmicBackground } from '@/components/common/CosmicBackground';
import { Sparkles, Lock, Star, Crown, Flame, Trees, Mountain, Waves, Gem, Castle, Palmtree, Check, Anchor, Ship, Fish } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

type IslandKind = 'forest' | 'palm' | 'beach' | 'jungle' | 'volcano' | 'mini' | 'falls' | 'crystal' | 'desert' | 'castle';

interface Island {
  id: number;
  x: number;
  y: number;
  kind: IslandKind;
  size: number;
  hue: number;
  name: string;
}

const ISLANDS: Island[] = [
  { id: 1,  x: 10, y: 20, kind: 'forest',  size: 1.1,  hue: 145, name: 'Изумрудный лес' },
  { id: 2,  x: 28, y: 12, kind: 'palm',    size: 1.0,  hue: 160, name: 'Пальмовый рай' },
  { id: 3,  x: 46, y: 22, kind: 'beach',   size: 0.95, hue: 45,  name: 'Золотой берег' },
  { id: 4,  x: 64, y: 15, kind: 'jungle',  size: 1.15, hue: 130, name: 'Дикие джунгли' },
  { id: 5,  x: 84, y: 28, kind: 'volcano', size: 1.1,  hue: 15,  name: 'Огненная гора' },
  { id: 6,  x: 76, y: 52, kind: 'mini',    size: 0.9,  hue: 55,  name: 'Скала странника' },
  { id: 7,  x: 56, y: 60, kind: 'falls',   size: 1.0,  hue: 190, name: 'Водопад мечты' },
  { id: 8,  x: 38, y: 68, kind: 'crystal', size: 1.1,  hue: 280, name: 'Кристальная пещера' },
  { id: 9,  x: 20, y: 58, kind: 'desert',  size: 0.95, hue: 30,  name: 'Песчаные дюны' },
  { id: 10, x: 8,  y: 78, kind: 'castle',  size: 1.2,  hue: 250, name: 'Замок легенд' },
];

const ICON_MAP: Record<IslandKind, any> = {
  forest: Trees,
  palm: Palmtree,
  beach: Waves,
  jungle: Trees,
  volcano: Flame,
  mini: Mountain,
  falls: Waves,
  crystal: Gem,
  desert: Mountain,
  castle: Castle,
};

// Animated water ripples around islands
function WaterRipples({ hue, size }: { hue: number; size: number }) {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: `${130 + i * 25}%`,
            height: `${50 + i * 15}%`,
            border: `2px solid hsl(${hue} 60% 50% / ${0.4 - i * 0.1})`,
            boxShadow: `0 0 ${10 + i * 5}px hsl(${hue} 70% 50% / ${0.3 - i * 0.08})`,
          }}
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.6 - i * 0.15, 0.3 - i * 0.08, 0.6 - i * 0.15],
          }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Infinity,
            delay: i * 0.8,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

// Floating particles around islands (fireflies, sparkles)
function IslandParticles({ hue }: { hue: number }) {
  const particles = useMemo(() =>
    Array.from({ length: 8 }).map((_, i) => ({
      id: i,
      x: 20 + Math.random() * 60,
      y: 10 + Math.random() * 40,
      size: 2 + Math.random() * 3,
      duration: 3 + Math.random() * 2,
      delay: Math.random() * 3,
    })),
    []
  );

  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: `hsl(${hue} 80% 70%)`,
            boxShadow: `0 0 ${p.size * 3}px hsl(${hue} 90% 60%)`,
          }}
          animate={{
            y: [0, -15, 0],
            x: [0, 8, -5, 0],
            opacity: [0, 1, 0.8, 0],
            scale: [0.5, 1.2, 0.8, 0.3],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

// Detailed 3D-like island component
function FloatingIsland({ island, index, onClick, unlocked, completed }: {
  island: Island;
  index: number;
  onClick: (i: Island) => void;
  unlocked: boolean;
  completed?: boolean;
}) {
  const Icon = ICON_MAP[island.kind];
  const baseHue = island.hue;
  const isVolcano = island.kind === 'volcano';
  const isCastle = island.kind === 'castle';
  const isCrystal = island.kind === 'crystal';

  return (
    <motion.button
      type="button"
      onClick={() => unlocked && onClick(island)}
      className="absolute -translate-x-1/2 -translate-y-1/2 group focus:outline-none"
      style={{ left: `${island.x}%`, top: `${island.y}%` }}
      initial={{ opacity: 0, scale: 0.3, y: 60, rotateX: 45 }}
      animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
      transition={{ 
        duration: 0.8, 
        delay: 0.2 + index * 0.12, 
        type: 'spring', 
        bounce: 0.35,
        stiffness: 100 
      }}
      whileHover={unlocked ? { scale: 1.12, y: -8 } : {}}
      whileTap={unlocked ? { scale: 0.92 } : {}}
    >
      {/* Main floating animation wrapper */}
      <motion.div
        animate={{ 
          y: [0, -18, 0, 8, 0], 
          rotate: [0, -2.5, 0, 2.5, 0],
          scale: [1, 1.02, 1, 0.98, 1]
        }}
        transition={{
          duration: 6 + index * 0.3,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: index * 0.4,
        }}
        style={{ width: 130 * island.size, height: 130 * island.size }}
        className="relative"
      >
        {/* Water ripples */}
        <WaterRipples hue={baseHue} size={island.size} />
        
        {/* Island particles */}
        <IslandParticles hue={baseHue} />

        {/* Outer glow aura */}
        <motion.div
          className="absolute inset-[-30%] rounded-full blur-3xl"
          style={{
            background: `radial-gradient(circle, hsl(${baseHue} 85% 55% / 0.5), hsl(${baseHue} 70% 40% / 0.2) 50%, transparent 70%)`,
          }}
          animate={{ 
            opacity: [0.4, 0.8, 0.4], 
            scale: [1, 1.2, 1] 
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity, 
            ease: 'easeInOut', 
            delay: index * 0.3 
          }}
        />

        {/* Island shadow on water */}
        <motion.div
          animate={{ 
            scaleX: [1, 0.6, 1, 1.15, 1], 
            scaleY: [1, 0.7, 1, 1.1, 1],
            opacity: [0.5, 0.2, 0.5, 0.55, 0.5] 
          }}
          transition={{ duration: 6 + index * 0.3, repeat: Infinity, ease: 'easeInOut', delay: index * 0.4 }}
          className="absolute left-1/2 -translate-x-1/2 w-[80%] h-6 rounded-[50%] blur-lg"
          style={{ 
            bottom: -16,
            background: `radial-gradient(ellipse, hsl(${baseHue} 50% 10% / 0.8), transparent 70%)`
          }}
        />

        {/* Main island body */}
        <div className="relative w-full h-full">
          {/* Underwater rocks/roots */}
          <div
            className="absolute left-1/2 -translate-x-1/2 bottom-[-8%] w-[60%] h-[25%]"
            style={{
              background: `linear-gradient(180deg, hsl(${baseHue} 20% 18%), hsl(${baseHue} 25% 8%))`,
              clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)',
              filter: 'blur(1px)',
            }}
          />
          
          {/* Bottom rock formation - layered for 3D effect */}
          <div
            className="absolute left-1/2 -translate-x-1/2 bottom-0 w-[95%] h-[60%]"
            style={{
              background: `linear-gradient(165deg, 
                hsl(${baseHue} 22% 32%) 0%, 
                hsl(${baseHue} 28% 22%) 40%, 
                hsl(${baseHue} 30% 12%) 100%)`,
              clipPath: 'polygon(5% 0%, 95% 0%, 100% 50%, 85% 100%, 15% 100%, 0% 50%)',
              boxShadow: `
                inset -15px -10px 30px hsl(${baseHue} 50% 5% / 0.9),
                inset 10px 5px 20px hsl(${baseHue} 40% 50% / 0.2)
              `,
            }}
          />
          
          {/* Rock texture overlay */}
          <div
            className="absolute left-1/2 -translate-x-1/2 bottom-[5%] w-[75%] h-[35%] opacity-60"
            style={{
              background: `
                linear-gradient(120deg, transparent 30%, hsl(${baseHue} 20% 40% / 0.3) 50%, transparent 70%),
                linear-gradient(240deg, transparent 30%, hsl(${baseHue} 25% 20% / 0.4) 50%, transparent 70%)
              `,
              clipPath: 'polygon(10% 0%, 90% 0%, 95% 100%, 5% 100%)',
            }}
          />

          {/* Grass/top terrain - main surface */}
          <div
            className="absolute left-1/2 -translate-x-1/2 top-[18%] w-[98%] h-[50%] rounded-[50%]"
            style={{
              background: `radial-gradient(ellipse at 40% 30%, 
                hsl(${baseHue} 70% 55%) 0%, 
                hsl(${baseHue} 60% 42%) 40%, 
                hsl(${baseHue} 55% 32%) 100%)`,
              boxShadow: `
                inset 0 -12px 25px hsl(${baseHue} 65% 18% / 0.8),
                inset 8px 8px 20px hsl(${baseHue} 80% 70% / 0.3),
                0 0 40px hsl(${baseHue} 80% 50% / 0.4)
              `,
            }}
          />
          
          {/* Grass highlight */}
          <div
            className="absolute left-[30%] top-[22%] w-[25%] h-[20%] rounded-full opacity-50"
            style={{
              background: `radial-gradient(ellipse, hsl(${baseHue} 75% 70%), transparent 70%)`,
              filter: 'blur(3px)',
            }}
          />

          {/* Volcano special effects */}
          {isVolcano && (
            <>
              <motion.div
                className="absolute left-1/2 -translate-x-1/2 top-[5%] w-8 h-8 rounded-full"
                style={{
                  background: 'radial-gradient(circle, hsl(30 100% 60%), hsl(15 90% 50%), hsl(0 80% 40%))',
                  boxShadow: '0 0 30px hsl(30 100% 50% / 0.8), 0 0 60px hsl(15 90% 40% / 0.5)',
                }}
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.8, 1, 0.8],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              {/* Lava particles */}
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1.5 h-1.5 rounded-full"
                  style={{
                    left: '50%',
                    top: '8%',
                    background: `hsl(${20 + i * 10} 100% 60%)`,
                    boxShadow: `0 0 6px hsl(${20 + i * 10} 100% 50%)`,
                  }}
                  animate={{
                    y: [0, -30 - i * 5, 0],
                    x: [-10 + i * 5, 10 - i * 3, -10 + i * 5],
                    opacity: [0, 1, 0],
                    scale: [0.5, 1, 0.3],
                  }}
                  transition={{
                    duration: 2 + i * 0.3,
                    repeat: Infinity,
                    delay: i * 0.4,
                  }}
                />
              ))}
            </>
          )}

          {/* Crystal special effects */}
          {isCrystal && (
            <>
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  style={{
                    left: `${35 + i * 10}%`,
                    top: `${5 + i * 3}%`,
                    width: 8 - i,
                    height: 20 - i * 3,
                    background: `linear-gradient(180deg, 
                      hsl(${280 + i * 20} 90% 80%), 
                      hsl(${280 + i * 20} 80% 50%))`,
                    clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)',
                    boxShadow: `0 0 15px hsl(${280 + i * 20} 90% 60% / 0.6)`,
                  }}
                  animate={{
                    opacity: [0.7, 1, 0.7],
                    filter: ['brightness(1)', 'brightness(1.5)', 'brightness(1)'],
                  }}
                  transition={{
                    duration: 2 + i * 0.5,
                    repeat: Infinity,
                    delay: i * 0.3,
                  }}
                />
              ))}
            </>
          )}

          {/* Castle towers */}
          {isCastle && (
            <div className="absolute left-1/2 -translate-x-1/2 top-[-5%] flex gap-1">
              {[-12, 0, 12].map((offset, i) => (
                <motion.div
                  key={i}
                  className="w-3 rounded-t"
                  style={{
                    height: 18 - Math.abs(offset) / 3,
                    marginLeft: offset,
                    background: `linear-gradient(180deg, 
                      hsl(${baseHue} 30% 50%), 
                      hsl(${baseHue} 35% 35%))`,
                    boxShadow: `0 0 10px hsl(${baseHue} 60% 50% / 0.5)`,
                  }}
                  animate={{
                    boxShadow: [
                      `0 0 10px hsl(${baseHue} 60% 50% / 0.5)`,
                      `0 0 20px hsl(${baseHue} 70% 60% / 0.8)`,
                      `0 0 10px hsl(${baseHue} 60% 50% / 0.5)`,
                    ]
                  }}
                  transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
                />
              ))}
            </div>
          )}

          {/* Main decorative icon */}
          <motion.div
            className="absolute left-1/2 -translate-x-1/2 top-[0%] flex items-center justify-center"
            style={{ filter: `drop-shadow(0 4px 10px hsl(${baseHue} 70% 20% / 0.8))` }}
            animate={{
              y: [0, -3, 0],
              rotate: [0, 3, -3, 0],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Icon
              className="w-10 h-10"
              style={{ 
                color: `hsl(${baseHue} 85% 75%)`,
                filter: `drop-shadow(0 0 8px hsl(${baseHue} 90% 60% / 0.6))`
              }}
              strokeWidth={2}
            />
          </motion.div>

          {/* Numbered medallion */}
          <motion.div
            whileHover={unlocked ? { rotate: [0, -8, 8, 0], scale: 1.1 } : {}}
            transition={{ duration: 0.4 }}
            className="absolute left-1/2 -translate-x-1/2 top-[46%] -translate-y-1/2 w-14 h-14 rounded-full flex items-center justify-center font-extrabold text-xl"
            style={{
              background: unlocked
                ? `radial-gradient(circle at 30% 25%, 
                    hsl(45 95% 72%), 
                    hsl(38 90% 55%) 50%, 
                    hsl(28 85% 42%))`
                : `radial-gradient(circle at 30% 25%, 
                    hsl(220 20% 55%), 
                    hsl(220 25% 35%) 50%, 
                    hsl(220 30% 20%))`,
              border: unlocked ? '3px solid hsl(35 60% 30%)' : '3px solid hsl(220 30% 25%)',
              boxShadow: unlocked
                ? `0 6px 20px rgba(0,0,0,0.5), 
                   inset 0 -4px 10px rgba(0,0,0,0.4), 
                   0 0 30px hsl(45 95% 55% / 0.6),
                   inset 0 2px 5px hsl(50 100% 85% / 0.5)`
                : `0 6px 15px rgba(0,0,0,0.5), 
                   inset 0 -4px 8px rgba(0,0,0,0.4)`,
              color: unlocked ? '#4a2505' : '#2a2a2a',
              fontFamily: 'Georgia, serif',
              textShadow: unlocked ? '0 1px 2px rgba(255,255,255,0.3)' : 'none',
            }}
          >
            {completed ? (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', bounce: 0.5 }}
              >
                <Check className="w-7 h-7 text-green-800" strokeWidth={3} />
              </motion.div>
            ) : unlocked ? (
              island.id
            ) : (
              <Lock className="w-5 h-5" />
            )}
          </motion.div>

          {/* Completed glow ring */}
          {completed && (
            <motion.div
              className="absolute inset-[-5%] rounded-full pointer-events-none"
              animate={{
                boxShadow: [
                  '0 0 30px hsl(140 80% 50% / 0.5), inset 0 0 20px hsl(140 80% 50% / 0.2)',
                  '0 0 50px hsl(140 85% 55% / 0.7), inset 0 0 30px hsl(140 85% 55% / 0.3)',
                  '0 0 30px hsl(140 80% 50% / 0.5), inset 0 0 20px hsl(140 80% 50% / 0.2)',
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}

          {/* Sparkle for unlocked islands */}
          {unlocked && !completed && (
            <motion.div
              className="absolute -top-3 -right-2"
              animate={{ 
                rotate: [0, 360], 
                scale: [1, 1.4, 1],
              }}
              transition={{ 
                rotate: { duration: 4, repeat: Infinity, ease: 'linear' },
                scale: { duration: 2, repeat: Infinity }
              }}
            >
              <Sparkles className="w-6 h-6 text-yellow-300 drop-shadow-[0_0_8px_rgba(253,224,71,0.8)]" />
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Island name tooltip */}
      <motion.div 
        className="absolute left-1/2 -translate-x-1/2 -bottom-10 whitespace-nowrap text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-300"
        initial={{ y: 5 }}
        whileHover={{ y: 0 }}
      >
        <div 
          className="px-4 py-1.5 rounded-xl backdrop-blur-xl border border-white/20"
          style={{
            background: `linear-gradient(135deg, hsl(${baseHue} 40% 15% / 0.9), hsl(${baseHue} 50% 10% / 0.9))`,
            boxShadow: `0 4px 20px hsl(${baseHue} 60% 30% / 0.4)`,
          }}
        >
          <span className="text-foreground/90">{island.name}</span>
          <span className="text-foreground/50 ml-2">#{island.id}</span>
        </div>
      </motion.div>
    </motion.button>
  );
}

// Animated path with traveling particles
function PathLines() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 100 100">
      <defs>
        <linearGradient id="pathGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="hsl(180 90% 65%)" stopOpacity="0.8" />
          <stop offset="33%" stopColor="hsl(280 85% 65%)" stopOpacity="0.8" />
          <stop offset="66%" stopColor="hsl(45 90% 65%)" stopOpacity="0.8" />
          <stop offset="100%" stopColor="hsl(330 85% 65%)" stopOpacity="0.8" />
        </linearGradient>
        <filter id="pathGlow">
          <feGaussianBlur stdDeviation="0.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      
      {ISLANDS.slice(0, -1).map((a, i) => {
        const b = ISLANDS[i + 1];
        const mx = (a.x + b.x) / 2;
        const my = (a.y + b.y) / 2 - 8;
        const pathId = `path-${a.id}`;
        
        return (
          <g key={a.id}>
            {/* Main path */}
            <motion.path
              id={pathId}
              d={`M ${a.x} ${a.y} Q ${mx} ${my} ${b.x} ${b.y}`}
              fill="none"
              stroke="url(#pathGrad)"
              strokeWidth="0.5"
              strokeDasharray="1.5 1"
              filter="url(#pathGlow)"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.6, delay: 0.5 + i * 0.12, ease: 'easeOut' }}
              vectorEffect="non-scaling-stroke"
            />
            
            {/* Traveling particle along path */}
            <motion.circle
              r="0.8"
              fill="hsl(50 100% 70%)"
              filter="url(#pathGlow)"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 1, 0] }}
              transition={{ 
                duration: 3, 
                repeat: Infinity, 
                delay: 1.5 + i * 0.5,
                ease: 'linear'
              }}
            >
              <animateMotion
                dur="3s"
                repeatCount="indefinite"
                begin={`${1.5 + i * 0.5}s`}
              >
                <mpath href={`#${pathId}`} />
              </animateMotion>
            </motion.circle>
          </g>
        );
      })}
    </svg>
  );
}

// Enhanced floating clouds
function FloatingClouds() {
  const clouds = useMemo(
    () => Array.from({ length: 8 }).map((_, i) => ({
      id: i,
      y: 5 + Math.random() * 85,
      size: 100 + Math.random() * 250,
      delay: Math.random() * 15,
      duration: 50 + Math.random() * 40,
      opacity: 0.04 + Math.random() * 0.08,
      blur: 15 + Math.random() * 15,
    })),
    []
  );
  
  return (
    <>
      {clouds.map((c) => (
        <motion.div
          key={c.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            top: `${c.y}%`,
            width: c.size,
            height: c.size * 0.45,
            background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.9), transparent 70%)',
            opacity: c.opacity,
            filter: `blur(${c.blur}px)`,
          }}
          initial={{ x: '-35%' }}
          animate={{ x: '135%' }}
          transition={{ 
            duration: c.duration, 
            repeat: Infinity, 
            delay: c.delay, 
            ease: 'linear' 
          }}
        />
      ))}
    </>
  );
}

// Floating sea creatures decoration
function SeaCreatures() {
  const creatures = useMemo(() => 
    Array.from({ length: 4 }).map((_, i) => ({
      id: i,
      y: 30 + Math.random() * 50,
      duration: 20 + Math.random() * 15,
      delay: Math.random() * 10,
      size: 14 + Math.random() * 10,
      direction: i % 2 === 0 ? 1 : -1,
    })),
    []
  );

  return (
    <>
      {creatures.map((c) => (
        <motion.div
          key={c.id}
          className="absolute pointer-events-none opacity-30"
          style={{
            top: `${c.y}%`,
            fontSize: c.size,
          }}
          initial={{ x: c.direction === 1 ? '-10%' : '110%' }}
          animate={{ x: c.direction === 1 ? '110%' : '-10%' }}
          transition={{
            duration: c.duration,
            repeat: Infinity,
            delay: c.delay,
            ease: 'linear',
          }}
        >
          <Fish 
            className="text-cyan-300/50" 
            style={{ 
              transform: c.direction === -1 ? 'scaleX(-1)' : 'none',
              filter: 'drop-shadow(0 0 5px rgba(100,200,255,0.3))'
            }} 
          />
        </motion.div>
      ))}
    </>
  );
}

// Background shooting stars
function ShootingStars() {
  return (
    <>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-white pointer-events-none"
          style={{ 
            boxShadow: '0 0 10px white, 0 0 20px white',
            top: `${10 + i * 20}%`,
          }}
          initial={{ x: '-5%', y: 0, opacity: 0 }}
          animate={{ 
            x: '115%', 
            y: `${40 + i * 15}%`,
            opacity: [0, 1, 1, 0]
          }}
          transition={{ 
            duration: 4 + i, 
            repeat: Infinity, 
            repeatDelay: 8 + i * 3, 
            ease: 'easeIn',
            delay: i * 4
          }}
        >
          <div
            className="absolute right-0 top-1/2 -translate-y-1/2 h-px"
            style={{ 
              width: 60 + i * 20,
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), white)'
            }}
          />
        </motion.div>
      ))}
    </>
  );
}

// Intro animation with clouds parting
function CloudIntro({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-[60] overflow-hidden pointer-events-none"
      style={{
        background: 'radial-gradient(ellipse at center, hsl(220 65% 10%), hsl(240 75% 4%))',
      }}
    >
      {/* Central reveal content */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0, filter: 'blur(30px)' }}
        animate={{ scale: 1.05, opacity: 1, filter: 'blur(0px)' }}
        transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <div className="text-center">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            <motion.div
              className="text-6xl md:text-8xl font-black tracking-tight"
              style={{
                background: 'linear-gradient(135deg, hsl(50 100% 70%), hsl(35 95% 55%), hsl(280 90% 70%))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 6px 30px hsl(45 100% 50% / 0.6))',
              }}
              animate={{
                filter: [
                  'drop-shadow(0 6px 30px hsl(45 100% 50% / 0.6))',
                  'drop-shadow(0 6px 50px hsl(280 90% 60% / 0.8))',
                  'drop-shadow(0 6px 30px hsl(45 100% 50% / 0.6))',
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              КВЕСТ
            </motion.div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="text-foreground/60 mt-4 tracking-[0.3em] text-sm uppercase"
          >
            Архипелаг приключений
          </motion.div>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="h-px w-48 mx-auto mt-4 bg-gradient-to-r from-transparent via-foreground/40 to-transparent"
          />
        </div>
      </motion.div>

      {/* Left cloud */}
      <motion.div
        initial={{ x: 0, scale: 1.3 }}
        animate={{ x: '-120%', scale: 1.5 }}
        transition={{ duration: 1.8, ease: [0.6, 0, 0.2, 1] }}
        className="absolute top-0 left-0 h-full w-[65%]"
        style={{
          background: `
            radial-gradient(ellipse at 85% 50%, 
              rgba(255,255,255,0.98), 
              rgba(200,210,230,0.8) 40%, 
              transparent 75%)
          `,
          filter: 'blur(3px)',
        }}
      />
      
      {/* Right cloud */}
      <motion.div
        initial={{ x: 0, scale: 1.3 }}
        animate={{ x: '120%', scale: 1.5 }}
        transition={{ duration: 1.8, ease: [0.6, 0, 0.2, 1] }}
        className="absolute top-0 right-0 h-full w-[65%]"
        style={{
          background: `
            radial-gradient(ellipse at 15% 50%, 
              rgba(255,255,255,0.98), 
              rgba(200,210,230,0.8) 40%, 
              transparent 75%)
          `,
          filter: 'blur(3px)',
        }}
      />

      {/* Scattered cloud puffs */}
      {Array.from({ length: 16 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white/90"
          style={{
            top: `${5 + Math.random() * 90}%`,
            left: '50%',
            width: 40 + Math.random() * 80,
            height: 40 + Math.random() * 80,
            filter: 'blur(12px)',
          }}
          initial={{ x: 0, scale: 0.6, opacity: 0.8 }}
          animate={{
            x: (Math.random() > 0.5 ? 1 : -1) * (400 + Math.random() * 600),
            y: (Math.random() - 0.5) * 300,
            scale: 1.8,
            opacity: 0,
          }}
          transition={{ 
            duration: 1.6, 
            delay: 0.1 + Math.random() * 0.4, 
            ease: 'easeOut' 
          }}
        />
      ))}
    </motion.div>
  );
}

// Moon fall transition when clicking an island
function MoonFallTransition({ island }: { island: Island }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[65] pointer-events-none overflow-hidden"
      style={{
        background: `radial-gradient(ellipse at ${island.x}% ${island.y}%, 
          hsl(${island.hue} 70% 15% / 0.3), 
          hsl(240 80% 4% / 0.97) 60%)`,
      }}
    >
      {/* Falling energy orb */}
      <motion.div
        initial={{ y: '-70vh', x: '-50%', scale: 0.5, opacity: 0 }}
        animate={{ y: 0, x: '-50%', scale: 5, opacity: 1 }}
        transition={{ duration: 1.1, ease: [0.45, 0, 0.55, 1] }}
        className="absolute rounded-full"
        style={{
          left: `${island.x}%`,
          top: `${island.y}%`,
          width: 100,
          height: 100,
          background: `radial-gradient(circle at 35% 35%, 
            hsl(${island.hue} 95% 85%), 
            hsl(${island.hue} 85% 55%) 50%, 
            hsl(${island.hue} 75% 30%))`,
          boxShadow: `
            0 0 100px hsl(${island.hue} 95% 60% / 0.9), 
            0 0 200px hsl(${island.hue} 90% 55% / 0.6),
            inset 0 0 40px hsl(${island.hue} 100% 90% / 0.5)
          `,
        }}
      />
      
      {/* Impact shockwave */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 10, opacity: [0, 0.9, 0] }}
        transition={{ duration: 0.9, delay: 0.9, ease: 'easeOut' }}
        className="absolute rounded-full border-4"
        style={{
          left: `${island.x}%`,
          top: `${island.y}%`,
          width: 80,
          height: 80,
          marginLeft: -40,
          marginTop: -40,
          borderColor: `hsl(${island.hue} 90% 70%)`,
          boxShadow: `0 0 50px hsl(${island.hue} 95% 60% / 0.7)`,
        }}
      />
      
      {/* Motion streaks */}
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ y: '-40vh', opacity: 0 }}
          animate={{ y: '50vh', opacity: [0, 0.8, 0] }}
          transition={{ duration: 0.7, delay: 0.15 + i * 0.04, ease: 'easeIn' }}
          className="absolute w-0.5 h-40"
          style={{
            left: `${island.x + (Math.random() - 0.5) * 25}%`,
            top: `${island.y - 35}%`,
            background: `linear-gradient(180deg, transparent, hsl(${island.hue} 95% 75%))`,
            filter: 'blur(1px)',
          }}
        />
      ))}
    </motion.div>
  );
}

// Level dialog with enhanced design
function LevelDialog({ island, onClose }: { island: Island | null; onClose: (completed?: boolean) => void }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!island) {
      setCode('');
      setError(false);
    }
  }, [island]);

  const isFirst = island?.id === 1;
  const QUEST1_URL = 'https://v0-akkonec.vercel.app/quest.html';
  const QUEST1_CODE = '2002';

  const submitCode = () => {
    if (code.trim() === QUEST1_CODE) {
      window.open(QUEST1_URL, '_blank', 'noopener,noreferrer');
      onClose(true);
    } else {
      setError(true);
    }
  };

  return (
    <AnimatePresence>
      {island && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => onClose()}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
        >
          <motion.div
            initial={{ scale: 0.7, y: 50, opacity: 0, rotateX: 20 }}
            animate={{ scale: 1, y: 0, opacity: 1, rotateX: 0 }}
            exit={{ scale: 0.7, y: 50, opacity: 0, rotateX: -20 }}
            transition={{ type: 'spring', bounce: 0.35, duration: 0.7 }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-lg w-full p-10 rounded-3xl text-center overflow-hidden"
            style={{
              background: `linear-gradient(145deg, 
                hsl(${island.hue} 35% 12% / 0.98), 
                hsl(240 50% 8% / 0.98))`,
              border: `1px solid hsl(${island.hue} 50% 40% / 0.3)`,
              boxShadow: `
                0 30px 80px hsl(${island.hue} 80% 25% / 0.5), 
                0 0 100px hsl(${island.hue} 85% 50% / 0.15),
                inset 0 1px 0 hsl(${island.hue} 60% 60% / 0.2)
              `,
            }}
          >
            {/* Background decorative glow */}
            <div 
              className="absolute inset-0 opacity-30 pointer-events-none"
              style={{
                background: `radial-gradient(circle at 50% 0%, hsl(${island.hue} 80% 50% / 0.4), transparent 60%)`
              }}
            />
            
            {/* Animated medallion */}
            <motion.div
              animate={{ 
                rotate: [0, 5, -5, 0],
                y: [0, -5, 0]
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="relative inline-flex items-center justify-center w-24 h-24 rounded-full mb-6 text-4xl font-black"
              style={{
                background: `radial-gradient(circle at 30% 25%, 
                  hsl(50 100% 75%), 
                  hsl(40 95% 55%) 50%, 
                  hsl(30 90% 40%))`,
                color: '#3a1805',
                fontFamily: 'Georgia, serif',
                boxShadow: `
                  0 8px 30px rgba(0,0,0,0.4), 
                  0 0 50px hsl(45 100% 55% / 0.5), 
                  inset 0 -5px 15px rgba(0,0,0,0.3),
                  inset 0 3px 8px hsl(55 100% 85% / 0.5)
                `,
                border: '4px solid hsl(35 70% 25%)',
                textShadow: '0 2px 3px rgba(255,255,255,0.3)',
              }}
            >
              {island.id}
            </motion.div>
            
            <h2 
              className="text-3xl font-bold mb-2"
              style={{ 
                color: `hsl(${island.hue} 80% 75%)`,
                textShadow: `0 2px 20px hsl(${island.hue} 90% 60% / 0.5)`
              }}
            >
              {island.name}
            </h2>
            <p className="text-foreground/50 text-sm mb-6">Остров #{island.id}</p>

            {isFirst ? (
              <>
                <p className="text-foreground/70 mb-5 leading-relaxed">
                  Перейди к квесту, найди ключ и введи его сюда, чтобы открыть портал к следующему острову.
                </p>
                
                <a
                  href={QUEST1_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 w-full justify-center px-6 py-3.5 rounded-2xl font-semibold mb-5 transition-all duration-300 hover:scale-[1.02]"
                  style={{
                    background: 'linear-gradient(135deg, hsl(220 30% 18%), hsl(220 35% 12%))',
                    border: '1px solid hsl(220 40% 35% / 0.4)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                  }}
                >
                  <Sparkles className="w-5 h-5 text-yellow-400" />
                  <span className="text-foreground">Перейти к квесту</span>
                </a>
                
                <div className="mb-5">
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => { setCode(e.target.value); setError(false); }}
                    onKeyDown={(e) => e.key === 'Enter' && submitCode()}
                    placeholder="Введите ключ"
                    autoFocus
                    className="w-full px-5 py-4 rounded-2xl text-center tracking-[0.4em] font-mono text-xl transition-all duration-300 focus:outline-none"
                    style={{
                      background: 'hsl(220 35% 10%)',
                      border: error 
                        ? '2px solid hsl(0 80% 55%)' 
                        : '2px solid hsl(220 40% 25%)',
                      color: 'hsl(var(--foreground))',
                      boxShadow: error 
                        ? '0 0 20px hsl(0 80% 50% / 0.3)' 
                        : '0 4px 20px rgba(0,0,0,0.2), inset 0 2px 10px rgba(0,0,0,0.3)',
                    }}
                  />
                  <AnimatePresence>
                    {error && (
                      <motion.p
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-red-400 text-sm mt-3"
                      >
                        Неверный ключ. Попробуй ещё раз.
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
                
                <motion.button
                  onClick={submitCode}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full px-8 py-4 rounded-2xl font-bold tracking-wide text-background mb-4 transition-all"
                  style={{
                    background: `linear-gradient(135deg, hsl(${island.hue} 85% 55%), hsl(${(island.hue + 40) % 360} 80% 50%))`,
                    boxShadow: `0 10px 30px hsl(${island.hue} 85% 40% / 0.5), inset 0 1px 0 hsl(${island.hue} 90% 75% / 0.3)`,
                  }}
                >
                  Открыть портал
                </motion.button>
              </>
            ) : (
              <>
                <p className="text-foreground/60 mb-6 leading-relaxed">
                  Уровень разблокирован! Скоро здесь появятся новые испытания.
                </p>
                <div className="flex items-center justify-center gap-3 mb-6">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, rotate: -180, opacity: 0 }}
                      animate={{ scale: 1, rotate: 0, opacity: 1 }}
                      transition={{ delay: 0.3 + i * 0.15, type: 'spring', bounce: 0.6 }}
                    >
                      <Star 
                        className="w-10 h-10 text-yellow-400 fill-yellow-400" 
                        style={{ filter: 'drop-shadow(0 0 10px rgba(250,204,21,0.6))' }}
                      />
                    </motion.div>
                  ))}
                </div>
              </>
            )}
            
            <motion.button
              onClick={() => onClose()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-3 rounded-2xl font-semibold tracking-wide transition-all"
              style={{
                background: 'hsl(220 30% 15%)',
                border: '1px solid hsl(220 35% 30%)',
                color: 'hsl(var(--foreground) / 0.8)',
              }}
            >
              Закрыть
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Progress bar component
function ProgressBar({ completed, total }: { completed: number; total: number }) {
  const progress = (completed / total) * 100;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 2.2 }}
      className="max-w-md mx-auto"
    >
      <div className="flex justify-between items-center mb-2 text-sm">
        <span className="text-foreground/60">Прогресс</span>
        <span className="text-yellow-400 font-bold">{completed} / {total}</span>
      </div>
      <div 
        className="h-3 rounded-full overflow-hidden"
        style={{
          background: 'hsl(220 30% 12%)',
          boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.4)',
        }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{
            background: 'linear-gradient(90deg, hsl(45 100% 55%), hsl(35 95% 50%), hsl(280 80% 60%))',
            boxShadow: '0 0 20px hsl(45 100% 50% / 0.5)',
          }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, delay: 2.4, ease: 'easeOut' }}
        />
      </div>
    </motion.div>
  );
}

export default function Quest() {
  const { user } = useAuth();
  const [intro, setIntro] = useState(true);
  const [selected, setSelected] = useState<Island | null>(null);
  const [zooming, setZooming] = useState<Island | null>(null);
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Parallax effect
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  }, []);

  // Load progress
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('quest_progress')
        .select('island_id')
        .eq('user_id', user.id);
      if (data) setCompleted(new Set(data.map((r: any) => r.island_id)));
    })();
  }, [user]);

  const markCompleted = async (islandId: number) => {
    if (!user || completed.has(islandId)) return;
    const next = new Set(completed);
    next.add(islandId);
    setCompleted(next);
    await supabase
      .from('quest_progress')
      .insert({ user_id: user.id, island_id: islandId });
  };

  const handleIslandClick = (island: Island) => {
    setZooming(island);
    setTimeout(() => {
      setZooming(null);
      setSelected(island);
    }, 1200);
  };

  const handleDialogClose = (didComplete?: boolean) => {
    if (didComplete && selected) markCompleted(selected.id);
    setSelected(null);
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <CosmicBackground />

      <AnimatePresence>
        {intro && <CloudIntro onDone={() => setIntro(false)} />}
      </AnimatePresence>

      <div className="container mx-auto px-4 pt-24 pb-12 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: intro ? 1.8 : 0, duration: 0.7 }}
          className="text-center mb-8"
        >
          <motion.div 
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-white/15 backdrop-blur-xl text-xs uppercase tracking-[0.25em] text-foreground/70 mb-5"
            style={{
              background: 'linear-gradient(135deg, hsl(45 50% 20% / 0.3), hsl(280 40% 15% / 0.3))',
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            }}
            whileHover={{ scale: 1.02 }}
          >
            <Crown className="w-4 h-4 text-yellow-400" />
            Карта Приключений
          </motion.div>
          
          <h1
            className="text-6xl md:text-8xl font-black mb-4 tracking-tight"
            style={{
              background: 'linear-gradient(135deg, hsl(50 100% 72%), hsl(40 95% 58%), hsl(280 95% 72%), hsl(200 100% 70%))',
              backgroundSize: '300% 100%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'gradient-shift 8s ease infinite',
              filter: 'drop-shadow(0 6px 30px hsl(280 85% 50% / 0.4))',
            }}
          >
            Квест
          </h1>
          
          <p className="text-foreground/55 max-w-2xl mx-auto text-lg leading-relaxed">
            Путешествуй по 10 волшебным островам в бескрайнем космическом океане. 
            Прокладывай путь от Изумрудного леса до легендарного Замка.
          </p>
        </motion.div>

        {/* Main map canvas */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: intro ? 2 : 0.2, duration: 0.9 }}
          onMouseMove={handleMouseMove}
          className="relative mx-auto rounded-[2.5rem] border border-white/10 overflow-hidden"
          style={{
            aspectRatio: '16 / 10',
            maxWidth: 1300,
            background: `radial-gradient(ellipse at ${50 + mousePos.x * 10}% ${50 + mousePos.y * 10}%, 
              hsl(210 75% 18%) 0%, 
              hsl(230 85% 10%) 40%, 
              hsl(245 90% 5%) 100%)`,
            boxShadow: `
              0 40px 100px rgba(0,0,0,0.7), 
              inset 0 0 150px hsl(220 85% 3% / 0.9),
              0 0 60px hsl(200 80% 40% / 0.15)
            `,
          }}
        >
          {/* Parallax stars layer */}
          <motion.div 
            className="absolute inset-0 pointer-events-none"
            style={{
              transform: `translate(${mousePos.x * -15}px, ${mousePos.y * -15}px)`,
            }}
          >
            {Array.from({ length: 80 }).map((_, i) => {
              const size = 0.5 + Math.random() * 2.5;
              return (
                <motion.div
                  key={i}
                  className="absolute rounded-full bg-white"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    width: size,
                    height: size,
                    boxShadow: `0 0 ${size * 4}px hsl(0 0% 100% / ${0.5 + Math.random() * 0.5})`,
                  }}
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ 
                    duration: 2 + Math.random() * 4, 
                    repeat: Infinity, 
                    delay: Math.random() * 4 
                  }}
                />
              );
            })}
          </motion.div>

          {/* Nebula blobs with parallax */}
          <motion.div
            animate={{ x: [0, 50, 0], y: [0, -30, 0] }}
            transition={{ duration: 35, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-[15%] left-[20%] w-96 h-96 rounded-full blur-3xl opacity-50 pointer-events-none"
            style={{ 
              background: 'radial-gradient(circle, hsl(280 85% 45%), transparent 65%)',
              transform: `translate(${mousePos.x * -20}px, ${mousePos.y * -20}px)`,
            }}
          />
          <motion.div
            animate={{ x: [0, -40, 0], y: [0, 40, 0] }}
            transition={{ duration: 45, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-[10%] right-[10%] w-[28rem] h-[28rem] rounded-full blur-3xl opacity-45 pointer-events-none"
            style={{ 
              background: 'radial-gradient(circle, hsl(190 90% 45%), transparent 65%)',
              transform: `translate(${mousePos.x * -25}px, ${mousePos.y * -25}px)`,
            }}
          />
          <motion.div
            animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
            transition={{ duration: 55, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-[50%] left-[50%] w-80 h-80 rounded-full blur-3xl opacity-35 pointer-events-none"
            style={{ 
              background: 'radial-gradient(circle, hsl(45 90% 50%), transparent 60%)',
              transform: `translate(${mousePos.x * -15}px, ${mousePos.y * -15}px)`,
            }}
          />

          <FloatingClouds />
          <SeaCreatures />
          <ShootingStars />
          <PathLines />

          {/* Islands */}
          {ISLANDS.map((island, i) => (
            <FloatingIsland
              key={island.id}
              island={island}
              index={i}
              onClick={handleIslandClick}
              unlocked
              completed={completed.has(island.id)}
            />
          ))}

          {/* Floating ship decoration */}
          <motion.div
            className="absolute pointer-events-none opacity-40"
            style={{ bottom: '5%', left: '40%' }}
            animate={{
              x: [0, 200, 0],
              y: [0, -10, 0, 10, 0],
              rotate: [0, 2, 0, -2, 0],
            }}
            transition={{
              x: { duration: 30, repeat: Infinity, ease: 'linear' },
              y: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
              rotate: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
            }}
          >
            <Ship className="w-8 h-8 text-amber-200/60" style={{ filter: 'drop-shadow(0 0 8px rgba(200,180,100,0.4))' }} />
          </motion.div>
        </motion.div>

        {/* Instructions */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: intro ? 2.6 : 0.8 }}
          className="text-center text-sm text-foreground/40 mt-6 tracking-wider"
        >
          Нажми на остров, чтобы открыть портал
        </motion.p>

        {/* Progress bar */}
        <div className="mt-8">
          <ProgressBar completed={completed.size} total={ISLANDS.length} />
        </div>
      </div>

      <AnimatePresence>
        {zooming && <MoonFallTransition island={zooming} />}
      </AnimatePresence>

      <LevelDialog island={selected} onClose={(done) => handleDialogClose(done)} />
      
      {/* Custom CSS for gradient animation */}
      <style>{`
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </div>
  );
}
