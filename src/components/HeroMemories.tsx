'use client';
import Link from 'next/link';
import { cn } from '../lib/utils';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from 'framer-motion';
import { useCallback, useEffect, useRef } from 'react';

// Hero moderno y profesional con fondo animado y tiles glass
// Accesible: headings jerárquicos, texto legible, contraste suficiente.
export function HeroMemories() {
  const prefersReduced = useReducedMotion();
  const containerRef = useRef<HTMLElement | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 60, damping: 18, mass: 0.6 });
  const springY = useSpring(y, { stiffness: 60, damping: 18, mass: 0.6 });

  const rotateX = useTransform(springY, [-40, 40], [8, -8]);
  const rotateY = useTransform(springX, [-40, 40], [-8, 8]);
  const translateTiles = useTransform(springX, [-60, 60], [12, -12]);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (prefersReduced) return;
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const px = ((e.clientX - rect.left) / rect.width) * 2 - 1; // -1 a 1
      const py = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      x.set(px * 40);
      y.set(py * 40);
    },
    [prefersReduced, x, y],
  );

  const resetPointer = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  // Seguridad en SSR hydration (no side effects adicionales)
  useEffect(() => {
    if (prefersReduced) {
      x.set(0);
      y.set(0);
    }
  }, [prefersReduced, x, y]);

  return (
    <section
      ref={(el) => (containerRef.current = el)}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetPointer}
      className="relative overflow-hidden isolate select-none"
    >
      <div className="absolute inset-0 hero-animated-bg" aria-hidden="true" />
      <div className="hero-noise-overlay" aria-hidden="true" />
      {/* Burbujas decorativas */}
      <motion.div
        style={{ x: springX, y: springY }}
        className="pointer-events-none absolute -top-32 -left-32 h-[480px] w-[480px] rounded-full bg-indigo-400/25 blur-3xl mix-blend-screen dark:mix-blend-normal dark:bg-indigo-600/30"
        aria-hidden
      />
      <motion.div
        style={{ x: springX, y: springY }}
        className="pointer-events-none absolute bottom-0 right-0 h-[520px] w-[520px] translate-x-1/3 translate-y-1/3 rounded-full bg-fuchsia-400/20 blur-3xl dark:bg-fuchsia-500/25"
        aria-hidden
      />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl gap-12 px-6 pt-28 pb-20 md:grid-cols-2 lg:gap-20">
        <motion.div
          style={{ rotateX, rotateY }}
          className="flex flex-col justify-center gap-6 text-center md:text-left will-change-transform"
        >
          <motion.h1
            layout
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="text-balance font-extrabold tracking-tight text-4xl sm:text-5xl lg:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-amber-400"
          >
            Captura recuerdos. Hazlos NFT.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="text-lg leading-relaxed text-gray-600 dark:text-gray-300 max-w-xl mx-auto md:mx-0"
          >
            Crea piezas únicas o ediciones múltiples con tu arte o generado por
            IA. Metadatos verificados, almacenamiento IPFS, y comercio directo
            en nuestro marketplace.
          </motion.p>
          <motion.ul
            initial="hidden"
            whileInView="show"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.06 } },
            }}
            className="text-sm text-gray-500 dark:text-gray-400 grid grid-cols-2 gap-x-6 gap-y-2 max-w-md mx-auto md:mx-0"
          >
            {FEATURES.map((f) => (
              <motion.li
                key={f.label}
                variants={{
                  hidden: { opacity: 0, y: 6 },
                  show: { opacity: 1, y: 0 },
                }}
                className="flex items-center gap-2"
              >
                <span aria-hidden>{f.icon}</span> <span>{f.label}</span>
              </motion.li>
            ))}
          </motion.ul>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="flex flex-col sm:flex-row sm:items-center gap-4 pt-2"
          >
            <Link
              href="/crear-nft"
              className={cn(
                'inline-flex items-center justify-center rounded-full px-8 py-4 text-base font-semibold shadow-lg shadow-indigo-500/25',
                'bg-indigo-600 text-white hover:bg-indigo-500 active:bg-indigo-700 transition-colors',
              )}
            >
              Crear NFT
            </Link>
            <Link
              href="/marketplace"
              className="inline-flex items-center justify-center rounded-full px-8 py-4 text-base font-medium border border-indigo-200/50 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-200 hover:bg-indigo-50/60 dark:hover:bg-indigo-500/10 transition-colors"
            >
              Explorar Marketplace
            </Link>
          </motion.div>
        </motion.div>
        <motion.div
          className="relative flex items-center justify-center will-change-transform"
          style={{ rotateX, rotateY }}
        >
          <motion.div
            style={{ x: translateTiles }}
            className="grid grid-cols-2 gap-5 max-w-md"
            initial="hidden"
            whileInView="show"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.09 } },
            }}
          >
            {TILES.map((t) => (
              <FloatingTile key={t.title} {...t} />
            ))}
          </motion.div>
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -bottom-12 -right-12 h-60 w-60 rounded-full bg-amber-400/20 blur-2xl"
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0.55, 0.8, 0.55],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
      </div>
    </section>
  );
}

const FEATURES = [
  { icon: '💠', label: 'IA arte + metadata' },
  { icon: '⚡', label: 'Mint rápido Polygon' },
  { icon: '🗂️', label: '721 & 1155' },
  { icon: '🔐', label: 'Propiedad on-chain' },
  { icon: '🌐', label: 'IPFS resiliente' },
  { icon: '🛒', label: 'Marketplace integrado' },
];

const TILES: TileProps[] = [
  {
    title: 'Momento',
    icon: '📸',
    accent: 'from-indigo-500/25 to-indigo-400/5',
  },
  { title: 'IA', icon: '🧠', accent: 'from-fuchsia-500/25 to-fuchsia-400/5' },
  {
    title: 'Colección',
    icon: '🗃️',
    accent: 'from-amber-400/30 to-amber-300/5',
  },
  { title: 'Marketplace', icon: '🛍️', accent: 'from-sky-400/25 to-sky-300/5' },
];

interface TileProps {
  title: string;
  icon: string;
  accent: string; // tailwind gradient classes
}

function FloatingTile({ title, icon, accent }: TileProps) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, scale: 0.92, y: 16 },
        show: { opacity: 1, scale: 1, y: 0 },
      }}
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 220, damping: 18 }}
      className={cn(
        'glass-tile relative aspect-square rounded-2xl flex flex-col items-center justify-center gap-3 p-3 select-none',
        'bg-gradient-to-br',
        accent,
      )}
    >
      <div className="text-3xl md:text-4xl" aria-hidden>
        {icon}
      </div>
      <div className="text-sm font-medium text-gray-700 dark:text-gray-200 tracking-tight">
        {title}
      </div>
      <div className="absolute inset-0 rounded-2xl ring-1 ring-white/40 dark:ring-white/10" />
    </motion.div>
  );
}

export default HeroMemories;
