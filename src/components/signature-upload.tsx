'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import SignaturePad = require('signature_pad');
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
import { Calendar as CalendarIcon, Eraser, Save, X } from 'lucide-react';
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

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const signaturePadRef = useRef<SignaturePad | null>(null);

  const isSaved = !!(signature && signature.signatureDataUrl);

  useEffect(() => {
    if (isSaved || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const signaturePad = new SignaturePad(canvas, {
        backgroundColor: 'rgb(255, 255, 255)',
        penColor: 'rgb(0, 0, 0)'
    });
    signaturePadRef.current = signaturePad;

    function resizeCanvas() {
      if (canvasRef.current) {
        const ratio = Math.max(window.devicePixelRatio || 1, 1);
        canvas.width = canvas.offsetWidth * ratio;
        canvas.height = canvas.offsetHeight * ratio;
        const ctx = canvas.getContext("2d");
        if (ctx) {
            ctx.scale(ratio, ratio);
        }
        signaturePad.clear();
      }
    }

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    return () => {
        window.removeEventListener("resize", resizeCanvas);
    };
  }, [isSaved]);


  const handleSave = () => {
    if(!name || !date) {
      alert("Please provide name and date.");
      return;
    }
    if (signaturePadRef.current?.isEmpty()) {
        alert("Please provide a signature.");
        return;
    }
    
    const dataUrl = signaturePadRef.current!.toDataURL('image/png');

    const newSignature: Signature = { name, date, remarks, signatureDataUrl: dataUrl };
    onUpdate(newSignature);
  };
  
  const handleClear = () => {
      onUpdate(null);
      setName('');
      setDate(undefined);
      setRemarks('');
  }
  
  const handleClearPad = () => {
      if (signaturePadRef.current) {
          signaturePadRef.current.clear();
      }
  }

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
            <Label>Signature</Label>
            <div className="relative w-full aspect-video bg-white rounded-md border">
              <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full rounded-md" />
            </div>
            <Button type="button" variant="outline" size="sm" onClick={handleClearPad}>
                <Eraser className="mr-2 h-4 w-4" />
                Clear
            </Button>
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
