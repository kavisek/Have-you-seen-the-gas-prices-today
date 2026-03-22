"use client";

import { motion, useSpring, useTransform } from "motion/react";
import { useEffect } from "react";

function AnimatedCounter({ target, prefix = "", suffix = "" }) {
  const spring = useSpring(0, { stiffness: 40, damping: 18 });
  const display = useTransform(spring, (v) => `${prefix}${Math.round(v).toLocaleString("en-CA")}${suffix}`);
  useEffect(() => {
    spring.set(target);
  }, [target, spring]);
  return <motion.span>{display}</motion.span>;
}

export function SavingsHero({ totalSaved, hoursFreed }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-8 border-y border-zinc-200 dark:border-zinc-800">
      <div className="text-center">
        <div className="text-4xl font-bold text-green-500">
          <AnimatedCounter target={totalSaved} prefix="$" />
        </div>
        <div className="text-sm text-zinc-500 mt-1">saved vs attorney fees</div>
      </div>
      <div className="text-center">
        <div className="text-4xl font-bold text-blue-500">
          <AnimatedCounter target={hoursFreed} suffix=" hrs" />
        </div>
        <div className="text-sm text-zinc-500 mt-1">of billable time freed</div>
      </div>
      <div className="text-center">
        <div className="text-4xl font-bold text-amber-500">
          <AnimatedCounter target={720} suffix="x" />
        </div>
        <div className="text-sm text-zinc-500 mt-1">faster than manual review</div>
      </div>
    </div>
  );
}
