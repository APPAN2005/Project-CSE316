"use client";

import { useSimulationStore } from "@/store/simulationStore";

export function GanttChart() {
  const gantt = useSimulationStore((state) => state.simulation.gantt);
  const rows = [0, 1, 2, 3];
  const ticks = Array.from(new Set(gantt.map((slice) => slice.tick)));

  return (
    <section className="panel-frame rounded-2xl p-4">
      <div className="mb-4">
        <div className="status-label text-cyan/70">Gantt Chart</div>
        <h2 className="mt-2 text-lg font-semibold tracking-[0.14em] text-ink">Core Timeline</h2>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[860px] space-y-3">
          <div className="grid grid-cols-[90px_repeat(36,minmax(0,1fr))] gap-2 text-xs text-muted">
            <div>Core/Tick</div>
            {ticks.slice(-36).map((tick) => (
              <div key={tick} className="text-center">
                {tick}
              </div>
            ))}
          </div>
          {rows.map((row) => (
            <div key={row} className="grid grid-cols-[90px_repeat(36,minmax(0,1fr))] gap-2">
              <div className="rounded-lg border border-white/8 bg-black/20 px-3 py-2 text-xs text-cyan">
                CORE-{row}
              </div>
              {ticks.slice(-36).map((tick) => {
                const slice = gantt.find((entry) => entry.coreId === row && entry.tick === tick);
                return (
                  <div
                    key={`${row}-${tick}`}
                    className="flex h-10 items-center justify-center rounded-md border border-white/8 text-[11px] font-semibold"
                    style={{
                      background: slice?.processId ? `${slice.color}22` : "rgba(255,255,255,0.03)",
                      color: slice?.processId ? slice.color : "#7ca2ab",
                      borderColor: slice?.processId ? `${slice.color}44` : "rgba(255,255,255,0.08)"
                    }}
                  >
                    {slice?.label ?? "-"}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
