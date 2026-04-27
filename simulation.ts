"use client";

import { useEffect, useRef } from "react";

import { useSimulationStore } from "@/store/simulationStore";

export function SimulationTicker() {
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (intervalRef.current !== null) {
      return;
    }

    intervalRef.current = window.setInterval(() => {
      useSimulationStore.getState().tick();
    }, 800);

    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  return null;
}
