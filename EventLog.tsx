"use client";

import { useSimulationStore } from "@/store/simulationStore";

const rowStyles = {
  RUNNING: {
    className: "bg-green-400/10",
    borderColor: "rgba(74, 222, 128, 0.24)"
  },
  READY: {
    className: "bg-yellow-300/10",
    borderColor: "rgba(253, 224, 71, 0.24)"
  },
  WAITING: {
    className: "bg-slate-400/10",
    borderColor: "rgba(148, 163, 184, 0.24)"
  },
  DONE: {
    className: "bg-slate-500/10",
    borderColor: "rgba(100, 116, 139, 0.24)"
  }
} as const;

export function ProcessTable() {
  const processes = useSimulationStore((state) => state.simulation.processes);
  const visibleProcesses = [...processes].reverse();

  return (
    <section className="panel-frame flex h-full flex-col rounded-3xl p-6">
      <div className="mb-5">
        <h2 className="text-2xl font-semibold text-white">Live Process Table</h2>
        <p className="mt-2 text-base leading-7 text-slate-300">
          Each row is a task in the system. The progress bar shows how much of that task has already finished.
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto" style={{ height: "calc(100vh - 250px)" }}>
        <table className="w-full border-separate border-spacing-y-3 text-left">
          <thead>
            <tr className="text-base text-slate-400">
              <th className="px-4 py-2 font-medium">PID</th>
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium">Priority</th>
              <th className="px-4 py-2 font-medium">State</th>
              <th className="px-4 py-2 font-medium">Progress</th>
            </tr>
          </thead>
          <tbody>
            {visibleProcesses.map((process) => {
              const progress =
                process.burstTime > 0
                  ? ((process.burstTime - process.remainingTime) / process.burstTime) * 100
                  : 0;
              const clampedProgress = Math.max(0, Math.min(100, progress));
              const rowStyle = rowStyles[process.state];
              return (
                <tr key={process.pid} className={`${rowStyle.className} text-lg`}>
                  <td
                    className="font-numeric rounded-l-2xl border-y border-l px-4 py-4 text-white"
                    style={{ borderColor: rowStyle.borderColor }}
                  >
                    P{process.pid}
                  </td>
                  <td className="border-y px-4 py-4 text-white" style={{ borderColor: rowStyle.borderColor }}>
                    {process.name}
                  </td>
                  <td className="border-y px-4 py-4 text-white" style={{ borderColor: rowStyle.borderColor }}>
                    {process.priority}
                  </td>
                  <td className="border-y px-4 py-4 text-white" style={{ borderColor: rowStyle.borderColor }}>
                    {process.state}
                  </td>
                  <td
                    className="rounded-r-2xl border-y border-r px-4 py-4"
                    style={{ borderColor: rowStyle.borderColor }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-5 flex-1 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${clampedProgress}%`, background: "linear-gradient(90deg, #4fd1ff 0%, #84ff6f 100%)" }}
                        />
                      </div>
                      <div className="font-numeric w-16 text-right text-lg font-bold text-white">{clampedProgress.toFixed(0)}%</div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
