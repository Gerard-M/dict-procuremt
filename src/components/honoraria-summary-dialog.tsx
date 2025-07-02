'use client';

import React, { useRef } from 'react';
import { jsPDF } from 'jspdf';
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
import { Download, Loader2, Square, CheckSquare } from 'lucide-react';
import type { Honoraria, ProcurementPhase, Signature, ChecklistItem } from '@/lib/types';
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
            return <div className="p-2 h-full box-border"></div>;
        }
        return (
            <div className="p-2 text-left text-[9px] flex flex-col justify-between h-full box-border">
                <div>
                    <p>Name: <span className="font-semibold">{signature.name}</span></p>
                </div>
                <div className="flex-grow my-1">
                    <p className="mb-1">Signature:</p>
                    {signature.signatureDataUrl && (
                        <div className="h-10 flex items-center justify-center my-1">
                             <img src={signature.signatureDataUrl} alt="Signature" className="max-h-full max-w-full object-contain" />
                        </div>
                    )}
                </div>
                <div>
                    <p>Date: <span className="font-semibold">{signature.date ? format(new Date(signature.date), 'MM/dd/yyyy') : ''}</span></p>
                    <p>Remarks: <span className="font-semibold break-words">{signature.remarks}</span></p>
                </div>
            </div>
        );
    };
    
    const renderChecklist = (checklist: ChecklistItem[]) => {
        const checkedItems = checklist.filter(item => item.checked);

        if (checkedItems.length === 0) {
            return <p className="text-[10px] text-left text-muted-foreground">No items checked.</p>;
        }

        return (
            <ul className="space-y-1 text-[10px] text-left">
                {checkedItems.map(item => (
                    <li key={item.id} className="flex items-start gap-1.5">
                        <CheckSquare className="w-3 h-3 text-primary flex-shrink-0 mt-px" />
                        <span>{item.label}</span>
                    </li>
                ))}
            </ul>
        );
    }

    const { phase } = honoraria;

    return (
        <div ref={ref} className="bg-white text-black p-8 font-sans">
            <div className="w-[800px] mx-auto">
                 <header className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-primary">Honoraria Payment Summary</h1>
                    <p className="text-muted-foreground">Generated on {format(new Date(), 'PPP')}</p>
                 </header>

                <table className="w-full border-collapse border border-black text-sm mb-6">
                    <tbody>
                        <tr>
                            <td className="border border-black p-2 font-bold bg-gray-100" style={{width: '25%'}}>SPEAKER NAME</td>
                            <td className="border border-black p-2 font-semibold">{honoraria.speakerName}</td>
                        </tr>
                         <tr>
                            <td className="border border-black p-2 font-bold bg-gray-100">ACTIVITY / PROGRAM</td>
                            <td className="border border-black p-2 font-semibold">{honoraria.activityTitle}</td>
                        </tr>
                        <tr>
                            <td className="border border-black p-2 font-bold bg-gray-100">AMOUNT</td>
                            <td className="border border-black p-2 font-semibold">{formatCurrency(honoraria.amount)}</td>
                        </tr>
                    </tbody>
                </table>

                <h2 className="text-lg font-bold text-primary mb-2">Processing Details</h2>
                <table className="w-full border-collapse border border-black text-xs">
                     <thead>
                        <tr className="font-bold bg-gray-200 text-sm">
                            <td className="border border-black p-2 text-center" style={{width: '50%'}}>CHECKLIST (Completed Items)</td>
                            <td className="border border-black p-2 text-center" style={{width: '25%'}}>SUBMITTED BY</td>
                            <td className="border border-black p-2 text-center" style={{width: '25%'}}>RECEIVED BY</td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="border border-black p-2 align-top">{renderChecklist(phase.checklist)}</td>
                            <td className="border border-black p-0 align-top">{renderSignature(phase.submittedBy)}</td>
                            <td className="border border-black p-0 align-top">{renderSignature(phase.receivedBy)}</td>
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

  const handleDownloadPdf = async () => {
    const printArea = summaryRef.current;
    if (!printArea) return;

    setIsDownloading(true);

    try {
        const canvas = await html2canvas(printArea.querySelector('.w-\\[800px\\]') || printArea, {
            scale: 3,
            useCORS: true,
            backgroundColor: '#ffffff',
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'p',
            unit: 'px',
            format: [canvas.width, canvas.height]
        });
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
        pdf.save(`honoraria-summary-${honoraria.speakerName.replace(/\s/g, '_')}.pdf`);

    } catch (error) {
        console.error(`Error generating PDF:`, error);
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
            A complete overview of the process for {honoraria.speakerName}.
          </DialogDescription>
        </DialogHeader>
        
        <div className="max-h-[80vh] overflow-y-auto p-2 border rounded-md bg-muted">
            <div className="p-4 bg-gray-200">
                <PDFDocument ref={summaryRef} honoraria={honoraria} />
            </div>
        </div>
        
        <DialogFooter>
          <Button onClick={handleDownloadPdf} disabled={isDownloading}>
            {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            Download PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
