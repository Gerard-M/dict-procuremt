
'use client';

import { useRef, useEffect } from 'react';
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const lastPositionRef = useRef<{ x: number, y: number } | null>(null);

  const getSignatureObject = (): Signature => {
    return signature || {
      name: '',
      date: new Date(),
      remarks: '',
      signatureDataUrl: ''
    };
  };

  const handleFieldChange = (field: 'name' | 'remarks', value: string) => {
    const newSignature: Signature = {
        name: signature?.name || '',
        date: signature?.date || new Date(),
        remarks: signature?.remarks || '',
        signatureDataUrl: signature?.signatureDataUrl || '',
    };
    newSignature[field] = value;
    onUpdate(newSignature);
  };
  
  // Set up the canvas for drawing
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const stopDrawing = () => {
      if (!isDrawingRef.current) return;
      isDrawingRef.current = false;
      lastPositionRef.current = null;
      
      const canvas = canvasRef.current;
      if (canvas) {
          // This is a targeted fix for a stale closure bug.
          // The `stopDrawing` function is defined inside useEffect, and if the dependencies
          // are not perfect, it can hold onto a stale `signature` prop.
          // By reading directly from the DOM here, we ensure we always get the latest values
          // for name and remarks at the moment the user finishes drawing.
          const nameInput = document.getElementById(`name-${title}`) as HTMLInputElement | null;
          const remarksInput = document.getElementById(`remarks-${title}`) as HTMLTextAreaElement | null;

          const dataUrl = canvas.toDataURL('image/png');
          const newSignature: Signature = {
            name: nameInput?.value || '',
            date: new Date(),
            remarks: remarksInput?.value || '',
            signatureDataUrl: dataUrl,
          };
          onUpdate(newSignature);
      }
    };

    const resizeCanvas = () => {
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      canvas.width = canvas.offsetWidth * ratio;
      canvas.height = canvas.offsetHeight * ratio;
      const context = canvas.getContext('2d');
      if (context) {
        context.scale(ratio, ratio);
        context.lineCap = 'round';
        context.lineWidth = 2;
        context.strokeStyle = 'black';
        
        // Always clear the canvas first
        context.clearRect(0, 0, canvas.width, canvas.height);

        // If there is an existing signature, draw it on the canvas
        if (signature?.signatureDataUrl) {
          const img = new window.Image();
          img.src = signature.signatureDataUrl;
          img.onload = () => {
            // Check if component is still mounted before drawing
            if(canvasRef.current) {
                context.drawImage(img, 0, 0, canvas.offsetWidth, canvas.offsetHeight);
            }
          }
        }
      }
    }

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

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
      if (!isDrawingRef.current || !ctx) return;
      event.preventDefault();

      const currentPos = getEventPosition(event);
      if (currentPos && lastPositionRef.current) {
        ctx.beginPath();
        ctx.moveTo(lastPositionRef.current.x, lastPositionRef.current.y);
        ctx.lineTo(currentPos.x, currentPos.y);
        ctx.stroke();
        lastPositionRef.current = currentPos;
      }
    };

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', stopDrawing);

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
  }, [signature?.signatureDataUrl, title, onUpdate]);

  const handleClear = () => {
    onUpdate(null);
  }

  const handleClearPad = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        onUpdate({ ...getSignatureObject(), signatureDataUrl: '' });
      }
    }
  }

  return (
    <Card className={cn("relative", disabled && "opacity-50 pointer-events-none")}>
      <CardHeader>
        <CardTitle className="text-base flex justify-between items-center">{title}
          <Button variant="ghost" size="icon" onClick={handleClear} disabled={disabled} className="h-7 w-7">
            <X className="h-4 w-4" />
            <span className="sr-only">Clear Signature Block</span>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`name-${title}`}>Name</Label>
          <Input id={`name-${title}`} value={signature?.name || ''} onChange={(e) => handleFieldChange('name', e.target.value)} />
          {title === 'Received by' && (
            <p className="text-xs text-muted-foreground">Supply Unit/Assigned Personnel</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Date</Label>
          <div className="flex h-10 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {signature?.date ? format(new Date(signature.date), "PPP") : (signature?.name ? 'Processing...' : 'Awaiting input...')}
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
          <Textarea id={`remarks-${title}`} value={signature?.remarks || ''} onChange={(e) => handleFieldChange('remarks', e.target.value)} />
        </div>

      </CardContent>
    </Card>
  );
}
