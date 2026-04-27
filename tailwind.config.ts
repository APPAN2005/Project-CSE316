import {
  calculatePower,
  clampTemperature,
  pickCoolestCore,
  resolveDvfsTarget,
  selectProcessForCore,
  transitionFrequency,
  voltageForFrequency
} from "@/lib/scheduler";
import {
  type BaselineSnapshot,
  type CoreState,
  type EnergyPoint,
  type EventLogEntry,
  type ProcessPriority,
  type ProcessTask,
  type SchedulerAlgorithm,
  type SimulationRunState
} from "@/lib/types";

const PROCESS_NAMES = [
  "MESH-RENDER",
  "FFT-ANALYZER",
  "THERMAL-CTRL",
  "I/O-DAEMON",
  "VISION-PIPE",
  "ENCODER",
  "SIM-KERNEL",
  "NAV-TRACK"
];

const PROCESS_COLORS = [
  "#6ff3ff",
  "#ffc857",
  "#7ef7c9",
  "#ff7a45",
  "#4fa8ff",
  "#b8ff6f",
  "#ff9e66",
  "#8af7ff"
];

const TICK_SECONDS = 0.8;

function createCore(id: number): CoreState {
  return {
    id,
    label: `CORE-${id}`,
    frequency: 2.4,
    targetFrequency: 2.4,
    voltage: 1.02,
    utilization: 0,
    temperature: 42 + id * 2,
    currentProcessId: null,
    powerConstant: 3.1 + id * 0.25,
    throttled: false
  };
}

function createStats() {
  return {
    totalEnergy: 0,
    averagePower: 0,
    throughput: 0,
    avgWaitingTime: 0,
    fairnessIndex: 1,
    energySavedPct: 0,
    completedProcesses: 0
  };
}

function cloneProcess(task: ProcessTask): ProcessTask {
  return { ...task };
}

function randomFrom<T>(items: T[], random: () => number) {
  return items[Math.floor(random() * items.length)];
}

function createProcess(pid: number, tick: number, random: () => number): ProcessTask {
  const burstTime = 3 + Math.floor(random() * 8);
  const priorityBucket = random();
  const priority: ProcessPriority =
    priorityBucket > 0.7 ? "HIGH" : priorityBucket > 0.35 ? "MED" : "LOW";

  return {
    pid,
    name: randomFrom(PROCESS_NAMES, random),
    burstTime,
    remainingTime: burstTime,
    priority,
    deadline: tick + burstTime + 5 + Math.floor(random() * 10),
    arrivalTime: tick,
    waitingTime: 0,
    state: "READY",
    color: PROCESS_COLORS[(pid - 1) % PROCESS_COLORS.length],
    assignedCoreId: null
  };
}

function enqueueSpawn(
  processes: ProcessTask[],
  task: ProcessTask
) {
  return [...processes, task];
}

function logEntry(tick: number, message: string, level: EventLogEntry["level"]): EventLogEntry {
  return {
    id: `${tick}-${message}`,
    tick,
    message,
    level
  };
}

function updateWaitingTimes(processes: ProcessTask[]) {
  return processes.map((task) => {
    if (task.state === "READY" || task.state === "WAITING") {
      return {
        ...task,
        waitingTime: task.waitingTime + 1
      };
    }
    return task;
  });
}

function assignReadyTasks(
  algorithm: SchedulerAlgorithm,
  cores: CoreState[],
  processes: ProcessTask[],
  tick: number
) {
  const nextProcesses: ProcessTask[] = processes.map((task) => {
    if (task.state !== "DONE") {
      return { ...task, state: task.state === "RUNNING" ? "READY" : task.state, assignedCoreId: null };
    }
    return { ...task };
  });

  const nextCores: CoreState[] = cores.map((core) => ({
    ...core,
    currentProcessId: null,
    throttled: core.throttled
  }));

  for (const core of nextCores) {
    const ready = nextProcesses.filter((task) => task.state !== "DONE" && task.assignedCoreId === null);
    const selected = selectProcessForCore(algorithm, ready, core, tick);
    if (!selected) {
      continue;
    }

    const task = nextProcesses.find((entry) => entry.pid === selected.pid);
    if (!task) {
      continue;
    }

    task.state = "RUNNING";
    task.assignedCoreId = core.id;
    core.currentProcessId = task.pid;
  }

  return { nextCores, nextProcesses };
}

function computeFairness(waitingTimes: number[]) {
  if (waitingTimes.length === 0) {
    return 1;
  }

  const safe = waitingTimes.map((value) => Math.max(value, 0.1));
  const sum = safe.reduce((acc, value) => acc + value, 0);
  const squareSum = safe.reduce((acc, value) => acc + value * value, 0);
  return Number(((sum * sum) / (safe.length * squareSum)).toFixed(3));
}

function applyCoreThermals(
  cores: CoreState[],
  processes: ProcessTask[],
  tick: number,
  algorithm: SchedulerAlgorithm
) {
  const logs: EventLogEntry[] = [];

  for (const core of cores) {
    const task = processes.find((entry) => entry.pid === core.currentProcessId);
    core.utilization = task
      ? Math.min(100, Math.round(((task.burstTime - task.remainingTime) / task.burstTime) * 60 + 35))
      : 0;

    if (task) {
      const heatRise = 1.1 + (core.utilization / 100) * 2.4 + Math.max(0, core.frequency - 1) * 0.55;
      core.temperature = clampTemperature(core.temperature + heatRise);
    } else {
      const idleCooldown = 3.2 + core.id * 0.45;
      core.temperature = clampTemperature(core.temperature - idleCooldown);
      core.throttled = false;
    }

    if (task && core.temperature >= 85) {
      core.throttled = true;
      core.targetFrequency = 1.2;
      core.frequency = transitionFrequency(core.frequency, core.targetFrequency);
      core.voltage = voltageForFrequency(core.frequency);
      logs.push(
        logEntry(
          tick,
          `${core.label} throttled - temp ${core.temperature.toFixed(0)}°C`,
          "critical"
        )
      );

      if (task && algorithm !== "Round Robin") {
        const coolest = pickCoolestCore(cores, core.id);
        if (coolest && coolest.temperature + 6 < core.temperature) {
          const sourceCoreLabel = core.label;
          const targetCoreLabel = coolest.label;
          task.assignedCoreId = coolest.id;
          task.state = "READY";
          core.currentProcessId = null;
          coolest.currentProcessId = null;
          logs.push(logEntry(tick, `P${task.pid} migrated to ${coolest.label}`, "warning"));
          logs.push(
            logEntry(
              tick,
              `${sourceCoreLabel} too hot - task P${task.pid} migrated to ${targetCoreLabel}`,
              "warning"
            )
          );
        }
      }
    } else {
      core.throttled = false;
    }
  }

  return logs;
}

function executeTasks(
  cores: CoreState[],
  processes: ProcessTask[],
  tick: number,
  totalEnergy: number,
  completedProcesses: number,
  totalWaitingTime: number,
  algorithm: SchedulerAlgorithm,
  adaptiveMode: SimulationRunState["dvfsMode"]
) {
  const logs: EventLogEntry[] = [];
  let nextEnergy = totalEnergy;
  let doneCount = completedProcesses;
  let waitAccum = totalWaitingTime;
  let tickPower = 0;

  for (const core of cores) {
    const task = processes.find((entry) => entry.pid === core.currentProcessId);
    const dvfsTarget = resolveDvfsTarget(adaptiveMode, core.utilization);
    core.targetFrequency = core.throttled ? 1.2 : dvfsTarget.frequency;
    core.frequency = transitionFrequency(core.frequency, core.targetFrequency);
    core.voltage = core.throttled ? 0.8 : voltageForFrequency(core.frequency);

    if (Math.abs(core.targetFrequency - core.frequency) < 0.16 && task && adaptiveMode === "adaptive") {
      logs.push(
        logEntry(
          tick,
          `DVFS scaled to ${core.targetFrequency.toFixed(1)}GHz - load ${core.utilization}%`,
          "info"
        )
      );
    }

    if (!task) {
      core.utilization = 0;
      const corePower = calculatePower(core);
      tickPower += corePower;
      nextEnergy += corePower * TICK_SECONDS;
      continue;
    }

    const corePower = calculatePower(core);
    const workUnits = Math.max(0.45, core.frequency / 2.6);
    task.remainingTime = Number(Math.max(0, task.remainingTime - workUnits).toFixed(2));
    tickPower += corePower;
    nextEnergy += corePower * TICK_SECONDS;

    if (task.remainingTime <= 0) {
      task.remainingTime = 0;
      task.state = "DONE";
      task.completedAt = tick;
      core.currentProcessId = null;
      doneCount += 1;
      waitAccum += task.waitingTime;
      logs.push(logEntry(tick, `P${task.pid} completed on ${core.label}`, "info"));
    } else if (algorithm === "Round Robin") {
      task.state = "WAITING";
      task.assignedCoreId = null;
      core.currentProcessId = null;
    }
  }

  return { logs, nextEnergy, doneCount, waitAccum, tickPower: Number(tickPower.toFixed(2)) };
}

function buildEnergyPoint(
  tick: number,
  currentPower: number,
  totalEnergy: number,
  baselinePower: number,
  baselineEnergy: number
): EnergyPoint {
  return {
    tick,
    power: currentPower,
    cumulativeEnergy: Number(totalEnergy.toFixed(2)),
    baselinePower,
    baselineEnergy: Number(baselineEnergy.toFixed(2))
  };
}

function simulateLane(
  algorithm: SchedulerAlgorithm,
  dvfsMode: SimulationRunState["dvfsMode"],
  tick: number,
  cores: CoreState[],
  processes: ProcessTask[],
  totalEnergy: number,
  completedProcesses: number,
  totalWaitingTime: number
) {
  const waitingUpdated = updateWaitingTimes(processes);
  const { nextCores, nextProcesses } = assignReadyTasks(algorithm, cores, waitingUpdated, tick);
  const thermalLogs = applyCoreThermals(nextCores, nextProcesses, tick, algorithm);
  const outcome = executeTasks(
    nextCores,
    nextProcesses,
    tick,
    totalEnergy,
    completedProcesses,
    totalWaitingTime,
    algorithm,
    dvfsMode
  );

  return {
    cores: nextCores,
    processes: nextProcesses,
    logs: [...thermalLogs, ...outcome.logs],
    totalEnergy: outcome.nextEnergy,
    completedProcesses: outcome.doneCount,
    totalWaitingTime: outcome.waitAccum,
    tickPower: outcome.tickPower
  };
}

export function createInitialSimulationState(): SimulationRunState {
  const cores = Array.from({ length: 4 }, (_, index) => createCore(index));
  const seededProcesses = [createProcess(1, 0, Math.random), createProcess(2, 0, Math.random)];

  return {
    algorithm: "DVFS-ERT",
    dvfsMode: "adaptive",
    tick: 0,
    nextPid: 3,
    nextSpawnTick: 4,
    cores,
    processes: seededProcesses,
    gantt: [],
    eventLog: [
      logEntry(0, "Scheduler bootstrapped - adaptive DVFS online", "info"),
      logEntry(0, "Thermal monitor calibrated across 4 cores", "info")
    ],
    energyHistory: [],
    stats: createStats()
  };
}

export function createBaselineSnapshot(source: SimulationRunState): BaselineSnapshot {
  return {
    cores: source.cores.map((core) => ({ ...core })),
    processes: source.processes.map(cloneProcess),
    totalEnergy: 0,
    completedProcesses: 0,
    totalWaitingTime: 0
  };
}

export function resetSimulationState(
  algorithm: SchedulerAlgorithm,
  dvfsMode: SimulationRunState["dvfsMode"]
) {
  const state = createInitialSimulationState();
  state.algorithm = algorithm;
  state.dvfsMode = dvfsMode;
  return state;
}

export function tickSimulation(
  state: SimulationRunState,
  baseline: BaselineSnapshot,
  random: () => number = Math.random
) {
  const nextTick = state.tick + 1;
  let nextProcesses = state.processes.map(cloneProcess);
  let baselineProcesses = baseline.processes.map(cloneProcess);
  let nextPid = state.nextPid;
  let nextSpawnTick = state.nextSpawnTick;
  const spawnLogs: EventLogEntry[] = [];

  if (nextTick >= state.nextSpawnTick) {
    const spawnedTask = createProcess(nextPid, nextTick, random);
    nextProcesses = enqueueSpawn(nextProcesses, spawnedTask);
    baselineProcesses = enqueueSpawn(baselineProcesses, cloneProcess(spawnedTask));
    spawnLogs.push(logEntry(nextTick, `P${nextPid} admitted to ready queue`, "info"));
    nextPid += 1;
    nextSpawnTick = nextTick + 3 + Math.floor(random() * 3);
  }

  const current = simulateLane(
    state.algorithm,
    state.dvfsMode,
    nextTick,
    state.cores.map((core) => ({ ...core })),
    nextProcesses,
    state.stats.totalEnergy,
    state.stats.completedProcesses,
    state.processes.filter((task) => task.state === "DONE").reduce((acc, task) => acc + task.waitingTime, 0)
  );

  const baselineLane = simulateLane(
    "Round Robin",
    "balanced",
    nextTick,
    baseline.cores.map((core) => ({ ...core, frequency: 2.4, targetFrequency: 2.4, voltage: 1.02 })),
    baselineProcesses,
    baseline.totalEnergy,
    baseline.completedProcesses,
    baseline.totalWaitingTime
  );

  const gantt = [
    ...state.gantt,
    ...current.cores.map((core) => {
      const task = current.processes.find((entry) => entry.pid === core.currentProcessId);
      return {
        tick: nextTick,
        coreId: core.id,
        processId: task?.pid ?? null,
        label: task ? `P${task.pid}` : "IDLE",
        color: task?.color ?? "#0c1a20"
      };
    })
  ].slice(-240);

  const baselinePower = Number(
    baselineLane.tickPower.toFixed(2)
  );
  const energyPoint = buildEnergyPoint(
    nextTick,
    current.tickPower,
    current.totalEnergy,
    baselinePower,
    baselineLane.totalEnergy
  );
  const energyHistory = [...state.energyHistory, energyPoint];

  const completed = current.processes.filter((task) => task.state === "DONE");
  const waitingTimes = completed.length > 0 ? completed.map((task) => task.waitingTime) : [0];
  const totalEnergy = Number(current.totalEnergy.toFixed(2));
  const averagePower = Number((totalEnergy / Math.max(nextTick * TICK_SECONDS, 0.8)).toFixed(2));
  const throughput = Number((completed.length / Math.max(nextTick * TICK_SECONDS, 0.8)).toFixed(2));
  const avgWaitingTime = Number(
    (
      completed.reduce((acc, task) => acc + task.waitingTime, 0) /
      Math.max(completed.length, 1) *
      800
    ).toFixed(1)
  );
  const energySavedPct = Number(
    (
      ((baselineLane.totalEnergy - current.totalEnergy) / Math.max(baselineLane.totalEnergy, 1)) *
      100
    ).toFixed(1)
  );

  const nextState: SimulationRunState = {
    ...state,
    tick: nextTick,
    nextPid,
    nextSpawnTick,
    cores: current.cores,
    processes: current.processes,
    gantt,
    energyHistory,
    eventLog: [...spawnLogs, ...current.logs, ...state.eventLog],
    stats: {
      totalEnergy,
      averagePower,
      throughput,
      avgWaitingTime,
      fairnessIndex: computeFairness(waitingTimes),
      energySavedPct,
      completedProcesses: completed.length
    }
  };

  const nextBaseline: BaselineSnapshot = {
    cores: baselineLane.cores,
    processes: baselineLane.processes,
    totalEnergy: baselineLane.totalEnergy,
    completedProcesses: baselineLane.completedProcesses,
    totalWaitingTime: baselineLane.totalWaitingTime
  };

  return {
    state: nextState,
    baseline: nextBaseline
  };
}
