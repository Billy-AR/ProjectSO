/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-non-null-assertion */

import { useMemo } from "react";
import type { ExecutionStep, Process } from "../types/index";
import { motion } from "framer-motion";
import { Server } from "lucide-react";

// Type guard to ensure object is a Process
function isValidProcess(process: any): process is Process {
  return process && typeof process.id === "string" && typeof process.name === "string" && typeof process.color === "string";
}

interface GanttChartProps {
  executionSteps: ExecutionStep[];
  processes: Process[];
}

export default function GanttChart({ executionSteps, processes }: GanttChartProps) {
  // Calculate Gantt data (list of segments per process)
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

    // Use for…of so TS can follow type guard in one scope
    for (const step of executionSteps) {
      const rp = step.runningProcess;
      if (rp && isValidProcess(rp)) {
        // If there was a process running previously, push its segment
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
        // If this is a new process
        if (!currentProcess || currentProcess.id !== rp.id) {
          currentProcess = rp;
          startTime = step.time;
        }
      } else if (currentProcess) {
        // Process completed
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

    // Add the last segment after the loop
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

  // Find maximum time for timeline header
  const maxTime = useMemo(() => {
    if (executionSteps.length === 0) return 0;
    return Math.max(...executionSteps.map((step) => step.time));
  }, [executionSteps]);

  // Group segments by process to display in rows
  const processesTiming = useMemo(() => {
    if (ganttData.length === 0) return [];

    const map = new Map<string, { name: string; color: string; segments: { start: number; end: number }[] }>();

    // Initialize map with all processes (even if they don't have segments yet)
    processes.forEach((proc) => map.set(proc.id, { name: proc.name, color: proc.color, segments: [] }));

    // Insert each segment into the corresponding process
    ganttData.forEach((item) => {
      const entry = map.get(item.processId);
      if (entry) {
        entry.segments.push({ start: item.startTime, end: item.endTime });
      }
    });

    // Only return processes that have segments
    return Array.from(map.values()).filter((proc) => proc.segments.length > 0);
  }, [ganttData, processes]);

  // Truly responsive width calculation based on available space
  const calculateUnitWidth = () => {
    // Get estimated container width (based on typical card sizes in the app)
    const containerEstimatedWidth = 720; // Approximate width of the container in pixels
    const availableWidth = containerEstimatedWidth - 150; // Accounting for padding and label width

    // Calculate unit width based on max time to fit within container
    const calculatedWidth = Math.max(20, Math.min(60, availableWidth / (maxTime + 1)));

    // Further reduce width if we have many time units
    if (maxTime > 30) return Math.min(calculatedWidth, 25);
    if (maxTime > 20) return Math.min(calculatedWidth, 35);
    return Math.min(calculatedWidth, 60);
  };

  const UNIT_WIDTH = calculateUnitWidth(); // Dynamic width per time unit
  const LABEL_WIDTH = 80; // Slightly smaller width for process labels
  const chartWidth = (maxTime + 1) * UNIT_WIDTH;

  // If there are no steps yet
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
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-1 w-full overflow-auto">
        <div className="p-4">
          {/* Header Timeline */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Timeline</h3>
            <div style={{ marginLeft: LABEL_WIDTH + 8 }}>
              <div className="flex border-b-2 border-border">
                {Array.from({ length: maxTime + 1 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-center text-xs text-muted-foreground border-r border-border/40" style={{ width: UNIT_WIDTH, height: 24 }}>
                    {i % Math.ceil((maxTime + 1) / 15) === 0 && ( // Show fewer labels when many time units
                      <span className="font-medium text-[10px]">{i}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Gantt Chart per Process */}
          {processesTiming.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Process Timeline</h3>
              <div className="space-y-2">
                {processesTiming.map((proc, idx) => (
                  <div key={proc.name} className="flex items-center">
                    {/* Process Label */}
                    <div className="flex items-center gap-1 flex-shrink-0" style={{ width: LABEL_WIDTH }}>
                      <div className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: proc.color }} />
                      <span className="text-xs font-medium truncate">{proc.name}</span>
                    </div>

                    {/* Chart Area */}
                    <div className="relative ml-2" style={{ width: chartWidth, height: 28 }}>
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
                            transition={{ duration: 0.5, delay: idx * 0.05 + sidx * 0.03 }}
                            style={{
                              position: "absolute",
                              left: `${left}px`,
                              width: `${width}px`,
                              height: "100%",
                              backgroundColor: proc.color,
                              transformOrigin: "left",
                            }}
                            className="flex items-center justify-center shadow-sm rounded-sm border border-white/10"
                          >
                            {width > 30 && (
                              <span className="text-[10px] font-semibold" style={{ color: textColor }}>
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
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Sequential Execution</h3>
            <div style={{ marginLeft: LABEL_WIDTH + 8 }}>
              <div className="relative" style={{ width: chartWidth, height: 40 }}>
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
                  const showLabel = width > 25;

                  return (
                    <motion.div
                      key={`seq-${item.processId}-${item.startTime}`}
                      initial={{ scaleX: 0, opacity: 0 }}
                      animate={{ scaleX: 1, opacity: 1 }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                      style={{
                        position: "absolute",
                        left: `${left}px`,
                        width: `${width}px`,
                        height: "100%",
                        backgroundColor: item.color,
                        transformOrigin: "left",
                      }}
                      className="flex flex-col items-center justify-center shadow-sm rounded-sm border border-white/10"
                    >
                      {showLabel && (
                        <span className="font-semibold truncate text-[10px]" style={{ color: textColor, maxWidth: width - 4 }}>
                          {item.name}
                        </span>
                      )}
                      {width > 45 && (
                        <span className="text-[9px] opacity-90 truncate" style={{ color: textColor, maxWidth: width - 4 }}>
                          {item.startTime}–{item.endTime}
                        </span>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {/* Bottom timeline */}
              <div className="flex mt-1">
                {Array.from({ length: maxTime + 1 }).map((_, i) => (
                  <div key={`tl-${i}`} className="flex items-center justify-center text-xs text-muted-foreground border-r border-border/40" style={{ width: UNIT_WIDTH, height: 20 }}>
                    {i % Math.ceil((maxTime + 1) / 15) === 0 && <span className="font-medium text-[10px]">{i}</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
