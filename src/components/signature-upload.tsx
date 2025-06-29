'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Calendar as CalendarIcon, Eraser, X } from 'lucide-react';
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
  const [date, setDate] = useState<Date | undefined>(signature?.date);
  const [remarks, setRemarks] = useState(signature?.remarks || '');
  const [hasDrawing, setHasDrawing] = useState(!!signature?.signatureDataUrl);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const lastPositionRef = useRef<{ x: number, y: number } | null>(null);
  
  const isSaved = !!(signature && signature.signatureDataUrl);

  // Set date to current date on mount if not already set
  useEffect(() => {
    if (!date) {
      setDate(new Date());
    }
  }, []); // Run only once

  // Auto-save effect
  useEffect(() => {
    // Only attempt to save if it's not already saved.
    // The user must provide a name and draw something.
    if (!isSaved && name && date && hasDrawing && canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      const newSignature: Signature = { name, date, remarks, signatureDataUrl: dataUrl };
      onUpdate(newSignature);
    }
  }, [name, date, hasDrawing, remarks, onUpdate, isSaved]);


  useEffect(() => {
    if (isSaved || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
        const ratio = Math.max(window.devicePixelRatio || 1, 1);
        canvas.width = canvas.offsetWidth * ratio;
        canvas.height = canvas.offsetHeight * ratio;
        const context = canvas.getContext('2d');
        if(context){
            context.scale(ratio, ratio);
            context.lineCap = 'round';
            context.lineWidth = 2;
            context.strokeStyle = 'black';
        }
    }
    
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    const getEventPosition = (event: MouseEvent | TouchEvent) => {
        const rect = canvas.getBoundingClientRect();
        if (event instanceof MouseEvent) {
            return { x: event.clientX - rect.left, y: event.clientY - rect.top };
        }
        if (event.touches && event.touches[0]) {
             return { x: event.touches[0].clientX - rect.left, y: event.touches[0].clientY - rect.top };
        }
        return null;
    }

    const startDrawing = (event: MouseEvent | TouchEvent) => {
        event.preventDefault();
        isDrawingRef.current = true;
        const pos = getEventPosition(event);
        lastPositionRef.current = pos;
    };
    
    const draw = (event: MouseEvent | TouchEvent) => {
        if (!isDrawingRef.current) return;
        event.preventDefault();

        const currentPos = getEventPosition(event);
        if (currentPos && lastPositionRef.current) {
            ctx.beginPath();
            ctx.moveTo(lastPositionRef.current.x, lastPositionRef.current.y);
            ctx.lineTo(currentPos.x, currentPos.y);
            ctx.stroke();
            setHasDrawing(true);
        }
    };

    const stopDrawing = () => {
        isDrawingRef.current = false;
        lastPositionRef.current = null;
    };
    
    // Mouse events
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', stopDrawing);
    
    // Touch events
    canvas.addEventListener('touchstart', startDrawing, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    canvas.addEventListener('touchend', stopDrawing);

    return () => {
        window.removeEventListener("resize", resizeCanvas);
        canvas.removeEventListener('mousedown', startDrawing);
        canvas.removeEventListener('mousemove', draw);
        canvas.removeEventListener('mouseup', stopDrawing);
        canvas.removeEventListener('mouseleave', stopDrawing);
        
        canvas.removeEventListener('touchstart', startDrawing);
        canvas.removeEventListener('touchmove', draw);
        canvas.removeEventListener('touchend', stopDrawing);
    };
  }, [isSaved]);

  const handleClear = () => {
      onUpdate(null);
      setName('');
      setDate(new Date()); // Reset to current date on clear
      setRemarks('');
      setHasDrawing(false);
  }
  
  const handleClearPad = () => {
    const canvas = canvasRef.current;
    if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            setHasDrawing(false);
        }
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
            <Label>Date</Label>
            <div className="flex h-10 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Loading date...</span>}
            </div>
        </div>

        <div className="space-y-2">
            <Label>Signature</Label>
            <div className="relative w-full aspect-video bg-white rounded-md border touch-none">
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
        
      </CardContent>
    </Card>
  );
}
