"use client";

import React from "react";
import { motion } from "framer-motion";
import { StatCounter } from "@/components/ui/StatCounter";
import { CmsStat } from "@/types";
import { BookOpen, Award, Clock, Sparkles } from "lucide-react";

interface StatsProps {
  stats?: CmsStat[];
}

export function Stats({ stats }: StatsProps) {
  const defaultStats = [
    { id: "1", stat_key: "modules", value: 10000, suffix: "+", label: "Certified Courses & Modules", description: "Curated technical, leadership, and professional tracks via Skillsoft Percipio.", sort_order: 1 },
    { id: "2", stat_key: "programs", value: 120, suffix: "+", label: "Job-Ready Diplomas & Certificates", description: "24-week accelerated tracks aligned with global industry competencies.", sort_order: 2 },
    { id: "3", stat_key: "duration", value: 24, suffix: " Wks", label: "Self-Paced Learning Model", description: "Structured modular learning designed for working professionals and students.", sort_order: 3 },
    { id: "4", stat_key: "gpa", value: 90, suffix: "%+", label: "Merit Badge & Honors Level", description: "GPA 3.6+ earns Merit Badge; 95%+ achieves the A. Medallion of Merit.", sort_order: 4 },
  ];

  const currentStats = stats && stats.length > 0 ? stats : defaultStats;

  const icons = [
    <BookOpen key="1" className="w-6 h-6 text-blue-600" />,
    <Award key="2" className="w-6 h-6 text-blue-600" />,
    <Clock key="3" className="w-6 h-6 text-blue-600" />,
    <Sparkles key="4" className="w-6 h-6 text-blue-600" />,
  ];

  return (
    <section className="py-14 relative bg-white border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {currentStats.map((stat, idx) => (
            <StatCounter
              key={stat.id || idx}
              value={stat.value}
              suffix={stat.suffix}
              label={stat.label}
              description={stat.description}
              icon={icons[idx % icons.length]}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
