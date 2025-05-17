// src/types/index.ts
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
