'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Briefcase, ChevronLeft, Check, Circle } from 'lucide-react';
import type { Procurement, ProcurementPhase } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardDescription,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PhaseCard } from '@/components/phase-card';
import { updateProcurement } from '@/lib/data';
import { formatCurrency, cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { ProcurementSummaryDialog } from './procurement-summary-dialog';
import { getNewProcurementPhases } from '@/lib/constants';
import { CompletionDialog } from './completion-dialog';

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

// Helper to merge database phase data with latest constant definitions
const mergeWithLatestPhases = (procurementData: Procurement): Procurement => {
  if (!procurementData.phases || procurementData.phases.length === 0) {
    return { ...procurementData, phases: getNewProcurementPhases() };
  }
  const latestPhaseDefinitions = getNewProcurementPhases();
  const mergedPhases = latestPhaseDefinitions.map((latestPhase) => {
    const dbPhase = procurementData.phases.find(p => p.id === latestPhase.id);
    if (dbPhase) {
      // Keep all progress from db (signatures, checklist state, etc)
      // and only overwrite the name to ensure it's up-to-date.
      return {
        ...dbPhase,
        name: latestPhase.name,
      };
    }
    // This case should ideally not be hit if DB data exists and is aligned.
    return latestPhase;
  });
  return { ...procurementData, phases: mergedPhases };
};


export function ProcurementDetailView({ initialProcurement }: { initialProcurement: any }) {
  const [procurement, setProcurement] = useState<Procurement>(() => {
    const parsed = parseProcurement(initialProcurement);
    return mergeWithLatestPhases(parsed);
  });
  const { toast } = useToast();
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [isCompletionDialogOpen, setIsCompletionDialogOpen] = useState(false);
  
  const getActiveTab = (phases: ProcurementPhase[]) => {
    const firstIncompletePhase = phases.find(p => !p.isCompleted);
    return `phase-${firstIncompletePhase ? firstIncompletePhase.id : phases[phases.length - 1].id}`;
  };

  const [activeTab, setActiveTab] = useState(() => getActiveTab(procurement.phases));

  const handlePhaseUpdate = async (updatedPhase: ProcurementPhase) => {
    const isCompleted = !!updatedPhase.submittedBy && !!updatedPhase.receivedBy;
    const phaseWithCompletion = { ...updatedPhase, isCompleted };

    const newPhases = procurement.phases.map(p => p.id === phaseWithCompletion.id ? phaseWithCompletion : p);
    
    let finalStatus = procurement.status;
    const isLastPhase = phaseWithCompletion.id === procurement.phases[procurement.phases.length - 1].id;

    if (isLastPhase && phaseWithCompletion.isCompleted) {
        finalStatus = 'archived';
    }

    const updatedProcurementData = { ...procurement, phases: newPhases, status: finalStatus };
    setProcurement(updatedProcurementData);
    
    // Persist changes
    await updateProcurement(procurement.id, { phases: newPhases, status: finalStatus });
    
    toast({ title: "Progress Saved", description: `Phase ${phaseWithCompletion.name} has been updated.` });

    if (isLastPhase && phaseWithCompletion.isCompleted) {
        setIsCompletionDialogOpen(true);
    } else if (phaseWithCompletion.isCompleted) {
        const nextTab = getActiveTab(newPhases);
        setActiveTab(nextTab);
        if (nextTab !== activeTab) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }
  };

  const handleViewSummary = (updatedPhase: ProcurementPhase) => {
    // Merge the latest phase data from the card into the main procurement state
    const newPhases = procurement.phases.map(p => p.id === updatedPhase.id ? updatedPhase : p);
    const updatedProcurementData = { ...procurement, phases: newPhases };
    
    // Update the state immediately so the dialog gets the fresh data
    setProcurement(updatedProcurementData);
    
    // Open the dialog
    setIsSummaryOpen(true);
    
    // Save the latest data to the database in the background
    updateProcurement(procurement.id, { phases: newPhases });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground shadow-md sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between gap-4 p-4">
          <div className="flex items-center gap-4">
            <Briefcase className="h-8 w-8" />
            <h1 className="text-2xl font-bold font-headline">ILCDB Procurement System</h1>
          </div>
          <Button asChild variant="secondary">
            <Link href="/procurement">
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
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="p-0 bg-transparent h-auto overflow-x-auto w-full">
              <div className="flex items-center border-b w-full">
                {procurement.phases.map((phase, index) => {
                  const isUnlocked = index === 0 || procurement.phases[index - 1].isCompleted;
                  const isActive = `phase-${phase.id}` === activeTab;

                  return (
                    <React.Fragment key={phase.id}>
                      <TabsTrigger
                        value={`phase-${phase.id}`}
                        disabled={!isUnlocked}
                        className={cn(
                          "flex-auto group flex items-center gap-2 p-4 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary disabled:opacity-50 disabled:cursor-not-allowed justify-center text-center sm:justify-start sm:text-left"
                        )}
                      >
                        <div
                          className={cn(
                            "flex items-center justify-center rounded-full h-8 w-8 text-base border-2 transition-colors",
                            isActive ? "bg-primary border-primary text-primary-foreground" : "bg-muted border-muted-foreground/20 text-muted-foreground",
                            phase.isCompleted && !isActive && "bg-green-500 border-green-500 text-white",
                            !isUnlocked && "bg-muted border-border"
                          )}
                        >
                          {phase.isCompleted ? <Check className="h-5 w-5" /> : <span className="font-bold">{phase.id}</span>}
                        </div>
                        <div className="hidden sm:block">
                          <span className="font-semibold text-sm">{`Phase ${phase.id}`}</span>
                        </div>
                      </TabsTrigger>
                      {index < procurement.phases.length - 1 && (
                        <div className="h-px w-full bg-border" />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </TabsList>
            {procurement.phases.map((phase, index) => {
              const isUnlocked = index === 0 || procurement.phases[index - 1].isCompleted;
              return (
                <TabsContent key={phase.id} value={`phase-${phase.id}`} className="mt-4">
                  <PhaseCard
                    phase={phase}
                    onUpdate={handlePhaseUpdate}
                    disabled={!isUnlocked}
                    onViewSummary={handleViewSummary}
                  />
                </TabsContent>
              );
            })}
          </Tabs>
        </div>
      </main>
       <ProcurementSummaryDialog procurement={procurement} open={isSummaryOpen} onOpenChange={setIsSummaryOpen} />
       <CompletionDialog
          open={isCompletionDialogOpen}
          onOpenChange={setIsCompletionDialogOpen}
          procurementTitle={procurement.title}
        />
    </div>
  );
}
