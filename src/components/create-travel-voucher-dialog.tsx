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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { addTravelVoucher, updateTravelVoucher } from '@/lib/data';
import { getNewTravelVoucherPhase } from '@/lib/constants';
import type { TravelVoucher, ProjectType } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from 'lucide-react';

const projectTypes: ProjectType[] = ['ILCDB-DWIA', 'SPARK', 'TECH4ED-DTC', 'PROJECT CLICK', 'OTHERS'];

const voucherSchema = z.object({
  activityTitle: z.string().min(1, "Activity title is required"),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  projectType: z.enum(projectTypes),
  otherProjectType: z.string().optional(),
}).refine(data => {
  if (data.projectType === 'OTHERS') {
    return !!data.otherProjectType && data.otherProjectType.length > 0;
  }
  return true;
}, {
  message: "Please specify the project type",
  path: ["otherProjectType"],
});

type FormData = z.infer<typeof voucherSchema>;

interface CreateTravelVoucherDialogProps {
  onVoucherCreated: (voucher: TravelVoucher) => void;
  onVoucherUpdated: (voucher: TravelVoucher) => void;
  voucherToEdit?: TravelVoucher | null;
  children: React.ReactNode;
  onOpenChange?: (open: boolean) => void;
}

export function CreateTravelVoucherDialog({ onVoucherCreated, onVoucherUpdated, voucherToEdit, children, onOpenChange }: CreateTravelVoucherDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const isEditMode = !!voucherToEdit;

  const form = useForm<FormData>({
    resolver: zodResolver(voucherSchema),
    defaultValues: {
      activityTitle: "",
      amount: 0,
      projectType: "ILCDB-DWIA",
      otherProjectType: ""
    }
  });
  
  const selectedProjectType = form.watch('projectType');

  useEffect(() => {
    if (voucherToEdit) {
      form.reset({
        activityTitle: voucherToEdit.activityTitle,
        amount: voucherToEdit.amount,
        projectType: voucherToEdit.projectType,
        otherProjectType: voucherToEdit.otherProjectType || '',
      });
      setOpen(true);
    } else {
      form.reset({
        activityTitle: "",
        amount: 0,
        projectType: "ILCDB-DWIA",
        otherProjectType: ""
      });
    }
  }, [voucherToEdit, form]);

  async function onSubmit(values: FormData) {
    setIsSubmitting(true);
    try {
      if (isEditMode && voucherToEdit) {
        const updatedVoucher = await updateTravelVoucher(voucherToEdit.id, values);
        if(updatedVoucher) onVoucherUpdated(updatedVoucher);
        toast({ title: "Success!", description: "Travel voucher record has been updated." });
      } else {
        const newVoucherData: Omit<TravelVoucher, 'id' | 'createdAt' | 'updatedAt'> = {
          ...values,
          status: 'active',
          phase: getNewTravelVoucherPhase(),
        };
        const newVoucher = await addTravelVoucher(newVoucherData);
        onVoucherCreated(newVoucher);
        toast({ title: "Success!", description: "New travel voucher record has been created." });
      }
      
      setOpen(false);
      form.reset();
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: `Failed to ${isEditMode ? 'update' : 'create'} travel voucher record.`, variant: 'destructive' });
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
          <DialogTitle>{isEditMode ? 'Edit' : 'Create New'} Travel Voucher Record</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Update the details for this travel voucher record.' : 'Fill in the details below to start a new travel voucher record.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField name="activityTitle" control={form.control} render={({ field }) => (
              <FormItem><FormLabel>Activity/Program Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField name="amount" control={form.control} render={({ field }) => (
              <FormItem><FormLabel>Amount</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField name="projectType" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Project Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    {projectTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            {selectedProjectType === 'OTHERS' && (
              <FormField name="otherProjectType" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Specify Other Project Type</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            )}
            
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
