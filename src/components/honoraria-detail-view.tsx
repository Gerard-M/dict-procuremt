'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Award, ChevronLeft, Check } from 'lucide-react';
import type { Honoraria, ProcurementPhase } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardDescription,
  CardTitle,
} from '@/components/ui/card';
import { PhaseCard } from '@/components/phase-card';
import { updateHonoraria } from '@/lib/data';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { HonorariaSummaryDialog } from './honoraria-summary-dialog';
import { CompletionDialog } from './completion-dialog';

// Helper to parse the serialized honoraria object
const parseHonoraria = (serialized: any): Honoraria => {
  return {
    ...serialized,
    createdAt: new Date(serialized.createdAt),
    updatedAt: new Date(serialized.updatedAt),
    phase: {
        ...serialized.phase,
        submittedBy: serialized.phase.submittedBy ? { ...serialized.phase.submittedBy, date: serialized.phase.submittedBy.date ? new Date(serialized.phase.submittedBy.date) : null } : null,
        receivedBy: serialized.phase.receivedBy ? { ...serialized.phase.receivedBy, date: serialized.phase.receivedBy.date ? new Date(serialized.phase.receivedBy.date) : null } : null,
    },
  };
};


export function HonorariaDetailView({ initialHonoraria }: { initialHonoraria: any }) {
  const [honoraria, setHonoraria] = useState<Honoraria>(() => parseHonoraria(initialHonoraria));
  const { toast } = useToast();
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [isCompletionDialogOpen, setIsCompletionDialogOpen] = useState(false);

  const handlePhaseUpdate = async (updatedPhase: ProcurementPhase) => {
    const isCompleted = !!updatedPhase.submittedBy && !!updatedPhase.receivedBy;
    const phaseWithCompletion = { ...updatedPhase, isCompleted };

    let finalStatus = honoraria.status;
    if (isCompleted) {
        finalStatus = 'archived';
    }

    const updatedHonorariaData = { ...honoraria, phase: phaseWithCompletion, status: finalStatus };
    setHonoraria(updatedHonorariaData);
    
    // Persist changes
    await updateHonoraria(honoraria.id, { phase: phaseWithCompletion, status: finalStatus });
    
    toast({ title: "Progress Saved", description: `${phaseWithCompletion.name} has been updated.` });

    if (isCompleted) {
        setIsCompletionDialogOpen(true);
    }
  };

  const handleViewSummary = (updatedPhase: ProcurementPhase) => {
    const updatedHonorariaData = { ...honoraria, phase: updatedPhase };
    setHonoraria(updatedHonorariaData);
    setIsSummaryOpen(true);
    updateHonoraria(honoraria.id, { phase: updatedPhase });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground shadow-md sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between gap-4 p-4">
          <div className="flex items-center gap-4">
            <Award className="h-8 w-8" />
            <h1 className="text-2xl font-bold font-headline">ILCDB Honoraria System</h1>
          </div>
          <Button asChild variant="secondary">
            <Link href="/honoraria">
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
              <CardTitle className="text-2xl font-headline">{honoraria.activityTitle}</CardTitle>
              <CardDescription className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-2">
                <span>Speaker: <span className="font-semibold text-foreground">{honoraria.speakerName}</span></span>
                <span>Amount: <span className="font-semibold text-foreground">{formatCurrency(honoraria.amount)}</span></span>
                {honoraria.projectType && <Badge variant="outline">{honoraria.projectType === 'OTHERS' ? honoraria.otherProjectType : honoraria.projectType}</Badge>}
                <Badge variant={honoraria.status === 'active' ? 'default' : 'secondary'} className="capitalize bg-accent text-accent-foreground">{honoraria.status}</Badge>
              </CardDescription>
            </CardHeader>
          </Card>
          
          <div className="mt-4">
            <PhaseCard
              phase={honoraria.phase}
              onUpdate={handlePhaseUpdate}
              onViewSummary={handleViewSummary}
            />
          </div>
        </div>
      </main>
       <HonorariaSummaryDialog honoraria={honoraria} open={isSummaryOpen} onOpenChange={setIsSummaryOpen} />
       <CompletionDialog
          open={isCompletionDialogOpen}
          onOpenChange={(open) => {
              setIsCompletionDialogOpen(open);
              if (!open) {
                // Since this dialog is the end of the flow, redirect when it closes
                window.location.href = '/honoraria';
              }
          }}
          procurementTitle={honoraria.activityTitle}
        />
    </div>
  );
}
