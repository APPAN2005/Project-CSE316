export type SchedulerAlgorithm =
  | "DVFS-ERT"
  | "Thermal-Aware"
  | "Round Robin"
  | "FCFS"
  | "SJF"
  | "Priority"
  | "MLFQ"
  | "EDF"

export type DvfsMode = "performance" | "balanced" | "powersave" | "adaptive";

export type ProcessPriority = "HIGH" | "MED" | "LOW";

export type ProcessState = "RUNNING" | "READY" | "WAITING" | "DONE";

export interface ProcessTask {
  pid: number;
  name: string;
  burstTime: number;
  remainingTime: number;
  priority: ProcessPriority;
  deadline: number;
  arrivalTime: number;
  waitingTime: number;
  state: ProcessState;
  color: string;
  assignedCoreId: number | null;
  completedAt?: number;
}

export interface CoreState {
  id: number;
  label: string;
  frequency: number;
  targetFrequency: number;
  voltage: number;
  utilization: number;
  temperature: number;
  currentProcessId: number | null;
  powerConstant: number;
  throttled: boolean;
}

export interface GanttSlice {
  tick: number;
  coreId: number;
  processId: number | null;
  label: string;
  color: string;
}

export interface EventLogEntry {
  id: string;
  tick: number;
  message: string;
  level: "info" | "warning" | "critical";
}

export interface EnergyPoint {
  tick: number;
  power: number;
  cumulativeEnergy: number;
  baselinePower: number;
  baselineEnergy: number;
}

export interface SimulationStats {
  totalEnergy: number;
  averagePower: number;
  throughput: number;
  avgWaitingTime: number;
  fairnessIndex: number;
  energySavedPct: number;
  completedProcesses: number;
}

export interface SimulationRunState {
  algorithm: SchedulerAlgorithm;
  dvfsMode: DvfsMode;
  tick: number;
  nextPid: number;
  nextSpawnTick: number;
  cores: CoreState[];
  processes: ProcessTask[];
  gantt: GanttSlice[];
  eventLog: EventLogEntry[];
  energyHistory: EnergyPoint[];
  stats: SimulationStats;
}

export interface BaselineSnapshot {
  cores: CoreState[];
  processes: ProcessTask[];
  totalEnergy: number;
  completedProcesses: number;
  totalWaitingTime: number;
}
