// src/lib/types.ts
export interface Process {
  id: string;
  name: string;
  arrivalTime: number;
  burstTime: number;
  priority: number;
  color: string;
  remainingTime: number;
  startTime?: number;
  endTime?: number;
  waitingTime?: number;
  turnaroundTime?: number;
}

export type AlgorithmType = "FCFS" | "SJF" | "Priority" | "RoundRobin";

export interface ExecutionStep {
  time: number;
  runningProcess: Process | null;
  readyQueue: Process[];
  completedProcesses: Process[];
}

// src/types/index.ts
export interface Process {
  id: string; // Not optional
  name: string; // Not optional
  color: string; // Not optional
  arrivalTime: number;
  burstTime: number;
  priority: number;
  remainingTime: number;
  startTime?: number;
  endTime?: number;
  waitingTime?: number;
  turnaroundTime?: number;
}
export interface ExecutionStep {
  time: number;
  runningProcess: Process | null; // Explicitly allow null
  readyQueue: Process[];
  completedProcesses: Process[];
}
