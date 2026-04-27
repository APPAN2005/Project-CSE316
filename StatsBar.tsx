"use client";

import { useState } from "react";

import { AlgorithmSelector } from "@/components/AlgorithmSelector";
import { CorePanel } from "@/components/CorePanel";
import { DvfsPanel } from "@/components/DvfsPanel";
import { EnergyGraph } from "@/components/EnergyGraph";
import { EventLog } from "@/components/EventLog";
import { ProcessTable } from "@/components/ProcessTable";
import { StatsBar } from "@/components/StatsBar";
import { ThermalMonitor } from "@/components/ThermalMonitor";
import { useSimulationStore } from "@/store/simulationStore";

type TabKey = "Dashboard" | "Processes" | "DVFS" | "Thermal" | "Energy";

const tabs: TabKey[] = ["Dashboard", "Processes", "DVFS", "Thermal", "Energy"];

export function DashboardClient() {
  const [activeTab, setActiveTab] = useState<TabKey>("Dashboard");
  const simulation = useSimulationStore((state) => state.simulation);
  const isRunning = useSimulationStore((state) => state.isRunning);

  return (
    <main className="h-screen overflow-hidden bg-transparent text-ink">
      <TopNavbar activeTab={activeTab} isRunning={isRunning} onChange={setActiveTab} tick={simulation.tick} />

      <div className="px-6 pb-6 pt-[92px] lg:px-8">
        <div className="mx-auto h-[calc(100vh-116px)] max-w-[1500px]">
          {activeTab === "Dashboard" && <DashboardView />}
          {activeTab === "Processes" && <ProcessesView />}
          {activeTab === "DVFS" && <DvfsView />}
          {activeTab === "Thermal" && <ThermalView />}
          {activeTab === "Energy" && <EnergyView />}
        </div>
      </div>
    </main>
  );
}

function TopNavbar({
  activeTab,
  isRunning,
  onChange,
  tick
}: {
  activeTab: TabKey;
  isRunning: boolean;
  onChange: (tab: TabKey) => void;
  tick: number;
}) {
  return (
    <header className="fixed inset-x-0 top-0 z-30 border-b border-white/8 bg-[#0d1118]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-6 px-6 py-4 lg:px-8">
        <div className="min-w-0">
          <div className="status-label text-cyan/80">Energy-Efficient CPU Scheduling</div>
          <div className="mt-1 text-xl font-semibold tracking-tight text-white">PowerCore Scheduler</div>
        </div>
        <nav className="hidden flex-1 items-center justify-center gap-2 md:flex">
          {tabs.map((tab) => {
            const active = tab === activeTab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => onChange(tab)}
                className={`rounded-full px-5 py-3 text-base font-medium transition ${
                  active
                    ? "bg-white text-slate-950 shadow-sm"
                    : "bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] hover:text-white"
                }`}
              >
                {tab}
              </button>
            );
          })}
        </nav>
        <div className="flex items-center gap-3">
          <div className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-slate-300">
            Status: <span className={isRunning ? "text-green-400" : "text-amber-300"}>{isRunning ? "Running" : "Paused"}</span>
          </div>
          <div className="font-numeric rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-slate-300">
            Tick {tick}
          </div>
        </div>
      </div>
    </header>
  );
}

function ViewFrame({
  title,
  description,
  children
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex h-[calc(100vh-60px)] flex-col gap-6 overflow-y-auto rounded-[28px] border border-white/8 border-t-2 border-t-cyan bg-[#0f141c]/92 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.22)]">
      <div className="shrink-0">
        <h1 className="section-title text-white">{title}</h1>
        <p className="section-copy mt-2 max-w-3xl">{description}</p>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto pr-2">{children}</div>
    </section>
  );
}

function DashboardView() {
  const simulation = useSimulationStore((state) => state.simulation);
  const isRunning = useSimulationStore((state) => state.isRunning);
  const toggleRunning = useSimulationStore((state) => state.toggleRunning);
  const reset = useSimulationStore((state) => state.reset);

  return (
    <ViewFrame
      title="Dashboard"
      description="This view gives a simple live summary of the whole scheduler, including core health, key performance numbers, and the current algorithm."
    >
      <div className="flex max-h-full flex-col gap-6 overflow-y-auto pr-2">
        <StatsBar />
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-6 xl:grid-cols-[1fr_340px]">
          <div className="grid min-h-0 auto-rows-fr grid-cols-1 gap-6 overflow-y-auto md:grid-cols-2">
            {simulation.cores.map((core) => (
              <CorePanel key={core.id} core={core} processes={simulation.processes} />
            ))}
          </div>
          <div
            className="panel-frame flex max-h-[calc(100vh-200px)] flex-col justify-between overflow-y-auto rounded-3xl p-6"
          >
            <div className="space-y-6">
              <AlgorithmSelector />
              <div>
                <div className="status-label text-slate-400">Simulation Controls</div>
                <p className="mt-2 text-base leading-7 text-slate-300">
                  Use these buttons to start, pause, or restart the live simulation during your presentation.
                </p>
              </div>
            </div>
            <div className="grid gap-4">
              <button
                type="button"
                onClick={toggleRunning}
                className={`rounded-2xl px-5 py-4 text-lg font-semibold transition ${
                  isRunning
                    ? "bg-cyan text-slate-950 hover:brightness-110"
                    : "bg-amber text-slate-950 hover:brightness-110"
                }`}
              >
                {isRunning ? "Pause Simulation" : "Play Simulation"}
              </button>
              <button
                type="button"
                onClick={reset}
                className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-lg font-semibold text-white transition hover:bg-white/[0.08]"
              >
                Reset Simulation
              </button>
            </div>
          </div>
        </div>
      </div>
    </ViewFrame>
  );
}

function ProcessesView() {
  return (
    <ViewFrame
      title="Processes"
      description="This view shows the active tasks waiting for CPU time, their importance level, and how far each one has progressed."
    >
      <ProcessTable />
    </ViewFrame>
  );
}

function DvfsView() {
  return (
    <ViewFrame
      title="DVFS"
      description="This view explains the available power modes and shows the live frequency and voltage being applied to each core."
    >
      <DvfsPanel />
    </ViewFrame>
  );
}

function ThermalView() {
  return (
    <ViewFrame
      title="Thermal"
      description="This view shows how hot each core is right now and lists recent cooling, throttling, and migration events in plain language."
    >
      <div className="grid gap-6 overflow-y-auto">
        <ThermalMonitor />
        <EventLog />
      </div>
    </ViewFrame>
  );
}

function EnergyView() {
  return (
    <ViewFrame
      title="Energy"
      description="This view compares the current scheduler’s power usage against a basic Round Robin baseline and summarizes the energy savings."
    >
      <EnergyGraph />
    </ViewFrame>
  );
}
