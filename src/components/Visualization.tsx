// src/components/Visualization.tsx
import { useState, useEffect, useRef } from "react";
import type { ExecutionStep } from "../types/index";
import { motion, AnimatePresence } from "framer-motion";
import { Slider } from "./ui/slider";
import { Button } from "./ui/button";
import { Play, Pause, SkipBack, SkipForward, ChevronLeft, ChevronRight, CpuIcon, TimerIcon, Server, Check } from "lucide-react";
import { Card } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";

interface VisualizationProps {
  executionSteps: ExecutionStep[];
  currentStep: number;
  setCurrentStep: (step: number | ((prev: number) => number)) => void; // Updated type to accept function
  isSimulating: boolean;
}

export default function Visualization({ executionSteps, currentStep, setCurrentStep, isSimulating }: VisualizationProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isPlaying && currentStep < executionSteps.length - 1) {
      intervalRef.current = window.setInterval(() => {
        setCurrentStep((prev: number) => {
          if (prev >= executionSteps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1000 / playbackSpeed);
    } else if (!isPlaying && intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, currentStep, executionSteps.length, setCurrentStep, playbackSpeed]);

  if (!isSimulating || executionSteps.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <Server className="h-16 w-16 mx-auto mb-4 opacity-20" />
          <p className="text-lg">Add processes and run the simulation</p>
          <p className="text-sm mt-2">The visualization will show the CPU scheduling process</p>
        </div>
      </div>
    );
  }

  const currentState = executionSteps[currentStep];

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 relative overflow-hidden bg-black/10 rounded-lg p-4">
        {/* CPU Section */}
        <motion.div
          className="absolute top-6 left-1/2 -translate-x-1/2 w-64 h-32 border-2 border-primary/70 rounded-xl bg-background/90 backdrop-blur flex items-center justify-center shadow-lg shadow-primary/10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <CpuIcon className="h-5 w-5 text-primary" />
              <p className="text-lg font-medium">CPU</p>
            </div>
            <AnimatePresence mode="wait">
              {currentState.runningProcess ? (
                <motion.div
                  key={currentState.runningProcess.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                  className="px-4 py-2 rounded-lg shadow-md"
                  style={{ backgroundColor: currentState.runningProcess.color }}
                >
                  <p className="font-semibold text-slate-900">{currentState.runningProcess.name}</p>
                  <p className="text-xs text-slate-900/80 mt-1">Burst: {currentState.runningProcess.burstTime}</p>
                </motion.div>
              ) : (
                <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-4 py-2 rounded-lg bg-muted text-muted-foreground">
                  <p>Idle</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Ready Queue */}
        <motion.div
          className="absolute bottom-6 left-6 w-64 border-2 border-amber-500/70 rounded-xl bg-background/90 backdrop-blur p-4 shadow-lg shadow-amber-500/10"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <TimerIcon className="h-4 w-4 text-amber-500" />
            <p className="text-lg font-medium">Ready Queue</p>
          </div>
          <ScrollArea className="h-32">
            <div className="space-y-2">
              <AnimatePresence>
                {currentState.readyQueue.map((process, index) => (
                  <motion.div
                    key={process.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="px-3 py-1.5 rounded-lg flex items-center shadow-sm text-white"
                    style={{ backgroundColor: process.color }}
                  >
                    <p className="font-medium text-slate-900">{process.name}</p>
                    <div className="ml-auto flex gap-2 text-xs text-slate-900/80">
                      <span>BT: {process.burstTime}</span>
                      <span>P: {process.priority}</span>
                    </div>
                  </motion.div>
                ))}
                {currentState.readyQueue.length === 0 && <p className="text-muted-foreground text-center py-2 text-sm">Queue Empty</p>}
              </AnimatePresence>
            </div>
          </ScrollArea>
        </motion.div>

        {/* Completed Processes */}
        <motion.div
          className="absolute bottom-6 right-6 w-64 border-2 border-green-500/70 rounded-xl bg-background/90 backdrop-blur p-4 shadow-lg shadow-green-500/10"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Check className="h-4 w-4 text-green-500" />
            <p className="text-lg font-medium">Completed</p>
          </div>
          <ScrollArea className="h-32">
            <div className="space-y-2">
              <AnimatePresence>
                {currentState.completedProcesses.map((process) => (
                  <motion.div key={process.id} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }} className="px-3 py-1.5 rounded-lg shadow-sm" style={{ backgroundColor: process.color }}>
                    <div className="flex items-center ">
                      <p className="font-medium text-slate-900 ">{process.name}</p>
                      <p className="ml-auto text-xs text-slate-900/80">TAT: {process.turnaroundTime}</p>
                    </div>
                  </motion.div>
                ))}
                {currentState.completedProcesses.length === 0 && <p className="text-muted-foreground text-center py-2 text-sm">No Completed Processes</p>}
              </AnimatePresence>
            </div>
          </ScrollArea>
        </motion.div>

        {/* Time Display */}
        <motion.div
          className="absolute top-6 right-6 bg-background/90 backdrop-blur border border-border px-4 py-2 rounded-lg shadow-md"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">Current Time:</span>
            <p className="text-xl font-mono font-semibold text-primary text-t">{currentState.time}</p>
          </div>
        </motion.div>
      </div>

      {/* Controls */}
      <Card className="mt-6 p-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground ">Step:</span>
            <Badge variant="outline">
              {currentStep + 1} / {executionSteps.length}
            </Badge>
            <div className="ml-auto flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Speed:</span>
              <Button variant={playbackSpeed === 0.5 ? "secondary" : "outline"} size="sm" onClick={() => setPlaybackSpeed(0.5)} className="h-8 w-12 text-white">
                0.5x
              </Button>
              <Button variant={playbackSpeed === 1 ? "secondary" : "outline"} size="sm" onClick={() => setPlaybackSpeed(1)} className="h-8 w-12 text-white">
                1x
              </Button>
              <Button variant={playbackSpeed === 2 ? "secondary" : "outline"} size="sm" onClick={() => setPlaybackSpeed(2)} className="h-8 w-12 text-white">
                2x
              </Button>
            </div>
          </div>

          <Slider value={[currentStep]} min={0} max={executionSteps.length - 1} step={1} onValueChange={(vals) => setCurrentStep(vals[0])} />

          <div className="flex justify-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setCurrentStep(0)} disabled={currentStep === 0}>
              <SkipBack className="h-4 w-4 text-white" />
            </Button>

            <Button variant="outline" size="icon" onClick={() => setCurrentStep(Math.max(0, currentStep - 1))} disabled={currentStep === 0}>
              <ChevronLeft className="h-4 w-4 text-white" />
            </Button>

            <Button variant={isPlaying ? "secondary" : "default"} onClick={() => setIsPlaying(!isPlaying)} disabled={currentStep >= executionSteps.length - 1} className="w-24 text-white">
              {isPlaying ? <Pause className="h-4 w-4 mr-2 text-white" /> : <Play className="h-4 w-4 mr-2 text-white" />}
              {isPlaying ? "Pause" : "Play"}
            </Button>

            <Button variant="outline" size="icon" onClick={() => setCurrentStep(Math.min(executionSteps.length - 1, currentStep + 1))} disabled={currentStep >= executionSteps.length - 1}>
              <ChevronRight className="h-4 w-4 text-white" />
            </Button>

            <Button variant="outline" size="icon" onClick={() => setCurrentStep(executionSteps.length - 1)} disabled={currentStep >= executionSteps.length - 1}>
              <SkipForward className="h-4 w-4 text-white" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
