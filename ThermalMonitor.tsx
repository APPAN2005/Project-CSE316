"use client";

import { useSimulationStore } from "@/store/simulationStore";

export function StatsBar() {
  const stats = useSimulationStore((state) => state.simulation.stats);

  const items = [
    { label: "Energy", value: `${stats.totalEnergy.toFixed(1)} J`, accent: "border-l-cyan" },
    { label: "Power", value: `${stats.averagePower.toFixed(1)} W`, accent: "border-l-amber" },
    { label: "Throughput", value: `${stats.throughput.toFixed(2)} proc/s`, accent: "border-l-green-400" },
    { label: "Fairness", value: stats.fairnessIndex.toFixed(3), accent: "border-l-violet-400" }
  ];

  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className={`panel-frame rounded-3xl border-l-4 p-5 ${item.accent}`}>
          <div className="text-xs uppercase tracking-widest text-slate-400">{item.label}</div>
          <div className="font-numeric mt-3 text-4xl font-bold leading-none text-white">{item.value}</div>
        </div>
      ))}
    </section>
  );
}
