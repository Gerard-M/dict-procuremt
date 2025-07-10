
'use client';

import { useState, useEffect } from 'react';
import type { ProcurementPhase, ChecklistItem, Signature } from '@/lib/types';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { SignatureUpload } from '@/components/signature-upload';
import { Separator } from './ui/separator';
import { Check, Loader2, Lock, ChevronRight, Eye } from 'lucide-react';

export function PhaseCard({
  phase,
  onUpdate,
  disabled,
  onViewSummary,
}: {
  phase: ProcurementPhase;
  onUpdate: (updatedPhase: ProcurementPhase) => Promise<void>;
  disabled?: boolean;
  onViewSummary: (updatedPhase: ProcurementPhase) => void;
}) {
  const [currentPhase, setCurrentPhase] = useState<ProcurementPhase>(phase);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setCurrentPhase(phase);
  }, [phase]);

  const handleChecklistChange = (itemId: string, checked: boolean) => {
    const updatedChecklist = currentPhase.checklist.map((item) =>
      item.id === itemId ? { ...item, checked } : item
    );
    setCurrentPhase({ ...currentPhase, checklist: updatedChecklist });
  };

  const handleSignatureUpdate = (type: 'submittedBy' | 'receivedBy', signature: Signature | null) => {
    setCurrentPhase({ ...currentPhase, [type]: signature });
  };

  const handleSave = async () => {
    setIsSaving(true);
    await onUpdate(currentPhase);
    setIsSaving(false);
  };

  const handleViewSummaryClick = () => {
    onViewSummary(currentPhase);
  };
  
  const handleCheckAll = (checked: boolean) => {
    const updatedChecklist = currentPhase.checklist.map(item =>
        !item.isLocked ? { ...item, checked } : item
    );
    setCurrentPhase({ ...currentPhase, checklist: updatedChecklist });
  };

  const canContinue = !!currentPhase.submittedBy && !!currentPhase.receivedBy;

  const showCheckAll = [1, 4, 5, 6].includes(phase.id);
  const allItemsChecked = currentPhase.checklist.every(item => item.checked || item.isLocked);
  const someItemsChecked = currentPhase.checklist.some(item => item.checked);
  const checkAllState = allItemsChecked ? true : (someItemsChecked ? 'indeterminate' : false);


  if (disabled) {
    return (
      <Card className="shadow-lg">
        <CardContent className="flex flex-col items-center justify-center text-center py-20 bg-muted/50 rounded-lg">
          <Lock className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold">Phase Locked</h3>
          <p className="text-muted-foreground">Please complete the previous phase to unlock.</p>
        </CardContent>
      </Card>
    );
  }

  const getSubmittedByDescription = () => {
    if (phase.id === 2 || phase.id === 5) return 'Supply Unit';
    return undefined;
  };
  
  const getReceivedByDescription = () => {
      switch (phase.id) {
          case 1: return 'Supply Unit/Assigned Personnel';
          case 3: return 'Budget Unit';
          case 4: return 'Supply Unit';
          case 6: return 'Accounting Unit';
          default: return undefined;
      }
  };


  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-headline">{phase.name}</CardTitle>
          </div>
          {phase.isCompleted && (
            <div className="flex items-center gap-2 text-green-600 bg-green-100 p-2 rounded-md">
              <Check className="h-5 w-5" />
              <span className="font-semibold text-sm">Phase Completed</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        <div>
           <div className="flex justify-between items-center border-b pb-3 mb-3">
            <h3 className="text-lg font-semibold text-primary">Checklist</h3>
            {showCheckAll && (
              <div className="flex items-center space-x-2">
                <label
                  htmlFor={`${phase.id}-check-all`}
                  className="text-sm font-bold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Select All
                </label>
                <Checkbox
                  id={`${phase.id}-check-all`}
                  checked={checkAllState}
                  onCheckedChange={(checked) => handleCheckAll(!!checked)}
                  aria-label="Select all items"
                />
              </div>
            )}
          </div>
          <div className="space-y-3">
            {currentPhase.checklist.map((item: ChecklistItem) => {
              const isLocked = !!item.isLocked;
              
              return (
                <div key={item.id} className="flex items-center space-x-3">
                  <Checkbox
                    id={`${phase.id}-${item.id}`}
                    checked={item.checked}
                    onCheckedChange={(checked) => handleChecklistChange(item.id, !!checked)}
                    aria-label={item.label}
                    disabled={isLocked}
                  />
                  <label
                    htmlFor={`${phase.id}-${item.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {item.label}
                  </label>
                </div>
              );
            })}
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-semibold mb-4 text-primary">Signatures</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <SignatureUpload
              title="Submitted by"
              signature={currentPhase.submittedBy}
              onUpdate={(sig) => handleSignatureUpdate('submittedBy', sig)}
              description={getSubmittedByDescription()}
            />
            <SignatureUpload
              title="Received by"
              signature={currentPhase.receivedBy}
              onUpdate={(sig) => handleSignatureUpdate('receivedBy', sig)}
              description={getReceivedByDescription()}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <Button onClick={handleSave} disabled={!canContinue || isSaving}>
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ChevronRight className="mr-2 h-4 w-4" />}
          Continue to Next Phase
        </Button>
        <Button variant="outline" onClick={handleViewSummaryClick}>
          <Eye className="mr-2 h-4 w-4" />
          View Progress
        </Button>
      </CardFooter>
    </Card>
  );
}
