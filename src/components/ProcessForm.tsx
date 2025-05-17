// src/components/ProcessForm.tsx
import { useState } from "react";
import type { Process } from "../types";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import { PlusCircle } from "lucide-react";
import { getRandomColor, generateId } from "../lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

interface ProcessFormProps {
  addProcess: (process: Process) => void;
}

export default function ProcessForm({ addProcess }: ProcessFormProps) {
  const [name, setName] = useState("");
  const [arrivalTime, setArrivalTime] = useState(0);
  const [burstTime, setBurstTime] = useState(1);
  const [priority, setPriority] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newProcess: Process = {
      id: crypto.randomUUID?.() || generateId(),
      name: name || `P${Math.floor(Math.random() * 1000)}`,
      arrivalTime,
      burstTime,
      priority,
      color: getRandomColor(),
      remainingTime: burstTime,
    };

    addProcess(newProcess);

    // Reset form
    setName("");
    setArrivalTime(0);
    setBurstTime(1);
    setPriority(1);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium">
            Process Name
          </Label>
          <Input id="name" placeholder="P1" value={name} onChange={(e) => setName(e.target.value)} className="w-full" />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="arrivalTime" className="text-sm font-medium">
              Arrival Time: {arrivalTime}
            </Label>
          </div>
          <Slider id="arrivalTime" min={0} max={20} step={1} value={[arrivalTime]} onValueChange={(value) => setArrivalTime(value[0])} className="w-full" />
          <Input type="number" min="0" value={arrivalTime} onChange={(e) => setArrivalTime(parseInt(e.target.value) || 0)} className="w-full mt-2" />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="burstTime" className="text-sm font-medium">
              Burst Time: {burstTime}
            </Label>
          </div>
          <Slider id="burstTime" min={1} max={20} step={1} value={[burstTime]} onValueChange={(value) => setBurstTime(value[0])} className="w-full" />
          <Input type="number" min="1" value={burstTime} onChange={(e) => setBurstTime(parseInt(e.target.value) || 1)} className="w-full mt-2" />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="priority" className="text-sm font-medium">
              Priority: {priority}
            </Label>
          </div>
          <Slider id="priority" min={1} max={10} step={1} value={[priority]} onValueChange={(value) => setPriority(value[0])} className="w-full" />
          <Input type="number" min="1" value={priority} onChange={(e) => setPriority(parseInt(e.target.value) || 1)} className="w-full mt-2" />
          <p className="text-xs text-muted-foreground mt-1">Lower values indicate higher priority</p>
        </div>
      </div>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="border-2 rounded-2xl">
              <Button type="submit" className="w-full gap-2 text-white" size="lg">
                <PlusCircle className="h-4 w-4 text-white" /> Add Process
              </Button>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Add a new process to the simulation</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </form>
  );
}
