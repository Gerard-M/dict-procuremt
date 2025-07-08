
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
import { Download, Loader2 } from 'lucide-react';
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

    const { phase } = travelVoucher;

    return (
        <div ref={ref} style={{ backgroundColor: 'white', color: 'black', padding: '32px', fontFamily: 'sans-serif' }}>
            <div style={{ width: '800px', margin: '0 auto' }}>
                 <header style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1A237E', margin: 0 }}>Travel Voucher Summary</h1>
                    <p style={{ fontSize: '12px', color: '#666', marginTop: '4px', margin: 0 }}>Generated on {format(new Date(), 'PPP')}</p>
                 </header>

                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid black', fontSize: '12px', marginBottom: '24px' }}>
                    <tbody>
                         <tr>
                            <td style={{ border: '1px solid black', padding: '8px', fontWeight: 'bold', backgroundColor: '#F5F5F5', width: '30%' }}>ACTIVITY / PROGRAM</td>
                            <td style={{ border: '1px solid black', padding: '8px', fontWeight: '600' }}>{travelVoucher.activityTitle}</td>
                        </tr>
                        <tr>
                            <td style={{ border: '1px solid black', padding: '8px', fontWeight: 'bold', backgroundColor: '#F5F5F5' }}>AMOUNT</td>
                            <td style={{ border: '1px solid black', padding: '8px', fontWeight: '600' }}>{formatCurrency(travelVoucher.amount)}</td>
                        </tr>
                    </tbody>
                </table>

                <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1A237E', marginBottom: '16px' }}>Processing Details</h2>
                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid black', fontSize: '12px', tableLayout: 'fixed' }}>
                     <thead>
                        <tr style={{ fontWeight: 'bold', backgroundColor: '#E0E0E0' }}>
                            <td style={{ border: '1px solid black', padding: '8px', textAlign: 'center', width: '50%' }}>CHECKLIST (Completed Items)</td>
                            <td style={{ border: '1px solid black', padding: '8px', textAlign: 'center', width: '25%' }}>SUBMITTED BY</td>
                            <td style={{ border: '1px solid black', padding: '8px', textAlign: 'center', width: '25%' }}>RECEIVED BY</td>
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

export function TravelVoucherSummaryDialog({ travelVoucher, open, onOpenChange }: TravelVoucherSummaryDialogProps) {
  const summaryRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = React.useState(false);

  const handleDownloadPdf = async () => {
    const printArea = summaryRef.current;
    if (!printArea) return;

    setIsDownloading(true);

    try {
        const canvas = await html2canvas(printArea.querySelector('div[style*="width: 800px"]') || printArea, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff',
        });

        const imgData = canvas.toDataURL('image/png');
        
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const page_width = pdf.internal.pageSize.getWidth();
        const page_height = pdf.internal.pageSize.getHeight();

        const margin = 10;
        let content_width = page_width - (margin * 2);

        const img_width = canvas.width;
        const img_height = canvas.height;
        const aspect_ratio = img_height / img_width;

        let content_height = content_width * aspect_ratio;

        if (content_height > page_height - (margin * 2)) {
            content_height = page_height - (margin * 2);
            content_width = content_height / aspect_ratio;
        }

        const finalX = (page_width - content_width) / 2;
        const finalY = (page_height - content_height) / 2;
        
        pdf.addImage(imgData, 'PNG', finalX, finalY, content_width, content_height, undefined, 'FAST');
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
            <div className="bg-gray-200">
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
