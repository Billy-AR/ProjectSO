// src/App.tsx
import { useState } from "react";
import type { Process, AlgorithmType, ExecutionStep } from "./types";
import { simulateFCFS } from "./algoritma/fcfs";
import { simulateSJF } from "./algoritma/sjf";
import { simulatePriority } from "./algoritma/priority";
import { simulateRoundRobin } from "./algoritma/roundRobin";
import AlgorithmSelector from "./components/AlgorithymSelector";
import ProcessForm from "./components/ProcessForm";
import ProcessTable from "./components/ProcessTable";
import GanttChart from "./components/GanttChart";
import Statistics from "./components/Statistics";
import Visualization from "./components/Visualization";
import { Button } from "./components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { ThemeProvider } from "./components/ThemeProvider";
import { ModeToggle } from "./components/ModeToggle";

export default function App() {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [algorithm, setAlgorithm] = useState<AlgorithmType>("FCFS");
  const [quantum, setQuantum] = useState<number>(2);
  const [executionSteps, setExecutionSteps] = useState<ExecutionStep[]>([]);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);

  const addProcess = (process: Process) => {
    setProcesses([...processes, process]);
  };

  const removeProcess = (id: string) => {
    setProcesses(processes.filter((p) => p.id !== id));
  };

  const runSimulation = () => {
    let steps: ExecutionStep[] = [];

    switch (algorithm) {
      case "FCFS":
        steps = simulateFCFS(processes);
        break;
      case "SJF":
        steps = simulateSJF(processes);
        break;
      case "Priority":
        steps = simulatePriority(processes);
        break;
      case "RoundRobin":
        steps = simulateRoundRobin(processes, quantum);
        break;
    }

    setExecutionSteps(steps);
    setCurrentStep(0);
    setIsSimulating(true);
  };

  const resetSimulation = () => {
    setIsSimulating(false);
    setCurrentStep(0);
    setExecutionSteps([]);
  };

  return (
    <ThemeProvider defaultTheme="dark">
      <div className="min-h-screen bg-gradient-to-br from-background to-background/80 text-foreground p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <header className="flex justify-between items-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-400">CPU Process Scheduling Simulator test pull</h1>
            <ModeToggle />
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Configuration</CardTitle>
                </CardHeader>
                <CardContent>
                  <AlgorithmSelector algorithm={algorithm} setAlgorithm={setAlgorithm} quantum={quantum} setQuantum={setQuantum} />

                  <div className="mt-6">
                    <ProcessForm addProcess={addProcess} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Process List</CardTitle>
                </CardHeader>
                <CardContent>
                  <ProcessTable processes={processes} removeProcess={removeProcess} isSimulating={isSimulating} />

                  <div className="mt-4 flex-col space-y-5">
                    <div className="border-2 rounded-2xl">
                      <Button onClick={runSimulation} disabled={processes.length === 0 || isSimulating} size="lg" className="w-full text-white">
                        Run Simulation
                      </Button>
                    </div>

                    <div className="border-2 rounded-2xl">
                      <Button onClick={resetSimulation} disabled={!isSimulating} variant="outline" size="lg" className="w-full text-white ">
                        Reset
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-8 space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <Tabs defaultValue="visualization" className="w-full">
                    <TabsList className="grid grid-cols-2 gap-x-4 w-full">
                      <TabsTrigger value="visualization" className="text-white">
                        Visualization
                      </TabsTrigger>
                      <TabsTrigger value="gantt" className="text-white">
                        Gantt Chart
                      </TabsTrigger>
                    </TabsList>

                    <CardContent className="pt-0">
                      <TabsContent value="visualization" className="h-[450px] mt-0">
                        <Visualization executionSteps={executionSteps} currentStep={currentStep} setCurrentStep={setCurrentStep} isSimulating={isSimulating} />
                      </TabsContent>

                      <TabsContent value="gantt" className="h-[450px] mt-0">
                        <GanttChart executionSteps={executionSteps} processes={processes} />
                      </TabsContent>
                    </CardContent>
                  </Tabs>{" "}
                  {/* Close Tabs here */}
                </CardHeader>
              </Card>{" "}
              {/* Close Card here */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <Statistics executionSteps={executionSteps} processes={processes} />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}
