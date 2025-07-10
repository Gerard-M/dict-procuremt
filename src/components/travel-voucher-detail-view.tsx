'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Plane, ChevronLeft } from 'lucide-react';
import type { TravelVoucher, ProcurementPhase } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardDescription,
  CardTitle,
} from '@/components/ui/card';
import { PhaseCard } from '@/components/phase-card';
import { updateTravelVoucher } from '@/lib/data';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { TravelVoucherSummaryDialog } from './travel-voucher-summary-dialog';
import { CompletionDialog } from './completion-dialog';

// Helper to parse the serialized travelVoucher object
const parseTravelVoucher = (serialized: any): TravelVoucher => {
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


export function TravelVoucherDetailView({ initialTravelVoucher }: { initialTravelVoucher: any }) {
  const [travelVoucher, setTravelVoucher] = useState<TravelVoucher>(() => parseTravelVoucher(initialTravelVoucher));
  const { toast } = useToast();
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [isCompletionDialogOpen, setIsCompletionDialogOpen] = useState(false);

  const handlePhaseUpdate = async (updatedPhase: ProcurementPhase) => {
    const isCompleted = !!updatedPhase.submittedBy && !!updatedPhase.receivedBy;
    const phaseWithCompletion = { ...updatedPhase, isCompleted };

    let finalStatus = travelVoucher.status;
    if (isCompleted) {
        finalStatus = 'completed';
    }

    const updatedVoucherData = { ...travelVoucher, phase: phaseWithCompletion, status: finalStatus };
    setTravelVoucher(updatedVoucherData);
    
    // Persist changes
    await updateTravelVoucher(travelVoucher.id, { phase: phaseWithCompletion, status: finalStatus });
    
    toast({ title: "Progress Saved", description: `${phaseWithCompletion.name} has been updated.` });

    if (isCompleted) {
        setIsCompletionDialogOpen(true);
    }
  };

  const handleViewSummary = (updatedPhase: ProcurementPhase) => {
    const updatedVoucherData = { ...travelVoucher, phase: updatedPhase };
    setTravelVoucher(updatedVoucherData);
    setIsSummaryOpen(true);
    updateTravelVoucher(travelVoucher.id, { phase: updatedPhase });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground shadow-md sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between gap-4 p-4">
          <div className="flex items-center gap-4">
            <Plane className="h-8 w-8" />
            <h1 className="text-2xl font-bold font-headline">ILCDB Travel Voucher System</h1>
          </div>
          <Button asChild variant="secondary">
            <Link href="/travel-voucher">
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
              <CardTitle className="text-2xl font-headline">{travelVoucher.activityTitle}</CardTitle>
              <CardDescription className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-2">
                <span>Amount: <span className="font-semibold text-foreground">{formatCurrency(travelVoucher.amount)}</span></span>
                {travelVoucher.projectType && <Badge variant="outline">{travelVoucher.projectType === 'OTHERS' ? travelVoucher.otherProjectType : travelVoucher.projectType}</Badge>}
                <Badge variant={travelVoucher.status === 'active' ? 'default' : 'secondary'} className="capitalize bg-accent text-accent-foreground">{travelVoucher.status}</Badge>
              </CardDescription>
            </CardHeader>
          </Card>
          
          <div className="mt-4">
            <PhaseCard
              phase={travelVoucher.phase}
              onUpdate={handlePhaseUpdate}
              onViewSummary={handleViewSummary}
            />
          </div>
        </div>
      </main>
       <TravelVoucherSummaryDialog travelVoucher={travelVoucher} open={isSummaryOpen} onOpenChange={setIsSummaryOpen} />
       <CompletionDialog
          open={isCompletionDialogOpen}
          onOpenChange={setIsCompletionDialogOpen}
          itemTitle={travelVoucher.activityTitle}
          returnPath="/travel-voucher"
          itemType="travel voucher process"
        />
    </div>
  );
}
