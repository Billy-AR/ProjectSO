// src/lib/algorithms/roundRobin.ts
import type { Process, ExecutionStep } from "../types";

export function simulateRoundRobin(processes: Process[], quantum: number): ExecutionStep[] {
  if (processes.length === 0) return [];

  const allProcesses = [...processes].map((p) => ({
    ...p,
    remainingTime: p.burstTime,
  }));

  const steps: ExecutionStep[] = [];
  const completed: Process[] = [];
  const ready: Process[] = [];

  let currentTime = 0;
  let processIndex = 0;

  // Jika tidak ada proses yang tiba di waktu 0, maju ke waktu kedatangan pertama
  if (allProcesses.length > 0 && allProcesses.every((p) => p.arrivalTime > 0)) {
    currentTime = Math.min(...allProcesses.map((p) => p.arrivalTime));
  }

  // Urutkan berdasarkan waktu kedatangan
  allProcesses.sort((a, b) => a.arrivalTime - b.arrivalTime);

  while (completed.length < processes.length) {
    // Tambahkan proses yang baru tiba ke ready queue
    while (processIndex < allProcesses.length && allProcesses[processIndex].arrivalTime <= currentTime) {
      ready.push({ ...allProcesses[processIndex] });
      processIndex++;
    }

    if (ready.length === 0) {
      // Tidak ada proses yang tersedia, maju ke waktu kedatangan berikutnya
      if (processIndex < allProcesses.length) {
        currentTime = allProcesses[processIndex].arrivalTime;
        steps.push({
          time: currentTime,
          runningProcess: null,
          readyQueue: [...ready],
          completedProcesses: [...completed],
        });
      }
      continue;
    }

    // Ambil proses berikutnya dari ready queue (urutan round robin)
    const currentProcess = ready.shift()!;

    // Set waktu mulai jika eksekusi pertama
    if (currentProcess.startTime === undefined) {
      currentProcess.startTime = currentTime;
    }

    // Hitung waktu eksekusi untuk quantum ini
    const executeTime = Math.min(quantum, currentProcess.remainingTime);
    currentTime += executeTime;
    currentProcess.remainingTime -= executeTime;

    // Tambahkan proses yang baru tiba selama quantum ini
    while (processIndex < allProcesses.length && allProcesses[processIndex].arrivalTime <= currentTime) {
      ready.push({ ...allProcesses[processIndex] });
      processIndex++;
    }

    // Simpan proses yang sedang berjalan untuk visualisasi
    const runningProcess = {
      ...currentProcess,
      burstTime: executeTime, // Untuk visualisasi, tunjukkan hanya waktu yang dieksekusi di quantum ini
    };

    // Periksa apakah proses selesai
    if (currentProcess.remainingTime <= 0) {
      currentProcess.endTime = currentTime;
      currentProcess.turnaroundTime = currentProcess.endTime - currentProcess.arrivalTime;
      currentProcess.waitingTime = currentProcess.turnaroundTime - currentProcess.burstTime;
      completed.push({ ...currentProcess, burstTime: processes.find((p) => p.id === currentProcess.id)!.burstTime });
    } else {
      // Kembalikan ke ready queue
      ready.push(currentProcess);
    }

    steps.push({
      time: currentTime,
      runningProcess: runningProcess,
      readyQueue: [...ready],
      completedProcesses: [...completed],
    });
  }

  return steps;
}
