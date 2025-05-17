// src/components/AlgorithmSelector.tsx
import type { AlgorithmType } from "../types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Slider } from "./ui/slider";
import { useState, useEffect } from "react";

interface AlgorithmSelectorProps {
  algorithm: AlgorithmType;
  setAlgorithm: (algorithm: AlgorithmType) => void;
  quantum: number;
  setQuantum: (quantum: number) => void;
}

export default function AlgorithmSelector({ algorithm, setAlgorithm, quantum, setQuantum }: AlgorithmSelectorProps) {
  const [localQuantum, setLocalQuantum] = useState(quantum);

  useEffect(() => {
    setQuantum(localQuantum);
  }, [localQuantum, setQuantum]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="algorithm" className="text-sm font-medium">
          Scheduling Algorithm
        </Label>
        <Select value={algorithm} onValueChange={(value) => setAlgorithm(value as AlgorithmType)}>
          <SelectTrigger id="algorithm" className="w-full text-white">
            <SelectValue placeholder="Select Algorithm" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="FCFS">First Come First Serve (FCFS)</SelectItem>
            <SelectItem value="SJF">Shortest Job First (SJF)</SelectItem>
            <SelectItem value="Priority">Priority Scheduling</SelectItem>
            <SelectItem value="RoundRobin">Round Robin</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground mt-1">
          {algorithm === "FCFS" && "Processes are executed in the order they arrive."}
          {algorithm === "SJF" && "Executes the process with shortest burst time first."}
          {algorithm === "Priority" && "Executes the process with highest priority (lowest number) first."}
          {algorithm === "RoundRobin" && "Executes processes in a circular manner with time quantum."}
        </p>
      </div>

      {algorithm === "RoundRobin" && (
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <Label htmlFor="quantum" className="text-sm font-medium">
                Time Quantum: {localQuantum}
              </Label>
            </div>
            <Slider id="quantum" min={1} max={10} step={1} value={[localQuantum]} onValueChange={(value) => setLocalQuantum(value[0])} className="w-full" />
            <div className="flex justify-between mt-1">
              <span className="text-xs text-muted-foreground">1</span>
              <span className="text-xs text-muted-foreground">10</span>
            </div>
          </div>
          <div>
            <Label htmlFor="quantum-input" className="text-sm font-medium sr-only">
              Time Quantum Input
            </Label>
            <Input id="quantum-input" type="number" min="1" value={localQuantum} onChange={(e) => setLocalQuantum(parseInt(e.target.value) || 1)} className="w-full" />
          </div>
        </div>
      )}
    </div>
  );
}
