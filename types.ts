"use client";

import { useSimulationStore } from "@/store/simulationStore";

export function EventLog() {
  const eventLog = useSimulationStore((state) => state.simulation.eventLog);

  return (
    <section className="panel-frame flex flex-col rounded-3xl p-6">
      <h2 className="text-2xl font-semibold text-white">Recent Thermal Events</h2>
      <p className="mt-2 text-base leading-7 text-slate-300">
        These messages explain what the scheduler did when temperatures changed.
      </p>
      <div className="mt-6 grid flex-1 gap-4 overflow-y-auto pr-2">
        {eventLog.map((entry) => (
          <div key={entry.id} className="rounded-2xl border border-white/8 bg-white/[0.03] px-5 py-4 text-lg text-white">
            <span className="font-numeric text-slate-400">[{formatTime(entry.tick)}]</span> {entry.message}
          </div>
        ))}
      </div>
    </section>
  );
}

function formatTime(tick: number) {
  const seconds = tick * 0.8;
  const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secs = String(Math.floor(seconds % 60)).padStart(2, "0");
  return `${mins}:${secs}`;
}
