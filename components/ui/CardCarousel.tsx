"use client";

import { useState } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { Wallet, ChevronLeft, ChevronRight, Pencil } from "lucide-react";
import { CountUp } from "./CountUp";

interface Card {
  id: string | number;
  name: string;
  last4: string;
  balance: number;
  limit: number;
  dueDate: string;
  color: string;
  utilization: number;
}

interface CardCarouselProps {
  cards: Card[];
  onEdit?: (card: Card) => void;
}

const DRAG_THRESHOLD = 50;

export function CardCarousel({ cards, onEdit }: CardCarouselProps) {
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState(0);

  if (!cards || cards.length === 0) return (
    <div className="glass rounded-2xl p-6 text-center text-[#9ca3af]">
      <p className="text-sm">No cards added yet. Tap + to add your first card.</p>
    </div>
  );

  function go(dir: number) {
    setDirection(dir);
    setActive((prev) => (prev + dir + cards.length) % cards.length);
  }

  function onDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x < -DRAG_THRESHOLD) go(1);
    else if (info.offset.x > DRAG_THRESHOLD) go(-1);
  }

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 340 : -340, opacity: 0, scale: 0.88 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (d: number) => ({ x: d > 0 ? -340 : 340, opacity: 0, scale: 0.88 }),
  };

  const card = cards[active];
  const prev = cards[(active - 1 + cards.length) % cards.length];
  const next = cards[(active + 1) % cards.length];

  return (
    <div className="relative w-full">
      <div className="relative flex items-center justify-center" style={{ height: 220 }}>
        {/* Peek left */}
        <motion.div
          key={`prev-${prev.id}`}
          className="absolute left-0 w-52 rounded-2xl p-4 cursor-pointer select-none"
          style={{
            background: `linear-gradient(135deg, ${prev.color}99, ${prev.color}44)`,
            border: `1px solid ${prev.color}30`,
            height: 180,
          }}
          animate={{ opacity: 0.45, scale: 0.88, x: -10 }}
          onClick={() => go(-1)}
          whileHover={{ opacity: 0.6 }}
        >
          <div className="text-white/60 text-xs truncate">{prev.name}</div>
        </motion.div>

        {/* Active card */}
        <div className="relative z-10 w-80 select-none" style={{ touchAction: "pan-y" }}>
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={card.id}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.15}
              onDragEnd={onDragEnd}
              className="relative overflow-hidden rounded-2xl p-6 cursor-grab active:cursor-grabbing"
              style={{
                background: `linear-gradient(135deg, ${card.color}ee, ${card.color}77)`,
                border: `1px solid ${card.color}50`,
                height: 200,
                boxShadow: `0 20px 60px ${card.color}30`,
              }}
            >
              {/* Decorative circles */}
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-white/8 pointer-events-none" />

              <div className="relative z-10 flex items-start justify-between mb-4">
                <div>
                  <div className="text-white/60 text-xs uppercase tracking-wider">Credit Card</div>
                  <div className="text-white font-semibold text-sm mt-0.5 max-w-[180px] truncate">
                    {card.name}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {onEdit && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onEdit(card); }}
                      className="w-7 h-7 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5 text-white/70" />
                    </button>
                  )}
                  <Wallet className="w-6 h-6 text-white/50" />
                </div>
              </div>

              <div className="relative z-10 text-white/50 text-sm tracking-[0.25em] mb-3">
                •••• •••• •••• {card.last4}
              </div>

              <div className="relative z-10 flex items-end justify-between mb-3">
                <div>
                  <div className="text-white/50 text-xs">Balance</div>
                  <div className="font-display text-2xl font-bold text-white">
                    $<CountUp to={card.balance} duration={1.2} />
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white/50 text-xs">Due Date</div>
                  <div className="text-white text-sm font-medium">{card.dueDate}</div>
                </div>
              </div>

              <div className="relative z-10">
                <div className="flex justify-between text-xs text-white/50 mb-1">
                  <span>Utilization</span>
                  <span>{card.utilization}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/20">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${card.utilization}%` }}
                    transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                    className="h-full rounded-full bg-white"
                  />
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Peek right */}
        <motion.div
          key={`next-${next.id}`}
          className="absolute right-0 w-52 rounded-2xl p-4 cursor-pointer select-none"
          style={{
            background: `linear-gradient(135deg, ${next.color}99, ${next.color}44)`,
            border: `1px solid ${next.color}30`,
            height: 180,
          }}
          animate={{ opacity: 0.45, scale: 0.88, x: 10 }}
          onClick={() => go(1)}
          whileHover={{ opacity: 0.6 }}
        >
          <div className="text-white/60 text-xs truncate">{next.name}</div>
        </motion.div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 mt-4">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => go(-1)}
          className="w-8 h-8 rounded-full border border-white/15 flex items-center justify-center text-[#9ca3af] hover:text-[#E8E8E8] hover:border-white/30 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </motion.button>

        <div className="flex gap-2">
          {cards.map((_, i) => (
            <motion.button
              key={i}
              onClick={() => { setDirection(i > active ? 1 : -1); setActive(i); }}
              animate={{ width: i === active ? 20 : 6, background: i === active ? "#4F8EF7" : "rgba(255,255,255,0.2)" }}
              transition={{ duration: 0.25 }}
              className="h-1.5 rounded-full"
            />
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => go(1)}
          className="w-8 h-8 rounded-full border border-white/15 flex items-center justify-center text-[#9ca3af] hover:text-[#E8E8E8] hover:border-white/30 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </motion.button>
      </div>
    </div>
  );
}
