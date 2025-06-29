'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Calendar as CalendarIcon, UploadCloud, X, Save } from 'lucide-react';
import { format } from 'date-fns';
import type { Signature } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface SignatureUploadProps {
  title: string;
  signature: Signature | null;
  onUpdate: (signature: Signature | null) => void;
  disabled?: boolean;
}

export function SignatureUpload({ title, signature, onUpdate, disabled = false }: SignatureUploadProps) {
  const [name, setName] = useState(signature?.name || '');
  const [date, setDate] = useState<Date | undefined>(signature?.date || undefined);
  const [remarks, setRemarks] = useState(signature?.remarks || '');
  const [signatureDataUrl, setSignatureDataUrl] = useState(signature?.signatureDataUrl || '');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSignatureDataUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSave = () => {
    if(!name || !date || !signatureDataUrl) {
      // Basic validation feedback
      alert("Please provide name, date, and signature image.");
      return;
    }
    const newSignature: Signature = { name, date, remarks, signatureDataUrl };
    onUpdate(newSignature);
  };
  
  const handleClear = () => {
      onUpdate(null);
      setName('');
      setDate(undefined);
      setRemarks('');
      setSignatureDataUrl('');
  }

  const isSaved = signature && signature.signatureDataUrl === signatureDataUrl && signature.name === name;

  if(isSaved) {
      return (
        <Card className={cn("bg-slate-50", disabled && "opacity-50")}>
            <CardHeader>
                <CardTitle className="text-base flex justify-between items-center">{title}
                    <Button variant="ghost" size="icon" onClick={handleClear} disabled={disabled} className="h-7 w-7">
                        <X className="h-4 w-4" />
                    </Button>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
                <Image src={signature.signatureDataUrl} alt="Signature" width={200} height={100} className="border rounded-md bg-white" data-ai-hint="signature drawing" />
                <p><strong>Name:</strong> {signature.name}</p>
                <p><strong>Date:</strong> {signature.date ? format(signature.date, 'PPP') : 'N/A'}</p>
                {signature.remarks && <p><strong>Remarks:</strong> {signature.remarks}</p>}
            </CardContent>
        </Card>
      )
  }

  return (
    <Card className={cn(disabled && "opacity-50 pointer-events-none")}>
        <CardHeader>
            <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`name-${title}`}>Name</Label>
          <Input id={`name-${title}`} value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="space-y-2">
            <Label htmlFor={`date-${title}`}>Date</Label>
            <Popover>
                <PopoverTrigger asChild>
                <Button
                    id={`date-${title}`}
                    variant={"outline"}
                    className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                    />
                </PopoverContent>
            </Popover>
        </div>

        <div className="space-y-2">
            <Label>Signature Image</Label>
            {signatureDataUrl ? (
                <div className="relative w-fit">
                    <Image src={signatureDataUrl} alt="Signature Preview" width={200} height={100} className="border rounded-md bg-white" data-ai-hint="signature drawing"/>
                    <Button variant="ghost" size="icon" className="absolute -top-2 -right-2 bg-background rounded-full h-7 w-7" onClick={() => setSignatureDataUrl('')}><X className="h-4 w-4" /></Button>
                </div>
            ) : (
                <div className="relative border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center">
                    <UploadCloud className="h-8 w-8 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">Upload signature</p>
                    <Input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                </div>
            )}
        </div>

        <div className="space-y-2">
            <Label htmlFor={`remarks-${title}`}>Remarks (Optional)</Label>
            <Textarea id={`remarks-${title}`} value={remarks} onChange={(e) => setRemarks(e.target.value)} />
        </div>
        
        <Button onClick={handleSave} className="w-full" size="sm">
            <Save className="mr-2 h-4 w-4" />
            Save Signature
        </Button>
      </CardContent>
    </Card>
  );
}
