
'use client';

import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import type { Honoraria, Signature, ChecklistItem } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';

interface HonorariaSummaryDialogProps {
  honoraria: Honoraria;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PDFDocument = React.forwardRef<HTMLDivElement, { honoraria: Honoraria }>(({ honoraria }, ref) => {
    
    const renderSignature = (signature: Signature | null) => {
        if (!signature || !signature.name) {
            return <div style={{ height: '100%', boxSizing: 'border-box' }}></div>;
        }
        return (
            <div style={{ padding: '4px', fontSize: '9px', textAlign: 'left', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', boxSizing: 'border-box' }}>
                <div style={{ wordWrap: 'break-word' }}>
                    <span>Name: </span>
                    <span style={{ fontWeight: '600' }}>{signature.name}</span>
                </div>
                <div style={{ flexGrow: 1, margin: '4px 0', display: 'flex', flexDirection: 'column' }}>
                    <span style={{ marginBottom: '2px' }}>Signature:</span>
                    {signature.signatureDataUrl && (
                        <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                             <img src={signature.signatureDataUrl} alt="Signature" style={{ maxHeight: '35px', maxWidth: '100%', objectFit: 'contain' }} />
                        </div>
                    )}
                </div>
                <div>
                    <p style={{ margin: '0' }}>
                        <span>Date: </span>
                        <span style={{ fontWeight: '600' }}>{signature.date ? format(new Date(signature.date), 'MM/dd/yyyy') : ''}</span>
                    </p>
                    <p style={{ margin: '0', wordWrap: 'break-word' }}>
                        <span>Remarks: </span>
                        <span style={{ fontWeight: '600' }}>{signature.remarks}</span>
                    </p>
                </div>
            </div>
        );
    };
    
    const renderChecklist = (checklist: ChecklistItem[]) => {
        const checkedItems = checklist.filter(item => item.checked);

        if (checkedItems.length === 0) {
            return <p style={{ fontSize: '10px', textAlign: 'left', color: '#666', padding: '8px' }}>No items checked.</p>;
        }

        return (
             <div style={{ fontSize: '10px', textAlign: 'left', padding: '4px' }}>
                {checkedItems.map(item => (
                    <div key={item.id} style={{ padding: '2px 0', display: 'flex', alignItems: 'start', gap: '4px' }}>
                        <span style={{flexShrink: 0}}>☑</span>
                        <span>{item.label}</span>
                    </div>
                ))}
            </div>
        );
    }

    const { phase } = honoraria;

    return (
        <div ref={ref} style={{ backgroundColor: 'white', color: 'black', fontFamily: 'sans-serif', width: '8.27in', height: '11.69in', padding: '0.25in', boxSizing: 'border-box' }}>
            <div style={{ margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', height: '100%' }}>
                 <header style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1A237E', margin: 0 }}>Honoraria Payment Summary</h1>
                    <p style={{ fontSize: '12px', color: '#666', marginTop: '4px', margin: 0 }}>Generated on {format(new Date(), 'PPP')}</p>
                 </header>

                <table style={{ width: '95%', margin: '0 auto', borderCollapse: 'collapse', border: '1px solid black', fontSize: '12px', marginBottom: '24px' }}>
                    <tbody>
                         <tr>
                            <td style={{ border: '1px solid black', padding: '8px', fontWeight: 'bold', backgroundColor: '#F5F5F5', width: '30%' }}>ACTIVITY / PROGRAM</td>
                            <td style={{ border: '1px solid black', padding: '8px', fontWeight: '600' }}>{honoraria.activityTitle}</td>
                        </tr>
                        <tr>
                            <td style={{ border: '1px solid black', padding: '8px', fontWeight: 'bold', backgroundColor: '#F5F5F5' }}>AMOUNT</td>
                            <td style={{ border: '1px solid black', padding: '8px', fontWeight: '600' }}>{formatCurrency(honoraria.amount)}</td>
                        </tr>
                    </tbody>
                </table>

                <h2 style={{ width: '95%', margin: '0 auto 16px auto', fontSize: '16px', fontWeight: 'bold', color: '#1A237E' }}>Processing Details</h2>
                <table style={{ width: '95%', margin: '0 auto', borderCollapse: 'collapse', border: '1px solid black', fontSize: '12px', tableLayout: 'fixed' }}>
                     <thead>
                        <tr style={{ fontWeight: 'bold', backgroundColor: '#E0E0E0' }}>
                            <td style={{ border: '1px solid black', padding: '6px', textAlign: 'center', fontSize: '11px', width: '50%' }}>CHECKLIST (Completed Items)</td>
                            <td style={{ border: '1px solid black', padding: '6px', textAlign: 'center', fontSize: '11px', width: '25%' }}>SUBMITTED BY</td>
                            <td style={{ border: '1px solid black', padding: '6px', textAlign: 'center', fontSize: '11px', width: '25%' }}>RECEIVED BY</td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style={{ border: '1px solid black', padding: '0', verticalAlign: 'top' }}>{renderChecklist(phase.checklist)}</td>
                            <td style={{ border: '1px solid black', padding: '0', verticalAlign: 'top' }}>{renderSignature(phase.submittedBy)}</td>
                            <td style={{ border: '1px solid black', padding: '0', verticalAlign: 'top' }}>{renderSignature(phase.receivedBy)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
});

PDFDocument.displayName = 'PDFDocument';

export function HonorariaSummaryDialog({ honoraria, open, onOpenChange }: HonorariaSummaryDialogProps) {
  const summaryRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = React.useState(false);

  const handleDownloadPng = async () => {
    const printArea = summaryRef.current;
    if (!printArea) return;

    setIsDownloading(true);

    try {
        const canvas = await html2canvas(printArea, {
            scale: 3,
            useCORS: true,
            backgroundColor: '#ffffff',
        });

        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `honoraria-summary-${honoraria.activityTitle.replace(/\s/g, '_')}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
    } catch (error) {
        console.error(`Error generating PNG:`, error);
    } finally {
        setIsDownloading(false);
    }
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Honoraria Process Summary</DialogTitle>
          <DialogDescription>
            A complete overview of the process for "{honoraria.activityTitle}".
          </DialogDescription>
        </DialogHeader>
        
        <div className="max-h-[80vh] overflow-y-auto p-2 border rounded-md bg-muted">
            <div className="bg-white">
                <PDFDocument ref={summaryRef} honoraria={honoraria} />
            </div>
        </div>
        
        <DialogFooter>
          <Button onClick={handleDownloadPng} disabled={isDownloading}>
            {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            Download PNG
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
