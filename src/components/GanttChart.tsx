/* eslint-disable */

import { useMemo } from "react";
import type { ExecutionStep, Process } from "../types/index";
import { motion } from "framer-motion";
import { ScrollArea } from "./ui/scroll-area";
import { Server } from "lucide-react";

// Type guard function to check if a process is valid
function isValidProcess(process: any): process is Process {
  return process && typeof process.id === "string" && typeof process.name === "string" && typeof process.color === "string";
}

interface GanttChartProps {
  executionSteps: ExecutionStep[];
  processes: Process[];
}

export default function GanttChart({ executionSteps, processes }: GanttChartProps) {
  const ganttData = useMemo(() => {
    if (executionSteps.length === 0) return [];

    const data: {
      processId: string;
      name: string;
      color: string;
      startTime: number;
      endTime: number;
    }[] = [];

    let currentProcess: Process | null = null;
    let startTime = 0;

    executionSteps.forEach((step) => {
      if (step.runningProcess && isValidProcess(step.runningProcess)) {
        if (currentProcess && isValidProcess(currentProcess)) {
          data.push({
            processId: currentProcess.id,
            name: currentProcess.name,
            color: currentProcess.color,
            startTime,
            endTime: step.time,
          });
        }

        currentProcess = step.runningProcess;
        startTime = step.time;
      }
    });

    // Add the last process
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

  const maxTime = useMemo(() => {
    if (executionSteps.length === 0) return 0;
    const lastStep = executionSteps[executionSteps.length - 1];
    return lastStep ? lastStep.time : 0;
  }, [executionSteps]);

  // Group gantt data by process
  const processesTiming = useMemo(() => {
    if (ganttData.length === 0) return [];

    const processMap = new Map<
      string,
      {
        name: string;
        color: string;
        segments: { start: number; end: number }[];
      }
    >();

    // Initialize with all processes
    processes.forEach((process) => {
      processMap.set(process.id, {
        name: process.name,
        color: process.color,
        segments: [],
      });
    });

    // Fill process segments with gantt data
    ganttData.forEach((item) => {
      const process = processMap.get(item.processId);
      if (process) {
        process.segments.push({
          start: item.startTime,
          end: item.endTime,
        });
      }
    });

    return Array.from(processMap.values());
  }, [ganttData, processes]);

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
          {/* Timeline Header */}
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

          {/* Process-based Gantt Chart */}
          <div className="space-y-4">
            {processesTiming.map((process, processIndex) => (
              <div key={process.name} className="flex items-center ">
                <div className="w-20 mr-4 flex items-center gap-2 ">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: process.color }} />
                  <span className="text-sm font-medium ">{process.name}</span>
                </div>
                <div className="relative h-8 flex-grow ">
                  {process.segments.map((segment, segmentIndex) => {
                    const width = (segment.end - segment.start) * 48; // 48px per time unit
                    const left = segment.start * 48;

                    return (
                      <motion.div
                        key={`${process.name}-${segmentIndex}`}
                        initial={{ scaleX: 0, opacity: 0 }}
                        animate={{ scaleX: 1, opacity: 1 }}
                        transition={{ duration: 0.5, delay: processIndex * 0.1 + segmentIndex * 0.05 }}
                        style={{
                          position: "absolute",
                          left: `${left}px`,
                          width: `${width}px`,
                          height: "100%",
                          backgroundColor: process.color,
                          transformOrigin: "left",
                          borderRadius: "6px",
                        }}
                        className="flex items-center justify-center shadow-md "
                      >
                        {width > 40 && <span className="text-xs font-medium text-slate-900 truncate px-2 dark:text-gray-500">{segment.end - segment.start}</span>}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Traditional Gantt Chart */}
          <div className="mt-12">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">Sequential Execution</h3>
            <div className="relative h-16">
              {ganttData.map((item, index) => {
                const width = (item.endTime - item.startTime) * 48; // 48px per time unit
                const left = item.startTime * 48;

                return (
                  <motion.div
                    key={`sequential-${item.processId}-${item.startTime}`}
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
                    className="flex flex-col items-center justify-center shadow-md "
                  >
                    <span className="font-medium text-slate-900 truncate px-2 dark:text-gray-500">{item.name}</span>
                    {width > 50 && (
                      <span className="text-xs text-slate-900/80 truncate px-2">
                        {item.startTime} - {item.endTime}
                      </span>
                    )}
                  </motion.div>
                );
              })}
            </div>
            <div className="flex h-6 mt-2">
              {Array.from({ length: maxTime + 1 }).map((_, i) => (
                <div key={`timeline-${i}`} className="flex-shrink-0 w-12 border-r border-border/40 flex items-center justify-center text-xs text-muted-foreground">
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
