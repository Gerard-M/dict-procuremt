
'use client';

import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
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
  isForExport?: boolean;
}

const PDFDocument = React.forwardRef<HTMLDivElement, { travelVoucher: TravelVoucher, isForExport?: boolean }>(({ travelVoucher, isForExport }, ref) => {
    
    const renderSignature = (signature: Signature | null) => {
        if (!signature || !signature.name) {
            return <div style={{ height: '100%', boxSizing: 'border-box', padding: '8px' }}></div>;
        }
        return (
            <div style={{ padding: '8px', fontSize: '9px', textAlign: 'left', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', boxSizing: 'border-box' }}>
                <div style={{ wordWrap: 'break-word', boxSizing: 'border-box' }}>
                    <span>Name: </span>
                    <span style={{ fontWeight: '600' }}>{signature.name}</span>
                </div>
                <div style={{ flexGrow: 1, margin: '4px 0', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
                    <span style={{ marginBottom: '2px' }}>Signature:</span>
                    {signature.signatureDataUrl && (
                        <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box' }}>
                             <img src={signature.signatureDataUrl} alt="Signature" style={{ maxHeight: '35px', maxWidth: '100%', objectFit: 'contain' }} />
                        </div>
                    )}
                </div>
                <div style={{boxSizing: 'border-box'}}>
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
            return <p style={{ fontSize: '10px', textAlign: 'left', color: '#666', padding: '8px', boxSizing: 'border-box' }}>No items checked.</p>;
        }

        return (
             <div style={{ fontSize: '10px', textAlign: 'left', padding: '8px', boxSizing: 'border-box' }}>
                {checkedItems.map(item => (
                    <div key={item.id} style={{ padding: '2px 0', display: 'flex', alignItems: 'start', gap: '4px', boxSizing: 'border-box' }}>
                        <span style={{flexShrink: 0}}>☑</span>
                        <span>{item.label}</span>
                    </div>
                ))}
            </div>
        );
    }

    const { phase } = travelVoucher;

    return (
        <div ref={ref} style={{ backgroundColor: 'white', color: 'black', fontFamily: 'sans-serif', width: '8.27in', height: '11.69in', padding: '0.25in', boxSizing: 'border-box' }}>
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', paddingBottom: '0.25in', boxSizing: 'border-box' }}>
                 <header style={{ textAlign: 'center', marginBottom: '32px', width: '100%' }}>
                    <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1A237E', margin: 0 }}>Travel Voucher Summary</h1>
                    <p style={{ fontSize: '12px', color: '#666', marginTop: '4px', margin: 0 }}>Generated on {format(new Date(), 'PPP')}</p>
                 </header>

                <table style={{ width: '95%', borderCollapse: 'collapse', border: '1px solid black', fontSize: '12px', marginBottom: '24px', margin: '0 auto' }}>
                    <tbody>
                         <tr>
                            <td style={{ border: '1px solid black', padding: '8px', fontWeight: 'bold', backgroundColor: '#F5F5F5', width: '30%', verticalAlign: 'middle', boxSizing: 'border-box' }}><div style={{position: 'relative', top: isForExport ? '-2px' : '0px'}}>ACTIVITY / PROGRAM</div></td>
                            <td style={{ border: '1px solid black', padding: '8px', fontWeight: '600', verticalAlign: 'middle', boxSizing: 'border-box' }}><div style={{position: 'relative', top: isForExport ? '-2px' : '0px'}}>{travelVoucher.activityTitle}</div></td>
                        </tr>
                        <tr>
                            <td style={{ border: '1px solid black', padding: '8px', fontWeight: 'bold', backgroundColor: '#F5F5F5', verticalAlign: 'middle', boxSizing: 'border-box' }}><div style={{position: 'relative', top: isForExport ? '-2px' : '0px'}}>AMOUNT</div></td>
                            <td style={{ border: '1px solid black', padding: '8px', fontWeight: '600', verticalAlign: 'middle', boxSizing: 'border-box' }}><div style={{position: 'relative', top: isForExport ? '-2px' : '0px'}}>{formatCurrency(travelVoucher.amount)}</div></td>
                        </tr>
                    </tbody>
                </table>

                <h2 style={{ width: '95%', fontSize: '16px', fontWeight: 'bold', color: '#1A237E', marginBottom: '16px', margin: '16px auto 0' }}>Processing Details</h2>
                <table style={{ width: '95%', borderCollapse: 'collapse', border: '1px solid black', fontSize: '12px', tableLayout: 'fixed', margin: '0 auto' }}>
                     <thead>
                        <tr style={{ fontWeight: 'bold', backgroundColor: '#E0E0E0' }}>
                            <td style={{ border: '1px solid black', padding: '8px', textAlign: 'center', fontSize: '11px', width: '50%', verticalAlign: 'middle', boxSizing: 'border-box' }}><div style={{position: 'relative', top: isForExport ? '-2px' : '0px'}}>CHECKLIST (Completed Items)</div></td>
                            <td style={{ border: '1px solid black', padding: '8px', textAlign: 'center', fontSize: '11px', width: '25%', verticalAlign: 'middle', boxSizing: 'border-box' }}><div style={{position: 'relative', top: isForExport ? '-2px' : '0px'}}>SUBMITTED BY</div></td>
                            <td style={{ border: '1px solid black', padding: '8px', textAlign: 'center', fontSize: '11px', width: '25%', verticalAlign: 'middle', boxSizing: 'border-box' }}><div style={{position: 'relative', top: isForExport ? '-2px' : '0px'}}>RECEIVED BY</div></td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style={{ border: '1px solid black', padding: '0', verticalAlign: 'top', boxSizing: 'border-box' }}>{renderChecklist(phase.checklist)}</td>
                            <td style={{ border: '1px solid black', padding: '0', verticalAlign: 'top', boxSizing: 'border-box' }}>{renderSignature(phase.submittedBy)}</td>
                            <td style={{ border: '1px solid black', padding: '0', verticalAlign: 'top', boxSizing: 'border-box' }}>{renderSignature(phase.receivedBy)}</td>
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
  const [isExporting, setIsExporting] = React.useState(false);

  const handleDownloadPdf = async () => {
    setIsExporting(true);
    setIsDownloading(true);

    await new Promise(resolve => setTimeout(resolve, 50));
    
    const printArea = summaryRef.current;
    if (!printArea) {
        setIsDownloading(false);
        setIsExporting(false);
        return;
    };

    try {
        const canvas = await html2canvas(printArea, {
            useCORS: true,
            backgroundColor: '#ffffff',
            scale: 2,
            width: printArea.scrollWidth,
            height: printArea.scrollHeight,
        });

        const imgData = canvas.toDataURL('image/png');
        
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'in',
          format: 'a4'
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;

        const pageHeightInCanvas = (canvasWidth / pdfWidth) * pdfHeight;
        
        let position = 0;
        while (position < canvasHeight) {
            const pageCanvas = document.createElement('canvas');
            pageCanvas.width = canvasWidth;
            pageCanvas.height = pageHeightInCanvas;
            const pageCtx = pageCanvas.getContext('2d');
            if (pageCtx) {
                pageCtx.drawImage(canvas, 0, position, canvasWidth, pageHeightInCanvas, 0, 0, canvasWidth, pageHeightInCanvas);
                const pageImgData = pageCanvas.toDataURL('image/png');
                if (position > 0) {
                    pdf.addPage();
                }
                pdf.addImage(pageImgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            }
            position += pageHeightInCanvas;
        }

        pdf.save(`travel-voucher-summary-${travelVoucher.activityTitle.replace(/\s/g, '_')}.pdf`);

    } catch (error) {
        console.error(`Error generating PDF:`, error);
    } finally {
        setIsDownloading(false);
        setIsExporting(false);
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
            <div className="bg-white">
                <PDFDocument ref={summaryRef} travelVoucher={travelVoucher} isForExport={isExporting} />
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

    

    