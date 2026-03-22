"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useSavingsStore = create()(
  persist(
    (set) => ({
      completed: [],
      totalSavedCAD: 0,
      totalHoursFreed: 0,
      addTask: (task) =>
        set((s) => ({
          completed: [...s.completed, task],
          totalSavedCAD: s.totalSavedCAD + task.savedCAD,
          totalHoursFreed: s.totalHoursFreed + task.savedHours,
        })),
      reset: () => set({ completed: [], totalSavedCAD: 0, totalHoursFreed: 0 }),
    }),
    { name: "tariffiq-savings" }
  )
);
