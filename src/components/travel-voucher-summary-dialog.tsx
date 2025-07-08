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
import { Download, Loader2, CheckSquare } from 'lucide-react';
import type { TravelVoucher, Signature, ChecklistItem } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';

interface TravelVoucherSummaryDialogProps {
  travelVoucher: TravelVoucher;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PDFDocument = React.forwardRef<HTMLDivElement, { travelVoucher: TravelVoucher }>(({ travelVoucher }, ref) => {
    
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
                        <div className="h-12 flex items-center justify-center my-1">
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
            return <p className="text-sm text-left text-muted-foreground p-2">No items checked.</p>;
        }

        return (
            <ul className="space-y-1.5 text-sm text-left">
                {checkedItems.map(item => (
                    <li key={item.id} className="flex items-start gap-1.5">
                        <CheckSquare className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-px" />
                        <span>{item.label}</span>
                    </li>
                ))}
            </ul>
        );
    }

    const { phase } = travelVoucher;

    return (
        <div ref={ref} className="bg-white text-black p-8 font-sans">
            <div className="w-[800px] mx-auto">
                 <header className="text-center mb-8">
                    <h1 className="text-xl font-bold text-primary">Travel Voucher Summary</h1>
                    <p className="text-sm text-muted-foreground mt-1">Generated on {format(new Date(), 'PPP')}</p>
                 </header>

                <table className="w-full border-collapse border border-black text-sm mb-6">
                    <tbody>
                         <tr>
                            <td className="border border-black p-2 font-bold bg-gray-100" style={{width: '30%'}}>ACTIVITY / PROGRAM</td>
                            <td className="border border-black p-2 font-semibold">{travelVoucher.activityTitle}</td>
                        </tr>
                        <tr>
                            <td className="border border-black p-2 font-bold bg-gray-100">AMOUNT</td>
                            <td className="border border-black p-2 font-semibold">{formatCurrency(travelVoucher.amount)}</td>
                        </tr>
                    </tbody>
                </table>

                <h2 className="text-lg font-bold text-primary mb-4">Processing Details</h2>
                <table className="w-full border-collapse border border-black text-sm">
                     <thead>
                        <tr className="font-bold bg-gray-200">
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

export function TravelVoucherSummaryDialog({ travelVoucher, open, onOpenChange }: TravelVoucherSummaryDialogProps) {
  const summaryRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = React.useState(false);

  const handleDownloadPdf = async () => {
    const printArea = summaryRef.current;
    if (!printArea) return;

    setIsDownloading(true);

    try {
        const canvas = await html2canvas(printArea.querySelector('.w-\\[800px\\]') || printArea, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff',
        });

        const imgData = canvas.toDataURL('image/png');
        
        // A4 page size in mm: 210 x 297
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const page_width = pdf.internal.pageSize.getWidth();
        const margin = 15; // 15mm margin
        const content_width = page_width - (margin * 2);

        const img_width = canvas.width;
        const img_height = canvas.height;
        const aspect_ratio = img_height / img_width;

        const content_height = content_width * aspect_ratio;
        
        pdf.addImage(imgData, 'PNG', margin, margin, content_width, content_height, undefined, 'FAST');
        pdf.save(`travel-voucher-summary-${travelVoucher.activityTitle.replace(/\s/g, '_')}.pdf`);

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
          <DialogTitle>Travel Voucher Process Summary</DialogTitle>
          <DialogDescription>
            A complete overview of the process for "{travelVoucher.activityTitle}".
          </DialogDescription>
        </DialogHeader>
        
        <div className="max-h-[80vh] overflow-y-auto p-2 border rounded-md bg-muted">
            <div className="p-4 bg-gray-200">
                <PDFDocument ref={summaryRef} travelVoucher={travelVoucher} />
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
