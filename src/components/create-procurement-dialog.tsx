'use client';

import React, { useState } from 'react';
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
import { addProcurement, getExistingPrNumbers } from '@/lib/data';
import { getNewProcurementPhases } from '@/lib/constants';
import type { Procurement, ProjectType } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { correctPrNumber } from '@/ai/flows/correct-pr-number';
import { Lightbulb, Loader2, PlusCircle } from 'lucide-react';

const projectTypes: ProjectType[] = ['ILCDB-DWIA', 'SPARK', 'TECH4ED-DTC', 'PROJECT CLICK', 'OTHERS'];

const procurementSchema = z.object({
  title: z.string().min(1, "Title is required"),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  prNumber: z.string().min(1, "PR Number is required"),
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

export function CreateProcurementDialog({ onProcurementCreated }: { onProcurementCreated: (procurement: Procurement) => void }) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [correctionSuggestion, setCorrectionSuggestion] = useState<string | null>(null);
  const [isCheckingPr, setIsCheckingPr] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof procurementSchema>>({
    resolver: zodResolver(procurementSchema),
    defaultValues: {
      title: "",
      amount: 0,
      prNumber: "",
      projectType: "ILCDB-DWIA",
      otherProjectType: "",
    },
  });

  const selectedProjectType = form.watch('projectType');

  const handlePrNumberBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const prNumber = e.target.value;
    setCorrectionSuggestion(null);
    const prNumberRegex = /^\d{4}-\d{2}-\d{2}$/;

    if (!prNumberRegex.test(prNumber) && prNumber.length > 0) {
      setIsCheckingPr(true);
      try {
        const existingPrNumbers = await getExistingPrNumbers();
        const result = await correctPrNumber({ prNumber, existingPrNumbers });
        if (result.confidence > 0.7 && result.correctedPrNumber !== prNumber) {
          setCorrectionSuggestion(result.correctedPrNumber);
        }
      } catch (error) {
        console.error("Failed to correct PR number:", error);
        toast({ title: "AI Error", description: "Could not suggest a PR number correction.", variant: 'destructive' });
      } finally {
        setIsCheckingPr(false);
      }
    }
  };

  async function onSubmit(values: z.infer<typeof procurementSchema>) {
    setIsSubmitting(true);
    try {
        const existingPrNumbers = await getExistingPrNumbers();
        if (existingPrNumbers.includes(values.prNumber)) {
            form.setError("prNumber", { type: "manual", message: "This PR Number already exists." });
            setIsSubmitting(false);
            return;
        }

      const newProcurementData: Omit<Procurement, 'id' | 'createdAt' | 'updatedAt'> = {
        ...values,
        status: 'active',
        phases: getNewProcurementPhases(),
      };
      const newProcurement = await addProcurement(newProcurementData);
      onProcurementCreated(newProcurement);
      toast({ title: "Success!", description: "New procurement record has been created." });
      setOpen(false);
      form.reset();
    } catch (error) {
      toast({ title: "Error", description: "Failed to create procurement.", variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create New
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Procurement</DialogTitle>
          <DialogDescription>
            Fill in the details below to start a new procurement process.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField name="title" control={form.control} render={({ field }) => (
              <FormItem><FormLabel>Activity/Procurement Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField name="amount" control={form.control} render={({ field }) => (
              <FormItem><FormLabel>Amount</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField name="prNumber" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>PR Number</FormLabel>
                <div className="relative">
                  <FormControl><Input placeholder="YYYY-NN-NN" {...field} onBlur={handlePrNumberBlur} /></FormControl>
                  {isCheckingPr && <Loader2 className="animate-spin absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />}
                </div>
                 {correctionSuggestion && (
                    <div className="text-sm bg-accent/20 p-2 rounded-md flex items-center gap-2 mt-2">
                        <Lightbulb className="h-4 w-4 text-accent-foreground/80" />
                        <span className="text-muted-foreground">Did you mean:</span>
                        <Button
                            type="button"
                            variant="link"
                            className="p-0 h-auto"
                            onClick={() => {
                                form.setValue('prNumber', correctionSuggestion, { shouldValidate: true });
                                setCorrectionSuggestion(null);
                            }}
                        >
                            {correctionSuggestion}
                        </Button>?
                    </div>
                )}
                <FormMessage />
              </FormItem>
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
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Procurement
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
