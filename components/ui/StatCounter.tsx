"use client";

import React, { useEffect, useState, useRef } from "react";
import { useInView } from "framer-motion";

interface StatCounterProps {
  value: number;
  suffix?: string;
  duration?: number;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

export function StatCounter({ value, suffix = "", duration = 1.6, label, description, icon }: StatCounterProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  useEffect(() => {
    if (!isInView) return;

    let start = 0;
    const end = value;
    const totalFrames = Math.round(duration * 60);
    let frame = 0;

    const timer = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.floor(start + (end - start) * ease);

      setCount(current);

      if (frame >= totalFrames) {
        clearInterval(timer);
        setCount(end);
      }
    }, 1000 / 60);

    return () => clearInterval(timer);
  }, [isInView, value, duration]);

  return (
    <div
      ref={ref}
      className="text-center p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/90 shadow-sm relative group hover:border-blue-300 hover:shadow-md hover:shadow-blue-500/5 transition-all duration-300 flex flex-col justify-between"
    >
      {icon && <div className="mx-auto mb-3 text-blue-600 group-hover:scale-110 transition-transform duration-200">{icon}</div>}
      <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight flex items-center justify-center">
        <span>{count}</span>
        <span className="text-blue-600 ml-0.5">{suffix}</span>
      </div>
      <div className="text-xs font-bold text-slate-700 mt-2 uppercase tracking-wider">{label}</div>
      {description && <p className="text-[11px] text-slate-500 mt-1 max-w-[220px] mx-auto leading-relaxed">{description}</p>}
    </div>
  );
}
