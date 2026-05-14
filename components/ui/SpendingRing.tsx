"use client";

import { useRef, useState } from "react";
import { useInView } from "framer-motion";

interface Segment {
  label: string;
  value: number;
  color: string;
}

interface SpendingRingProps {
  segments: Segment[];
}

export function SpendingRing({ segments }: SpendingRingProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [hovered, setHovered] = useState<Segment | null>(null);

  const total = segments.reduce((s, x) => s + x.value, 0);
  const cx = 80;
  const cy = 80;
  const R = 64;
  const r = 42;
  const strokeW = R - r;

  // Build arcs
  let cumulative = 0;
  const arcs = segments.map((seg, i) => {
    const fraction = seg.value / total;
    const startAngle = cumulative * 2 * Math.PI - Math.PI / 2;
    cumulative += fraction;
    const endAngle = cumulative * 2 * Math.PI - Math.PI / 2;
    const midR = (R + r) / 2;
    const circumference = 2 * Math.PI * midR;
    const arcLen = fraction * circumference;
    const gap = 3;
    const delay = i * 0.12;
    return { seg, startAngle, endAngle, midR, circumference, arcLen, gap, delay, fraction };
  });

  function polarToCartesian(angle: number, radius: number) {
    return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
  }

  return (
    <div ref={ref} className="flex flex-col items-center">
      <div className="relative" style={{ width: 160, height: 160 }}>
        <svg width="160" height="160" viewBox="0 0 160 160">
          {/* Background ring */}
          <circle cx={cx} cy={cy} r={midR(R, r)} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeW} />

          {arcs.map(({ seg, startAngle, endAngle, midR: mr, circumference, arcLen, gap, delay }) => {
            const p1 = polarToCartesian(startAngle, mr);
            const p2 = polarToCartesian(endAngle, mr);
            const large = endAngle - startAngle > Math.PI ? 1 : 0;
            const d = `M ${p1.x} ${p1.y} A ${mr} ${mr} 0 ${large} 1 ${p2.x} ${p2.y}`;
            return (
              <path
                key={seg.label}
                d={d}
                fill="none"
                stroke={seg.color}
                strokeWidth={strokeW - gap}
                strokeLinecap="round"
                strokeDasharray={`${arcLen} ${circumference}`}
                strokeDashoffset={inView ? 0 : arcLen}
                style={{
                  filter: hovered?.label === seg.label ? `drop-shadow(0 0 8px ${seg.color}99)` : "none",
                  transition: `stroke-dashoffset 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}s, filter 0.2s`,
                  cursor: "pointer",
                }}
                onMouseEnter={() => setHovered(seg)}
                onMouseLeave={() => setHovered(null)}
              />
            );
          })}
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          {hovered ? (
            <>
              <div className="text-xs font-medium" style={{ color: hovered.color }}>{hovered.label}</div>
              <div className="font-display text-lg font-bold text-[#E8E8E8]">${hovered.value.toLocaleString()}</div>
            </>
          ) : (
            <>
              <div className="text-xs text-[#9ca3af]">Total</div>
              <div className="font-display text-lg font-bold text-[#E8E8E8]">${total.toLocaleString()}</div>
            </>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 mt-3 w-full">
        {segments.map((seg) => (
          <div
            key={seg.label}
            className="flex items-center gap-1.5 cursor-pointer"
            onMouseEnter={() => setHovered(seg)}
            onMouseLeave={() => setHovered(null)}
          >
            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: seg.color }} />
            <span className="text-xs text-[#9ca3af] truncate">{seg.label}</span>
            <span className="text-xs text-[#E8E8E8] ml-auto">{Math.round((seg.value / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function midR(R: number, r: number) {
  return (R + r) / 2;
}
