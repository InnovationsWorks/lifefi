"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";

interface HealthScoreProps {
  score: number;
}

function scoreColor(s: number) {
  if (s <= 40) return "#ef4444";
  if (s <= 70) return "#f59e0b";
  return "#22c55e";
}

function scoreLabel(s: number) {
  if (s <= 40) return "Poor";
  if (s <= 60) return "Fair";
  if (s <= 75) return "Good";
  if (s <= 90) return "Excellent";
  return "Perfect";
}

export function HealthScore({ score }: HealthScoreProps) {
  const [displayed, setDisplayed] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const started = useRef(false);

  useEffect(() => {
    if (!inView || started.current) return;
    started.current = true;
    const dur = 1600;
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayed(Math.round(eased * score));
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, score]);

  const radius = 70;
  const stroke = 12;
  const circumference = 2 * Math.PI * radius;
  // Arc covers 240° (from 150° to 390°), so offset for current value
  const color = scoreColor(displayed);

  // Needle angle: -120° at 0, +120° at 100
  const needleAngle = -120 + (displayed / 100) * 240;

  return (
    <div ref={ref} className="flex flex-col items-center">
      <div className="relative" style={{ width: 200, height: 160 }}>
        <svg width="200" height="160" viewBox="0 0 200 160" className="overflow-visible">
          {/* Track arc */}
          <circle
            cx="100"
            cy="110"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.07)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${circumference * (240 / 360)} ${circumference}`}
            strokeDashoffset={0}
            transform="rotate(150 100 110)"
          />
          {/* Color arc */}
          <motion.circle
            cx="100"
            cy="110"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${circumference * (240 / 360)} ${circumference}`}
            strokeDashoffset={circumference * (240 / 360) * (1 - displayed / 100)}
            transform="rotate(150 100 110)"
            style={{ filter: `drop-shadow(0 0 8px ${color}80)` }}
            transition={{ duration: 0.03 }}
          />
          {/* Needle */}
          <motion.g
            style={{ transformOrigin: "100px 110px" }}
            animate={{ rotate: needleAngle }}
            transition={{ duration: 0.03 }}
          >
            <line
              x1="100"
              y1="110"
              x2="100"
              y2="52"
              stroke={color}
              strokeWidth="3"
              strokeLinecap="round"
            />
            <circle cx="100" cy="110" r="6" fill={color} style={{ filter: `drop-shadow(0 0 6px ${color})` }} />
            <circle cx="100" cy="110" r="3" fill="#0a0a0f" />
          </motion.g>

          {/* Tick marks */}
          {[0, 25, 50, 75, 100].map((tick) => {
            const angle = (-120 + (tick / 100) * 240) * (Math.PI / 180);
            const innerR = radius - stroke / 2 - 4;
            const outerR = radius + stroke / 2 + 4;
            return (
              <line
                key={tick}
                x1={100 + innerR * Math.sin(angle)}
                y1={110 - innerR * Math.cos(angle)}
                x2={100 + outerR * Math.sin(angle)}
                y2={110 - outerR * Math.cos(angle)}
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            );
          })}
        </svg>

        {/* Score display */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-center">
          <div className="font-display text-4xl font-bold" style={{ color }}>
            {displayed}
          </div>
          <div className="text-xs text-[#9ca3af] mt-0.5">/ 100</div>
        </div>

        {/* Glow pulse */}
        <motion.div
          className="absolute inset-0 rounded-full pointer-events-none"
          animate={{ opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          style={{
            background: `radial-gradient(ellipse at center bottom, ${color}30 0%, transparent 70%)`,
          }}
        />
      </div>

      <div className="mt-1 text-center">
        <motion.div
          key={scoreLabel(displayed)}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-semibold text-sm"
          style={{ color }}
        >
          {scoreLabel(displayed)}
        </motion.div>
        <div className="text-[#9ca3af] text-xs mt-0.5">↑ +3 pts this month</div>
      </div>
    </div>
  );
}
