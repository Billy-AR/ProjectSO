// src/components/ProcessTable.tsx
import type { Process } from "../types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Trash2, AlertCircle } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";

interface ProcessTableProps {
  processes: Process[];
  removeProcess: (id: string) => void;
  isSimulating: boolean;
}

export default function ProcessTable({ processes, removeProcess, isSimulating }: ProcessTableProps) {
  if (processes.length === 0) {
    return (
      <div className="text-center py-6 px-4 border border-dashed border-muted-foreground/20 rounded-lg">
        <AlertCircle className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
        <p className="text-muted-foreground">No processes added yet</p>
        <p className="text-xs text-muted-foreground/70 mt-1">Add processes using the form above</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[250px]">
      <Table>
        <TableHeader className="sticky top-0 bg-card z-10">
          <TableRow>
            <TableHead className="w-[100px]">Name</TableHead>
            <TableHead>Arrival</TableHead>
            <TableHead>Burst</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead className="w-[60px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <AnimatePresence>
            {processes.map((process) => (
              <motion.tr key={process.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }} className="border-b border-border/50 last:border-0">
                <TableCell className="font-medium p-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: process.color }} />
                    <span>{process.name}</span>
                  </div>
                </TableCell>
                <TableCell className="p-2">{process.arrivalTime}</TableCell>
                <TableCell className="p-2">{process.burstTime}</TableCell>
                <TableCell className="p-2">
                  <Badge variant={process.priority <= 3 ? "default" : "secondary"} className="font-normal">
                    {process.priority}
                  </Badge>
                </TableCell>
                <TableCell className="p-2">
                  <Button variant="ghost" size="icon" onClick={() => removeProcess(process.id)} disabled={isSimulating} className="h-8 w-8 text-white hover:text-destructive">
                    <Trash2 className="h-4 w-4  " />
                  </Button>
                </TableCell>
              </motion.tr>
            ))}
          </AnimatePresence>
        </TableBody>
      </Table>
    </ScrollArea>
  );
}
