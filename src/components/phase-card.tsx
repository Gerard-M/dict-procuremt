'use client';

import { useState } from 'react';
import type { ProcurementPhase, ChecklistItem, Signature } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { SignatureUpload } from '@/components/signature-upload';
import { Separator } from './ui/separator';
import { Check, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

export function PhaseCard({ phase, onUpdate }: { phase: ProcurementPhase; onUpdate: (updatedPhase: ProcurementPhase) => Promise<void> }) {
  const [currentPhase, setCurrentPhase] = useState<ProcurementPhase>(phase);
  const [isSaving, setIsSaving] = useState(false);

  const handleChecklistChange = (itemId: string, checked: boolean) => {
    const updatedChecklist = currentPhase.checklist.map(item =>
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
  
  const allItemsChecked = currentPhase.checklist.every(item => item.checked);

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="text-xl font-headline">{phase.name}</CardTitle>
                <CardDescription>Responsible Unit: {phase.unit}</CardDescription>
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
          <h3 className="text-lg font-semibold mb-4 text-primary">Checklist</h3>
          <div className="space-y-3">
            {currentPhase.checklist.map((item: ChecklistItem) => (
              <div key={item.id} className="flex items-center space-x-3">
                <Checkbox
                  id={`${phase.id}-${item.id}`}
                  checked={item.checked}
                  onCheckedChange={(checked) => handleChecklistChange(item.id, !!checked)}
                  aria-label={item.label}
                />
                <label
                  htmlFor={`${phase.id}-${item.id}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {item.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        <div>
            <h3 className="text-lg font-semibold mb-4 text-primary">Signatures</h3>
            {!allItemsChecked && (
                 <Alert variant="default" className="mb-4 bg-blue-50 border-blue-200">
                    <AlertDescription>
                    Please complete all checklist items before adding signatures.
                    </AlertDescription>
                </Alert>
            )}
            <div className="grid md:grid-cols-2 gap-8">
                <SignatureUpload
                    title="Submitted by"
                    signature={currentPhase.submittedBy}
                    onUpdate={(sig) => handleSignatureUpdate('submittedBy', sig)}
                    disabled={!allItemsChecked}
                />
                <SignatureUpload
                    title="Received by"
                    signature={currentPhase.receivedBy}
                    onUpdate={(sig) => handleSignatureUpdate('receivedBy', sig)}
                    disabled={!allItemsChecked}
                />
            </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
            Save Phase Progress
        </Button>
      </CardFooter>
    </Card>
  );
}
