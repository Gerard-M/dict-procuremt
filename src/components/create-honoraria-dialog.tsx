'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { addHonoraria, updateHonoraria } from '@/lib/data';
import { getNewHonorariaPhase } from '@/lib/constants';
import type { Honoraria } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from 'lucide-react';

const honorariaSchema = z.object({
  speakerName: z.string().min(1, "Speaker name is required"),
  activityTitle: z.string().min(1, "Activity title is required"),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
});

type FormData = z.infer<typeof honorariaSchema>;

interface CreateHonorariaDialogProps {
  onHonorariaCreated: (honoraria: Honoraria) => void;
  onHonorariaUpdated: (honoraria: Honoraria) => void;
  honorariaToEdit?: Honoraria | null;
  children: React.ReactNode;
  onOpenChange?: (open: boolean) => void;
}

export function CreateHonorariaDialog({ onHonorariaCreated, onHonorariaUpdated, honorariaToEdit, children, onOpenChange }: CreateHonorariaDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const isEditMode = !!honorariaToEdit;

  const form = useForm<FormData>({
    resolver: zodResolver(honorariaSchema),
  });

  useEffect(() => {
    if (honorariaToEdit) {
      form.reset({
        speakerName: honorariaToEdit.speakerName,
        activityTitle: honorariaToEdit.activityTitle,
        amount: honorariaToEdit.amount,
      });
      setOpen(true);
    } else {
      form.reset({
        speakerName: "",
        activityTitle: "",
        amount: 0,
      });
    }
  }, [honorariaToEdit, form]);

  async function onSubmit(values: FormData) {
    setIsSubmitting(true);
    try {
      if (isEditMode && honorariaToEdit) {
        const updatedHonoraria = await updateHonoraria(honorariaToEdit.id, values);
        if(updatedHonoraria) onHonorariaUpdated(updatedHonoraria);
        toast({ title: "Success!", description: "Honoraria record has been updated." });
      } else {
        const newHonorariaData: Omit<Honoraria, 'id' | 'createdAt' | 'updatedAt'> = {
          ...values,
          status: 'active',
          phase: getNewHonorariaPhase(),
        };
        const newHonoraria = await addHonoraria(newHonorariaData);
        onHonorariaCreated(newHonoraria);
        toast({ title: "Success!", description: "New honoraria record has been created." });
      }
      
      setOpen(false);
      form.reset();
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: `Failed to ${isEditMode ? 'update' : 'create'} honoraria record.`, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    onOpenChange?.(isOpen);
    if (!isOpen) {
        form.reset();
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit' : 'Create New'} Honoraria Record</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Update the details for this honoraria record.' : 'Fill in the details below to start a new honoraria record.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField name="speakerName" control={form.control} render={({ field }) => (
              <FormItem><FormLabel>Speaker Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField name="activityTitle" control={form.control} render={({ field }) => (
              <FormItem><FormLabel>Activity/Program Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField name="amount" control={form.control} render={({ field }) => (
              <FormItem><FormLabel>Amount</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditMode ? 'Save Changes' : 'Create Record'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
