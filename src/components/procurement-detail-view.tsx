'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Briefcase, ChevronLeft, CheckCircle2, Circle } from 'lucide-react';
import type { Procurement } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PhaseCard } from '@/components/phase-card';
import { updateProcurement } from '@/lib/data';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

// Helper to parse the serialized procurement object
const parseProcurement = (serialized: any): Procurement => {
  return {
    ...serialized,
    createdAt: new Date(serialized.createdAt),
    updatedAt: new Date(serialized.updatedAt),
    phases: serialized.phases.map((phase: any) => ({
      ...phase,
      submittedBy: phase.submittedBy ? { ...phase.submittedBy, date: phase.submittedBy.date ? new Date(phase.submittedBy.date) : null } : null,
      receivedBy: phase.receivedBy ? { ...phase.receivedBy, date: phase.receivedBy.date ? new Date(phase.receivedBy.date) : null } : null,
    })),
  };
};


export function ProcurementDetailView({ initialProcurement }: { initialProcurement: any }) {
  const [procurement, setProcurement] = useState<Procurement>(parseProcurement(initialProcurement));
  const { toast } = useToast();

  const handlePhaseUpdate = async (updatedPhase: any) => {
    const newPhases = procurement.phases.map(p => p.id === updatedPhase.id ? updatedPhase : p);
    
    // check if all items in checklist are checked
    const allChecked = updatedPhase.checklist.every((item: any) => item.checked);
    // check if both signatures are present
    const signaturesDone = !!updatedPhase.submittedBy && !!updatedPhase.receivedBy;

    updatedPhase.isCompleted = allChecked && signaturesDone;

    const updatedProcurementData = { ...procurement, phases: newPhases };
    setProcurement(updatedProcurementData);
    
    // Persist changes
    await updateProcurement(procurement.id, { phases: newPhases });

    toast({ title: "Progress Saved", description: `Phase ${updatedPhase.id} has been updated.` });
  };

  const firstIncompletePhase = procurement.phases.find(p => !p.isCompleted);
  const defaultTab = `phase-${firstIncompletePhase ? firstIncompletePhase.id : procurement.phases.length}`;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground shadow-md sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between gap-4 p-4">
          <div className="flex items-center gap-4">
            <Briefcase className="h-8 w-8" />
            <h1 className="text-2xl font-bold font-headline">ProcureFlow</h1>
          </div>
          <Button asChild variant="secondary">
            <Link href="/">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6 md:p-8 container mx-auto">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-headline">{procurement.title}</CardTitle>
              <CardDescription className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-2">
                <span>PR Number: <span className="font-semibold text-foreground">{procurement.prNumber}</span></span>
                <span>Amount: <span className="font-semibold text-foreground">{formatCurrency(procurement.amount)}</span></span>
                <Badge variant="outline">{procurement.projectType}</Badge>
                <Badge variant={procurement.status === 'active' ? 'default' : 'secondary'} className="capitalize bg-accent text-accent-foreground">{procurement.status}</Badge>
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
                {procurement.phases.map(phase => (
                    <TabsTrigger key={phase.id} value={`phase-${phase.id}`} className="flex items-center gap-2">
                        {phase.isCompleted ? <CheckCircle2 className="h-4 w-4 text-green-500"/> : <Circle className="h-4 w-4 text-muted-foreground/50"/>}
                        Phase {phase.id}
                    </TabsTrigger>
                ))}
            </TabsList>
            {procurement.phases.map(phase => (
              <TabsContent key={phase.id} value={`phase-${phase.id}`} className="mt-4">
                <PhaseCard
                  phase={phase}
                  onUpdate={handlePhaseUpdate}
                />
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </main>
    </div>
  );
}
