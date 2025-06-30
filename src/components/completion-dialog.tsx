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

  const handleBackToDashboard = () => {
    // Use a timeout to allow the dialog to close gracefully before navigating
    setTimeout(() => {
        router.push('/');
    }, 150);
  };
  
  const handleOpenChange = (isOpen: boolean) => {
      onOpenChange(isOpen);
      if(!isOpen) {
        handleBackToDashboard();
      }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
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
          <Button onClick={() => onOpenChange(false)} className="w-full">
            Return to Dashboard
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
