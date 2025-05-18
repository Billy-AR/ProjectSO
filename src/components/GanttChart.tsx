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
        if (currentProcess && isValidProcess(currentProcess) && currentProcess.id !== rp.id) {
          data.push({
            processId: currentProcess.id,
            name: currentProcess.name,
            color: currentProcess.color,
            startTime,
            endTime: step.time,
          });
          startTime = step.time;
        }
        // Jika ini proses baru
        if (!currentProcess || currentProcess.id !== rp.id) {
          currentProcess = rp;
          startTime = step.time;
        }
      } else if (currentProcess) {
        // Proses selesai
        data.push({
          processId: currentProcess.id,
          name: currentProcess.name,
          color: currentProcess.color,
          startTime,
          endTime: step.time,
        });
        currentProcess = null;
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
    return Math.max(...executionSteps.map((step) => step.time));
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

    // Hanya return proses yang memiliki segments
    return Array.from(map.values()).filter((proc) => proc.segments.length > 0);
  }, [ganttData, processes]);

  // Responsive width calculation
  const UNIT_WIDTH = 60; // Width per time unit - lebih besar untuk text yang lebih jelas
  const LABEL_WIDTH = 100; // Width untuk label proses
  const chartWidth = (maxTime + 1) * UNIT_WIDTH;

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

  // Function to get readable text color based on background
  const getTextColor = (bgColor: string) => {
    // Convert hex to RGB and calculate brightness
    const hex = bgColor.replace("#", "");
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? "#1a1a1a" : "#ffffff";
  };

  return (
    <div className="h-full flex flex-col">
      <ScrollArea className="flex-1">
        <div className="p-4">
          {/* Header Timeline */}
          <div className="mb-8">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">Timeline</h3>
            <div style={{ marginLeft: LABEL_WIDTH + 16 }}>
              <div className="flex border-b-2 border-border">
                {Array.from({ length: maxTime + 1 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-center text-xs text-muted-foreground border-r border-border/40" style={{ width: UNIT_WIDTH, height: 32 }}>
                    <span className="font-medium">{i}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Gantt Chart per Proses */}
          {processesTiming.length > 0 && (
            <div className="mb-12">
              <h3 className="text-sm font-medium text-muted-foreground mb-4">Process Timeline</h3>
              <div className="space-y-3">
                {processesTiming.map((proc, idx) => (
                  <div key={proc.name} className="flex items-center">
                    {/* Process Label */}
                    <div className="flex items-center gap-3 flex-shrink-0" style={{ width: LABEL_WIDTH }}>
                      <div className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: proc.color }} />
                      <span className="text-sm font-medium">{proc.name}</span>
                    </div>

                    {/* Chart Area */}
                    <div className="relative ml-4" style={{ width: chartWidth, height: 40 }}>
                      {/* Background grid */}
                      <div className="absolute inset-0 flex">
                        {Array.from({ length: maxTime + 1 }).map((_, i) => (
                          <div key={i} className="border-r border-border/20" style={{ width: UNIT_WIDTH }} />
                        ))}
                      </div>

                      {/* Process segments */}
                      {proc.segments.map((seg, sidx) => {
                        const width = (seg.end - seg.start) * UNIT_WIDTH;
                        const left = seg.start * UNIT_WIDTH;
                        const textColor = getTextColor(proc.color);

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
                            }}
                            className="flex items-center justify-center shadow-md rounded-md border border-white/10"
                          >
                            {width > 40 && (
                              <span className="text-sm font-semibold" style={{ color: textColor }}>
                                {seg.end - seg.start}
                              </span>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sequential Execution */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-4">Sequential Execution</h3>
            <div style={{ marginLeft: LABEL_WIDTH + 16 }}>
              <div className="relative" style={{ width: chartWidth, height: 60 }}>
                {/* Background grid */}
                <div className="absolute inset-0 flex">
                  {Array.from({ length: maxTime + 1 }).map((_, i) => (
                    <div key={i} className="border-r border-border/20" style={{ width: UNIT_WIDTH }} />
                  ))}
                </div>

                {/* Sequential segments */}
                {ganttData.map((item, index) => {
                  const width = (item.endTime - item.startTime) * UNIT_WIDTH;
                  const left = item.startTime * UNIT_WIDTH;
                  const textColor = getTextColor(item.color);

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
                      }}
                      className="flex flex-col items-center justify-center shadow-md rounded-md border border-white/10"
                    >
                      <span className="font-semibold truncate text-sm" style={{ color: textColor, maxWidth: width - 8 }}>
                        {item.name}
                      </span>
                      {width > 80 && (
                        <span className="text-xs opacity-90 truncate" style={{ color: textColor, maxWidth: width - 8 }}>
                          {item.startTime} – {item.endTime}
                        </span>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {/* Bottom timeline */}
              <div className="flex mt-2">
                {Array.from({ length: maxTime + 1 }).map((_, i) => (
                  <div key={`tl-${i}`} className="flex items-center justify-center text-xs text-muted-foreground border-r border-border/40" style={{ width: UNIT_WIDTH, height: 24 }}>
                    <span className="font-medium">{i}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
