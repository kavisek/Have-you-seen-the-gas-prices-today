"use client";

import { motion, AnimatePresence } from "motion/react";
import { useSavingsStore } from "@/store/savings";

export function SavingsNavBadge() {
  const total = useSavingsStore((s) => s.totalSavedCAD);
  if (total === 0) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex items-center gap-1.5 bg-green-500/15 border border-green-500/30 text-green-500 text-xs font-semibold px-3 py-1.5 rounded-full"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
        ${total.toLocaleString("en-CA")} saved this session
      </motion.div>
    </AnimatePresence>
  );
}
