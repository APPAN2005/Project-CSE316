"use client";

import { useSimulationStore } from "@/store/simulationStore";

export function ThermalMonitor() {
  const cores = useSimulationStore((state) => state.simulation.cores);

  return (
    <section className="flex h-full flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {cores.map((core) => {
          const gauge = Math.min(100, (core.temperature / 100) * 100);
          const tone =
            core.temperature > 85
              ? "#ff6b57"
              : core.temperature >= 70
                ? "#ff935c"
                : core.temperature >= 40
                  ? "#f5c451"
                  : "#4ade80";

          return (
            <div key={core.id} className="panel-frame flex flex-col items-center justify-center rounded-3xl p-6">
              <div className="status-label text-slate-400">{core.label}</div>
              <div
                className="mt-6 flex h-56 w-56 items-center justify-center rounded-full"
                style={{
                  background: `conic-gradient(${tone} ${gauge}%, rgba(255,255,255,0.08) ${gauge}% 100%)`
                }}
              >
                <div className="flex h-[calc(100%-18px)] w-[calc(100%-18px)] flex-col items-center justify-center rounded-full bg-[#11161f]">
                  <div className="font-numeric text-5xl font-semibold text-white">{core.temperature.toFixed(0)}°C</div>
                  <div className="mt-2 text-base text-slate-400">
                    {core.temperature > 85 ? "Throttling" : core.temperature >= 70 ? "Hot" : core.temperature >= 40 ? "Warm" : "Cool"}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="panel-frame rounded-3xl p-5">
        <div className="mb-3 text-sm font-medium text-slate-300">Thermal Legend</div>
        <div className="h-3 rounded-full bg-gradient-to-r from-green-400 via-amber-400 via-[60%] to-red-500" />
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-slate-300 md:grid-cols-4">
          <div>Cool (&lt;40°C)</div>
          <div>Warm (40-70°C)</div>
          <div>Hot (70-85°C)</div>
          <div>Throttling (&gt;85°C)</div>
        </div>
      </div>
    </section>
  );
}
