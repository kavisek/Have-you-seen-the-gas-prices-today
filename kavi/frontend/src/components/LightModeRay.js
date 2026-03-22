"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/components/ThemeProvider";

export default function LightModeRay() {
  const { lightFlashGen } = useTheme();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (lightFlashGen <= 0) return undefined;
    setShow(true);
    const id = window.setTimeout(() => setShow(false), 1200);
    return () => window.clearTimeout(id);
  }, [lightFlashGen]);

  if (!show) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[250] overflow-hidden" aria-hidden>
      <div className="light-mode-ray-beam" />
      <div className="light-mode-ray-flash" />
    </div>
  );
}
