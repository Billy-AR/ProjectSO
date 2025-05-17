// src/lib/algorithms/fcfs.ts
import type { Process, ExecutionStep } from "../types";

export function simulateFCFS(processes: Process[]): ExecutionStep[] {
  if (processes.length === 0) return [];

  const sortedProcesses = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime);
  const steps: ExecutionStep[] = [];
  const completed: Process[] = [];
  const ready: Process[] = [];

  let currentTime = 0;
  let processIndex = 0;

  // Jika tidak ada proses yang tiba di waktu 0, maju ke waktu kedatangan pertama
  if (sortedProcesses[0].arrivalTime > 0) {
    currentTime = sortedProcesses[0].arrivalTime;
  }

  while (completed.length < processes.length) {
    // Tambahkan proses yang baru tiba ke ready queue
    while (processIndex < sortedProcesses.length && sortedProcesses[processIndex].arrivalTime <= currentTime) {
      const newProcess = { ...sortedProcesses[processIndex] };
      ready.push(newProcess);
      processIndex++;
    }

    if (ready.length === 0) {
      // Tidak ada proses yang tersedia, maju ke waktu kedatangan berikutnya
      if (processIndex < sortedProcesses.length) {
        currentTime = sortedProcesses[processIndex].arrivalTime;
        steps.push({
          time: currentTime,
          runningProcess: null,
          readyQueue: [...ready],
          completedProcesses: [...completed],
        });
      }
      continue;
    }

    // Ambil proses berikutnya (urutan FCFS)
    const currentProcess = ready.shift()!;

    // Set waktu mulai jika belum diatur
    if (currentProcess.startTime === undefined) {
      currentProcess.startTime = currentTime;
    }

    // Jalankan proses hingga selesai
    currentTime += currentProcess.burstTime;
    currentProcess.endTime = currentTime;
    currentProcess.turnaroundTime = currentProcess.endTime - currentProcess.arrivalTime;
    currentProcess.waitingTime = currentProcess.turnaroundTime - currentProcess.burstTime;

    completed.push(currentProcess);

    steps.push({
      time: currentTime,
      runningProcess: currentProcess,
      readyQueue: [...ready],
      completedProcesses: [...completed],
    });
  }

  return steps;
}
