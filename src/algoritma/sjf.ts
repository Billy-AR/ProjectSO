import type { Process, ExecutionStep } from "../types";

export function simulateSJF(processes: Process[]): ExecutionStep[] {
  if (processes.length === 0) return [];

  const allProcesses = [...processes].map((p) => ({ ...p }));
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

    // Urutkan ready queue berdasarkan burst time (terpendek dulu)
    ready.sort((a, b) => a.burstTime - b.burstTime);

    // Ambil proses berikutnya (job terpendek)
    const currentProcess = ready.shift()!;

    // Set waktu mulai jika belum diatur
    if (currentProcess.startTime === undefined) {
      currentProcess.startTime = currentTime;
    }

    // Jalankan proses hingga selesai, tambahkan step untuk setiap unit waktu
    for (let t = 0; t < currentProcess.burstTime; t++) {
      steps.push({
        time: currentTime + t,
        runningProcess: { ...currentProcess },
        readyQueue: [...ready],
        completedProcesses: [...completed],
      });
    }

    currentTime += currentProcess.burstTime;
    currentProcess.endTime = currentTime;
    currentProcess.turnaroundTime = currentProcess.endTime - currentProcess.arrivalTime;
    currentProcess.waitingTime = currentProcess.turnaroundTime - currentProcess.burstTime;

    completed.push(currentProcess);

    // Add final step when the process completes
    steps.push({
      time: currentTime,
      runningProcess: currentProcess,
      readyQueue: [...ready],
      completedProcesses: [...completed],
    });
  }

  return steps;
}
