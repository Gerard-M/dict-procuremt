'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PartyPopper } from 'lucide-react';

interface CompletionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  procurementTitle: string;
}

export function CompletionDialog({ open, onOpenChange, procurementTitle }: CompletionDialogProps) {
  const router = useRouter();

  const handleReturnToDashboard = () => {
    // Navigating to the new page will automatically unmount this component
    // and its parent, so we don't need to manually close the dialog first.
    router.push('/');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 mb-4">
            <PartyPopper className="h-12 w-12 text-green-600" />
          </div>
          <DialogTitle className="text-center text-2xl font-bold">Congratulations!</DialogTitle>
          <DialogDescription className="text-center px-4">
            You have successfully completed the procurement process for "{procurementTitle}". This record has now been archived.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button onClick={handleReturnToDashboard} className="w-full">
            Return to Dashboard
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
