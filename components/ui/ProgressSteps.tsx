"use client";

import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProgressStepsProps {
  steps: { id: number; title: string; subtitle?: string }[];
  currentStep: number;
}

export function ProgressSteps({ steps, currentStep }: ProgressStepsProps) {
  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between relative max-w-2xl mx-auto">
        {/* Background track line */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 -translate-y-1/2 z-0 rounded-full" />
        
        {/* Active progress line */}
        <div
          className="absolute top-1/2 left-0 h-1 bg-blue-600 -translate-y-1/2 z-0 transition-all duration-500 ease-out rounded-full shadow-sm"
          style={{
            width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
          }}
        />

        {steps.map((s) => {
          const isCompleted = s.id < currentStep;
          const isCurrent = s.id === currentStep;

          return (
            <div key={s.id} className="relative z-10 flex flex-col items-center">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 shadow-sm",
                  isCompleted
                    ? "bg-blue-600 text-white ring-4 ring-blue-100"
                    : isCurrent
                    ? "bg-white text-blue-700 border-2 border-blue-600 ring-4 ring-blue-100 shadow-md"
                    : "bg-white text-slate-400 border border-slate-300"
                )}
              >
                {isCompleted ? <Check className="w-5 h-5 stroke-[2.5]" /> : s.id}
              </div>
              <span
                className={cn(
                  "text-xs font-semibold mt-2.5 transition-colors hidden sm:block whitespace-nowrap",
                  isCurrent ? "text-blue-700 font-bold" : isCompleted ? "text-slate-700" : "text-slate-400"
                )}
              >
                {s.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
