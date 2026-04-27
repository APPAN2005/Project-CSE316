"use client";

import { ALGORITHMS } from "@/lib/scheduler";
import { type SchedulerAlgorithm } from "@/lib/types";
import { useSimulationStore } from "@/store/simulationStore";

const algorithmDescriptions: Record<SchedulerAlgorithm, string> = {
  "DVFS-ERT": "Energy-aware scheduling that balances performance with lower power use.",
  "Thermal-Aware": "Moves work to cooler cores to reduce overheating and throttling.",
  "Round Robin": "Gives each process a turn in a simple rotating order.",
  FCFS: "Runs the process that arrived first before newer arrivals.",
  SJF: "Always chooses the process with the shortest remaining work.",
  Priority: "Always runs the highest-priority process first.",
  MLFQ: "Uses multiple queues so short jobs finish quickly without starving others.",
  EDF: "Runs the process with the closest deadline first."
};

export function AlgorithmSelector() {
  const algorithm = useSimulationStore((state) => state.simulation.algorithm);
  const setAlgorithm = useSimulationStore((state) => state.setAlgorithm);
  const highlightedDescription = algorithmDescriptions[algorithm]
    .replace("Energy", "__ENERGY__")
    .replace("energy", "__energy__")
    .replace("Performance", "__PERFORMANCE__")
    .replace("performance", "__performance__");

  return (
    <div className="space-y-3">
      <div>
        <div className="status-label text-slate-400">Scheduling Algorithm</div>
        <p className="mt-2 text-base leading-7 text-slate-300">
          Choose the rule the simulator uses to decide which process should run next.
        </p>
      </div>
      <label className="block">
        <span className="sr-only">Choose algorithm</span>
        <select
          value={algorithm}
          onChange={(event) => setAlgorithm(event.target.value as SchedulerAlgorithm)}
          className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 text-base font-semibold text-white outline-none transition focus:border-cyan"
        >
          {ALGORITHMS.map((item) => (
            <option key={item} value={item} className="bg-slate-950 text-white">
              {item}
            </option>
          ))}
        </select>
      </label>
      <div className="text-lg leading-7 text-slate-200">
        {highlightedDescription.split(/(__ENERGY__|__energy__|__PERFORMANCE__|__performance__)/).map((part, index) => {
          if (part === "__ENERGY__" || part === "__energy__") {
            return (
              <span key={index} className="font-semibold text-cyan">
                {part === "__ENERGY__" ? "Energy" : "energy"}
              </span>
            );
          }

          if (part === "__PERFORMANCE__" || part === "__performance__") {
            return (
              <span key={index} className="font-semibold text-cyan">
                {part === "__PERFORMANCE__" ? "Performance" : "performance"}
              </span>
            );
          }

          return <span key={index}>{part}</span>;
        })}
      </div>
    </div>
  );
}
