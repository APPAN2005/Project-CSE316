import {
  type CoreState,
  type DvfsMode,
  type ProcessTask,
  type SchedulerAlgorithm
} from "@/lib/types";

export const DVFS_PRESETS: Record<
  Exclude<DvfsMode, "adaptive">,
  { frequency: number; voltage: number; label: string }
> = {
  performance: { frequency: 3.6, voltage: 1.26, label: "Performance" },
  balanced: { frequency: 2.4, voltage: 1.02, label: "Balanced" },
  powersave: { frequency: 1.2, voltage: 0.8, label: "Power-Save" }
};

export const ALGORITHMS: SchedulerAlgorithm[] = [
  "DVFS-ERT",
  "Thermal-Aware",
  "Round Robin",
  "FCFS",
  "SJF",
  "Priority",
  "MLFQ",
  "EDF"
];

const PRIORITY_WEIGHT = {
  HIGH: 3,
  MED: 2,
  LOW: 1
} as const;

export function resolveDvfsTarget(mode: DvfsMode, utilization: number) {
  if (mode !== "adaptive") {
    return DVFS_PRESETS[mode];
  }

  if (utilization < 30) {
    return DVFS_PRESETS.powersave;
  }

  if (utilization <= 70) {
    return DVFS_PRESETS.balanced;
  }

  return DVFS_PRESETS.performance;
}

export function transitionFrequency(current: number, target: number) {
  const delta = target - current;
  if (Math.abs(delta) < 0.06) {
    return target;
  }

  return Number((current + Math.sign(delta) * 0.3).toFixed(2));
}

export function voltageForFrequency(frequency: number) {
  if (frequency >= 3.2) {
    return 1.26;
  }
  if (frequency >= 2) {
    return 1.02;
  }
  return 0.8;
}

export function calculatePower(core: CoreState) {
  const utilizationFactor = Math.max(core.utilization, 8) / 100;
  return Number(
    (core.powerConstant * core.voltage * core.voltage * core.frequency * utilizationFactor).toFixed(2)
  );
}

function leastSlack(task: ProcessTask, tick: number) {
  return task.deadline - tick - task.remainingTime;
}

function executionScore(task: ProcessTask) {
  return task.remainingTime / Math.max(PRIORITY_WEIGHT[task.priority], 1);
}

function fcfsOrder(a: ProcessTask, b: ProcessTask) {
  return a.arrivalTime - b.arrivalTime || a.pid - b.pid;
}

function priorityOrder(a: ProcessTask, b: ProcessTask) {
  return PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority] || fcfsOrder(a, b);
}

function mlfqLevel(task: ProcessTask) {
  const consumedTicks = Math.floor(task.burstTime - task.remainingTime);

  if (consumedTicks < 2) {
    return 1;
  }

  if (consumedTicks < 6) {
    return 2;
  }

  return 3;
}

function mlfqOrder(a: ProcessTask, b: ProcessTask) {
  const levelDelta = mlfqLevel(a) - mlfqLevel(b);
  if (levelDelta !== 0) {
    return levelDelta;
  }

  if (mlfqLevel(a) === 2) {
    const queueTwoSliceA = Math.floor(Math.max(0, a.burstTime - a.remainingTime - 2) / 4);
    const queueTwoSliceB = Math.floor(Math.max(0, b.burstTime - b.remainingTime - 2) / 4);
    return queueTwoSliceA - queueTwoSliceB || fcfsOrder(a, b);
  }

  return fcfsOrder(a, b);
}

export function selectProcessForCore(
  algorithm: SchedulerAlgorithm,
  candidates: ProcessTask[],
  core: CoreState,
  tick: number
) {
  if (candidates.length === 0) {
    return undefined;
  }

  const ready = [...candidates];

  switch (algorithm) {
    case "EDF":
      return ready.sort((a, b) => a.deadline - b.deadline || a.remainingTime - b.remainingTime)[0];
    case "Round Robin":
      return ready.sort(fcfsOrder)[0];
    case "FCFS":
      return ready.sort(fcfsOrder)[0];
    case "SJF":
      return ready.sort((a, b) => a.remainingTime - b.remainingTime || fcfsOrder(a, b))[0];
    case "Priority":
      return ready.sort(priorityOrder)[0];
    case "MLFQ":
      return ready.sort(mlfqOrder)[0];
    case "Thermal-Aware":
      return ready.sort((a, b) => {
        const thermalBias = core.temperature > 76 ? a.remainingTime - b.remainingTime : 0;
        return thermalBias || executionScore(a) - executionScore(b);
      })[0];
    case "DVFS-ERT":
    default:
      return ready.sort((a, b) => executionScore(a) - executionScore(b) || a.deadline - b.deadline)[0];
  }
}

export function pickCoolestCore(cores: CoreState[], excludeId?: number) {
  return [...cores]
    .filter((core) => core.id !== excludeId)
    .sort((a, b) => a.temperature - b.temperature || a.utilization - b.utilization)[0];
}

export function clampTemperature(value: number) {
  return Number(Math.min(90, Math.max(28, value)).toFixed(1));
}
