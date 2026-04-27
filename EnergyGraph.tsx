"use client";

import { type DvfsMode } from "@/lib/types";
import { useSimulationStore } from "@/store/simulationStore";

const modes: { key: DvfsMode; label: string; icon: string; detail: string }[] = [
  {
    key: "performance",
    label: "Performance",
    icon: ">>",
    detail: "Runs at the highest speed so tasks finish faster, but it uses the most power."
  },
  {
    key: "balanced",
    label: "Balanced",
    icon: "~",
    detail: "Uses a middle speed to keep the system responsive without wasting too much energy."
  },
  {
    key: "powersave",
    label: "Power-Save",
    icon: "-",
    detail: "Runs slowly to save energy when the workload is light."
  },
  {
    key: "adaptive",
    label: "Adaptive",
    icon: "*",
    detail: "Automatically raises or lowers speed depending on how busy each core is."
  }
];

export function DvfsPanel() {
  const dvfsMode = useSimulationStore((state) => state.simulation.dvfsMode);
  const cores = useSimulationStore((state) => state.simulation.cores);
  const setDvfsMode = useSimulationStore((state) => state.setDvfsMode);

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="grid gap-5 xl:grid-cols-4">
        {modes.map((mode) => {
          const active = mode.key === dvfsMode;
          return (
            <button
              key={mode.key}
              type="button"
              onClick={() => setDvfsMode(mode.key)}
              className={`panel-frame rounded-3xl p-6 text-left transition ${
                active
                  ? "border-cyan bg-cyan/10 shadow-[0_0_0_1px_rgba(79,209,255,0.25)]"
                  : "hover:border-white/15 hover:bg-white/[0.05]"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="font-numeric text-4xl text-cyan">{mode.icon}</div>
                {active ? (
                  <span className="rounded-full border border-cyan/40 bg-cyan/10 px-3 py-1 text-xs font-semibold tracking-[0.12em] text-cyan">
                    ACTIVE
                  </span>
                ) : null}
              </div>
              <h2 className="mt-5 text-2xl font-semibold text-white">{mode.label}</h2>
              <p className="mt-3 text-base leading-7 text-slate-300">{mode.detail}</p>
            </button>
          );
        })}
      </div>

      <section className="panel-frame flex min-h-0 flex-1 flex-col rounded-3xl p-6">
        <h2 className="text-2xl font-semibold text-white">Per-Core DVFS Readout</h2>
        <p className="mt-2 text-base leading-7 text-slate-300">
          These values show the live speed and voltage that each core is currently using.
        </p>
        <div className="mt-6 grid flex-1 gap-4 overflow-y-auto pr-2" style={{ maxHeight: "200px" }}>
          {cores.map((core) => (
            <div
              key={core.id}
              className="grid grid-cols-[1fr_1fr_1fr] items-center rounded-2xl border border-white/8 bg-white/[0.03] px-5 py-5"
            >
              <div className="text-xl font-semibold text-white">{core.label}</div>
              <div className="font-numeric text-3xl text-white">{core.frequency.toFixed(1)} GHz</div>
              <div className="font-numeric text-3xl text-slate-300">{core.voltage.toFixed(2)} V</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
