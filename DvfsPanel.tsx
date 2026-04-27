import { type CoreState, type ProcessTask } from "@/lib/types";

interface CorePanelProps {
  core: CoreState;
  processes: ProcessTask[];
}

export function CorePanel({ core, processes }: CorePanelProps) {
  const task = processes.find((entry) => entry.pid === core.currentProcessId) ?? null;
  const temperatureTone =
    core.temperature >= 80 ? "text-red-300" : core.temperature >= 60 ? "text-amber-300" : "text-green-300";
  const statusBadge = core.throttled
    ? { label: "Throttled", className: "bg-red-500/12 text-red-300" }
    : core.temperature >= 75
      ? { label: "Warning", className: "bg-amber-500/12 text-amber-300" }
      : null;

  return (
    <section className="panel-frame flex h-[272px] min-h-[272px] flex-col rounded-3xl p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="status-label text-slate-400">{core.label}</div>
          <div className={`mt-2 flex items-center gap-3 text-lg font-semibold ${task ? "text-cyan" : "text-slate-400"}`}>
            {task ? (
              <>
                <span className="live-dot h-2.5 w-2.5 rounded-full bg-green-400 shadow-[0_0_12px_rgba(74,222,128,0.85)]" />
                <span>Running: P{task.pid} {task.name}</span>
              </>
            ) : (
              "Idle"
            )}
          </div>
        </div>
        {statusBadge ? <div className={`rounded-full px-4 py-2 text-sm font-medium ${statusBadge.className}`}>{statusBadge.label}</div> : null}
      </div>

      <div className="mt-8 flex flex-1 flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 border-b border-white/8 pb-3 text-base">
            <span className="text-slate-400">Freq</span>
            <span className="font-numeric font-semibold text-white">{core.frequency.toFixed(1)} GHz</span>
          </div>
          <div className="flex items-center justify-between gap-4 border-b border-white/8 pb-3 text-base">
            <span className="text-slate-400">Voltage</span>
            <span className="font-numeric font-semibold text-white">{core.voltage.toFixed(2)} V</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-base">
            <span className="text-slate-400">Temperature</span>
            <span className={`font-numeric font-semibold ${temperatureTone}`}>{core.temperature.toFixed(1)} °C</span>
          </div>
        </div>
        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-slate-400">Utilization</span>
            <span className="font-numeric text-white">{core.utilization}%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-cyan transition-all duration-500" style={{ width: `${core.utilization}%` }} />
          </div>
        </div>
      </div>
    </section>
  );
}
