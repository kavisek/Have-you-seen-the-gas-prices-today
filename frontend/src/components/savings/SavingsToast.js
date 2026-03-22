"use client";

import { motion, AnimatePresence } from "motion/react";

const TASK_LABELS = {
  classify: "HTS Classification",
  usmca: "USMCA Analysis",
  engineer: "Tariff Engineering",
  coo: "Certificate of Origin",
  binding: "Binding Ruling Draft",
};

export function SavingsToast({ task, savedCAD, savedHours, speedup, visible }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, x: 80, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 80, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed bottom-6 right-6 z-50 bg-zinc-900 border border-green-500/40 rounded-xl p-4 shadow-2xl max-w-xs"
        >
          <div className="text-xs text-green-400 font-semibold uppercase tracking-wide mb-2">
            {TASK_LABELS[task] || task} Complete
          </div>
          <div className="flex items-baseline gap-1 mb-1">
            <span className="text-2xl font-bold text-white">
              ${savedCAD.toLocaleString("en-CA")}
            </span>
            <span className="text-sm text-zinc-400">saved vs attorney</span>
          </div>
          <div className="flex gap-4 text-xs text-zinc-400">
            <span>{savedHours.toFixed(1)} hrs freed</span>
            <span>{Math.round(speedup)}x faster</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
