// src/components/Statistics.tsx
import { useMemo } from "react";
import type { ExecutionStep, Process } from "../types";
import { Card } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Server, ClockIcon, TimerIcon, BarChart3 } from "lucide-react";

interface StatisticsProps {
  executionSteps: ExecutionStep[];
  processes: Process[];
}

export default function Statistics({ executionSteps }: StatisticsProps) {
  const stats = useMemo(() => {
    if (executionSteps.length === 0) return null;

    const lastStep = executionSteps[executionSteps.length - 1];
    const completedProcesses = lastStep.completedProcesses;

    const totalTurnaroundTime = completedProcesses.reduce((sum, process) => sum + (process.turnaroundTime || 0), 0);
    const totalWaitingTime = completedProcesses.reduce((sum, process) => sum + (process.waitingTime || 0), 0);

    const avgTurnaroundTime = totalTurnaroundTime / completedProcesses.length;
    const avgWaitingTime = totalWaitingTime / completedProcesses.length;
    const throughput = completedProcesses.length / lastStep.time;

    const chartData = completedProcesses.map((process) => ({
      name: process.name,
      waitingTime: process.waitingTime || 0,
      turnaroundTime: process.turnaroundTime || 0,
      burstTime: process.burstTime,
      color: process.color,
    }));

    return {
      totalTime: lastStep.time,
      avgTurnaroundTime,
      avgWaitingTime,
      throughput,
      completedProcesses,
      chartData,
    };
  }, [executionSteps]);

  if (!stats) {
    return (
      <div className="text-center text-muted-foreground py-12">
        <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-20" />
        <p className="text-lg">Run the simulation to view statistics</p>
        <p className="text-sm mt-2">You'll see metrics like average waiting time and throughput</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
      <div className="md:col-span-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Execution Time</p>
                <p className="text-3xl font-semibold mt-2">{stats.totalTime}</p>
                <p className="text-xs text-muted-foreground mt-1">time units</p>
              </div>
              <ClockIcon className="h-6 w-6 text-primary/60" />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }} className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-lg p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Throughput</p>
                <p className="text-3xl font-semibold mt-2">{stats.throughput.toFixed(3)}</p>
                <p className="text-xs text-muted-foreground mt-1">processes per unit time</p>
              </div>
              <TimerIcon className="h-6 w-6 text-blue-500/60" />
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }} className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 rounded-lg p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Turnaround Time</p>
                <p className="text-3xl font-semibold mt-2">{stats.avgTurnaroundTime.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground mt-1">time units</p>
              </div>
              <ClockIcon className="h-6 w-6 text-amber-500/60" />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.3 }} className="bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-lg p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Waiting Time</p>
                <p className="text-3xl font-semibold mt-2">{stats.avgWaitingTime.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground mt-1">time units</p>
              </div>
              <TimerIcon className="h-6 w-6 text-green-500/60" />
            </div>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.4 }} className="bg-card rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="font-medium">Time Metrics Comparison</h3>
          </div>
          <div className="p-4 h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={50} />
                <Tooltip contentStyle={{ backgroundColor: "rgba(23, 23, 23, 0.9)", borderColor: "rgba(63, 63, 70, 0.5)" }} labelStyle={{ fontWeight: "bold" }} />
                <Bar dataKey="waitingTime" name="Waiting Time" stackId="a">
                  {stats.chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.4} />
                  ))}
                </Bar>
                <Bar dataKey="burstTime" name="Burst Time" stackId="a">
                  {stats.chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="md:col-span-7">
        <Card className="h-full overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center">
            <Server className="h-4 w-4 mr-2 text-muted-foreground" />
            <h3 className="font-medium">Process Details</h3>
          </div>
          <ScrollArea className="h-[280px]">
            <div className="p-4 grid grid-cols-1 gap-3">
              {stats.completedProcesses.map((process, index) => (
                <motion.div
                  key={process.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="rounded-lg p-3 border border-border/60 hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: process.color }} />
                      <span className="font-medium">{process.name}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">Completion Time: {process.endTime}</div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-2 gap-x-4 mt-3 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Arrival</p>
                      <p>{process.arrivalTime}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Burst</p>
                      <p>{process.burstTime}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Turnaround</p>
                      <p>{process.turnaroundTime}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Waiting</p>
                      <p>{process.waitingTime}</p>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-border/40">
                    <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 1, delay: index * 0.1 }} className="absolute h-full rounded-full flex">
                        <div
                          className="h-full"
                          style={{
                            backgroundColor: process.color + "90",
                            width: `${((process.waitingTime || 0) / (process.turnaroundTime || 1)) * 100}%`,
                          }}
                        />
                        <div
                          className="h-full"
                          style={{
                            backgroundColor: process.color,
                            width: `${(process.burstTime / (process.turnaroundTime || 1)) * 100}%`,
                          }}
                        />
                      </motion.div>
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                      <span>Arrival: {process.arrivalTime}</span>
                      <span>Start: {process.startTime}</span>
                      <span>End: {process.endTime}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        </Card>
      </motion.div>
    </div>
  );
}
