/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-non-null-assertion */

import { useMemo } from "react";
import type { ExecutionStep, Process } from "../types/index";
import { motion } from "framer-motion";
import { ScrollArea } from "./ui/scroll-area";
import { Server } from "lucide-react";

// Type guard untuk memastikan objek memang Process
function isValidProcess(process: any): process is Process {
  return process && typeof process.id === "string" && typeof process.name === "string" && typeof process.color === "string";
}

interface GanttChartProps {
  executionSteps: ExecutionStep[];
  processes: Process[];
}

export default function GanttChart({ executionSteps, processes }: GanttChartProps) {
  // Hitung data Gantt (list segmen per proses)
  const ganttData = useMemo(() => {
    if (executionSteps.length === 0) return [];

    type Segment = {
      processId: string;
      name: string;
      color: string;
      startTime: number;
      endTime: number;
    };

    const data: Segment[] = [];
    let currentProcess: Process | null = null;
    let startTime = 0;

    // Gunakan for…of supaya TS bisa mengikuti type guard di satu scope
    for (const step of executionSteps) {
      const rp = step.runningProcess;
      if (rp && isValidProcess(rp)) {
        // Jika sebelumnya ada proses yang sedang jalan, push segmennya
        if (currentProcess && isValidProcess(currentProcess)) {
          data.push({
            processId: currentProcess.id,
            name: currentProcess.name,
            color: currentProcess.color,
            startTime,
            endTime: step.time,
          });
        }
        // Set proses baru dan catat waktunya
        currentProcess = rp;
        startTime = step.time;
      }
    }

    // Tambahkan segmen terakhir setelah loop
    const lastStep = executionSteps[executionSteps.length - 1];
    if (lastStep && currentProcess && isValidProcess(currentProcess)) {
      data.push({
        processId: currentProcess.id,
        name: currentProcess.name,
        color: currentProcess.color,
        startTime,
        endTime: lastStep.time,
      });
    }

    return data;
  }, [executionSteps]);

  // Cari waktu maksimum untuk header timeline
  const maxTime = useMemo(() => {
    if (executionSteps.length === 0) return 0;
    return executionSteps[executionSteps.length - 1].time;
  }, [executionSteps]);

  // Kelompokkan segmen per proses agar bisa ditampilkan per baris
  const processesTiming = useMemo(() => {
    if (ganttData.length === 0) return [];

    const map = new Map<string, { name: string; color: string; segments: { start: number; end: number }[] }>();

    // Inisialisasi map dengan semua proses (walau belum punya segmen)
    processes.forEach((proc) => map.set(proc.id, { name: proc.name, color: proc.color, segments: [] }));

    // Masukkan setiap segmen ke proses yang sesuai
    ganttData.forEach((item) => {
      const entry = map.get(item.processId);
      if (entry) {
        entry.segments.push({ start: item.startTime, end: item.endTime });
      }
    });

    return Array.from(map.values());
  }, [ganttData, processes]);

  // Jika belum ada langkah sama sekali
  if (executionSteps.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <Server className="h-16 w-16 mx-auto mb-4 opacity-20" />
          <p className="text-lg">Run the simulation to see the Gantt chart</p>
          <p className="text-sm mt-2">The chart will show process execution over time</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <ScrollArea className="flex-1">
        <div className="min-w-max p-4">
          {/* Header Timeline */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Timeline</h3>
            <div className="flex h-6 border-b border-border">
              {Array.from({ length: maxTime + 1 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-12 border-r border-border/40 flex items-center justify-center text-xs text-muted-foreground">
                  {i}
                </div>
              ))}
            </div>
          </div>

          {/* Gantt Chart per Proses */}
          <div className="space-y-4">
            {processesTiming.map((proc, idx) => (
              <div key={proc.name} className="flex items-center">
                <div className="w-20 mr-4 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: proc.color }} />
                  <span className="text-sm font-medium">{proc.name}</span>
                </div>
                <div className="relative h-8 flex-grow">
                  {proc.segments.map((seg, sidx) => {
                    const width = (seg.end - seg.start) * 48;
                    const left = seg.start * 48;
                    return (
                      <motion.div
                        key={`${proc.name}-${sidx}`}
                        initial={{ scaleX: 0, opacity: 0 }}
                        animate={{ scaleX: 1, opacity: 1 }}
                        transition={{ duration: 0.5, delay: idx * 0.1 + sidx * 0.05 }}
                        style={{
                          position: "absolute",
                          left: `${left}px`,
                          width: `${width}px`,
                          height: "100%",
                          backgroundColor: proc.color,
                          transformOrigin: "left",
                          borderRadius: "6px",
                        }}
                        className="flex items-center justify-center shadow-md"
                      >
                        {width > 40 && <span className="text-xs font-medium text-slate-900 truncate px-2 dark:text-gray-500">{seg.end - seg.start}</span>}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Gantt Chart Sequential */}
          <div className="mt-12">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">Sequential Execution</h3>
            <div className="relative h-16">
              {ganttData.map((item, index) => {
                const width = (item.endTime - item.startTime) * 48;
                const left = item.startTime * 48;
                return (
                  <motion.div
                    key={`seq-${item.processId}-${item.startTime}`}
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    style={{
                      position: "absolute",
                      left: `${left}px`,
                      width: `${width}px`,
                      height: "100%",
                      backgroundColor: item.color,
                      transformOrigin: "left",
                      borderRadius: "6px",
                    }}
                    className="flex flex-col items-center justify-center shadow-md"
                  >
                    <span className="font-medium text-slate-900 truncate px-2 dark:text-gray-500">{item.name}</span>
                    {width > 50 && (
                      <span className="text-xs text-slate-900/80 truncate px-2">
                        {item.startTime} – {item.endTime}
                      </span>
                    )}
                  </motion.div>
                );
              })}
            </div>
            <div className="flex h-6 mt-2">
              {Array.from({ length: maxTime + 1 }).map((_, i) => (
                <div key={`tl-${i}`} className="flex-shrink-0 w-12 border-r border-border/40 flex items-center justify-center text-xs text-muted-foreground">
                  {i}
                </div>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
