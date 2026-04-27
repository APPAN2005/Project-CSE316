"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import { useSimulationStore } from "@/store/simulationStore";

export function EnergyGraph() {
  const energyHistory = useSimulationStore((state) => state.simulation.energyHistory);
  const stats = useSimulationStore((state) => state.simulation.stats);

  return (
    <div className="flex h-full flex-col gap-6">
      <section className="panel-frame flex min-h-0 flex-[1.4] flex-col rounded-3xl p-6">
        <h2 className="text-2xl font-semibold text-white">Power Over Time</h2>
        <p className="mt-2 text-base leading-7 text-slate-300">
          The blue line is the current scheduler. The orange line is the Round Robin baseline.
        </p>
        <div className="mt-6 min-h-0 flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={energyHistory}>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="tick" stroke="#98a2b3" tick={{ fontSize: 14 }} />
              <YAxis stroke="#98a2b3" tick={{ fontSize: 14 }} />
              <Tooltip
                contentStyle={{
                  background: "#11161f",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "16px",
                  color: "#edf2f7"
                }}
              />
              <Line type="monotone" dataKey="power" stroke="#4fd1ff" strokeWidth={3} dot={false} name="Current Power" />
              <Line
                type="monotone"
                dataKey="baselinePower"
                stroke="#f5c451"
                strokeWidth={3}
                dot={false}
                name="Round Robin Power"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="grid flex-1 gap-5 xl:grid-cols-3">
        <NumberCard label="Total Energy Saved" value={`${stats.energySavedPct.toFixed(1)}%`} />
        <NumberCard label="Average Power" value={`${stats.averagePower.toFixed(1)} W`} />
        <NumberCard label="Energy vs Baseline" value={`${stats.totalEnergy.toFixed(1)} J`} helper="Current scheduler total energy" />
      </section>
    </div>
  );
}

function NumberCard({
  label,
  value,
  helper
}: {
  label: string;
  value: string;
  helper?: string;
}) {
  return (
    <div className="panel-frame flex flex-col justify-center rounded-3xl p-6">
      <div className="text-base text-slate-400">{label}</div>
      <div className="font-numeric mt-4 text-[2.4rem] font-semibold leading-none text-white">{value}</div>
      {helper ? <div className="mt-3 text-base text-slate-300">{helper}</div> : null}
    </div>
  );
}
