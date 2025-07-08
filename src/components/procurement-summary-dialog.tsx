
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
import type { Procurement, Signature, ChecklistItem } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';

interface ProcurementSummaryDialogProps {
  procurement: Procurement;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PDFDocument = React.forwardRef<HTMLDivElement, { procurement: Procurement }>(({ procurement }, ref) => {
    
    const renderSignature = (signature: Signature | null) => {
        if (!signature || !signature.name) {
            return <div style={{ padding: '4px', height: '100%', boxSizing: 'border-box' }}></div>;
        }
        return (
            <div style={{ padding: '2px 4px', fontSize: '8px', textAlign: 'left', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', boxSizing: 'border-box' }}>
                <div>
                    <span>Name: </span>
                    <span style={{ fontWeight: '600' }}>{signature.name}</span>
                </div>
                <div style={{ flexGrow: 1, margin: '2px 0' }}>
                    <p style={{ margin: '0 0 1px 0' }}>Signature:</p>
                    {signature.signatureDataUrl && (
                        <div style={{ height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '1px 0' }}>
                             <img src={signature.signatureDataUrl} alt="Signature" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                        </div>
                    )}
                </div>
                <div>
                    <p style={{ margin: 0 }}>
                        <span>Date: </span>
                        <span style={{ fontWeight: '600' }}>{signature.date ? format(new Date(signature.date), 'MM/dd/yy') : ''}</span>
                    </p>
                    <p style={{ margin: 0, wordWrap: 'break-word', whiteSpace: 'pre-wrap' }}>
                        <span>Remarks: </span>
                        <span style={{ fontWeight: '600' }}>{signature.remarks}</span>
                    </p>
                </div>
            </div>
        );
    };
    
    const renderChecklist = (checklist: ChecklistItem[]) => {
        return (
            <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '9px', textAlign: 'left' }}>
                {checklist.map(item => (
                    <li key={item.id} style={{ padding: '1px 0', wordWrap: 'break-word' }}>
                        {item.checked ? '☑' : '☐'} {item.label}
                    </li>
                ))}
            </ul>
        );
    }

    const projectTypes: Procurement['projectType'][] = ['ILCDB-DWIA', 'SPARK', 'TECH4ED-DTC', 'PROJECT CLICK', 'OTHERS'];
    
    return (
        <div ref={ref} style={{ backgroundColor: 'white', color: 'black', padding: '16px', fontFamily: 'sans-serif' }}>
            <div style={{ width: '800px', margin: '0 auto' }}>
                 <header style={{ marginBottom: '4px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <tbody>
                            <tr>
                                <td style={{ width: '50px', textAlign: 'center' }}>
                                    <div style={{ border: '2px solid #1A237E', borderRadius: '50%', height: '40px', width: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                                        <p style={{ color: '#1A237E', fontWeight: 'bold', fontSize: '10px', margin: 0 }}>ILCDB</p>
                                    </div>
                                </td>
                                <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                    <p style={{ fontWeight: 'bold', fontSize: '11px', lineHeight: '1.1', margin: 0 }}>DIGITAL TRANSFORMATION CENTERS</p>
                                    <div style={{ backgroundColor: '#E53935', color: 'white', fontWeight: 'bold', fontSize: '10px', padding: '1px 4px', marginTop: '2px', display: 'inline-block' }}>TECH4ED</div>
                                </td>
                                <td style={{ width: '50px', textAlign: 'center' }}>
                                    <div style={{ border: '2px solid #FBC02D', borderRadius: '50%', height: '40px', width: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                                        <p style={{ color: '#FBC02D', fontWeight: 'bold', fontSize: '10px', margin: 0 }}>SPARK</p>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                 </header>

                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid black', fontSize: '10px', marginBottom: '6px' }}>
                    <tbody>
                        <tr>
                            <td style={{ border: '1px solid black', padding: '2px 4px', fontWeight: 'bold', width: '25%' }}>PROJECT</td>
                            <td style={{ border: '1px solid black', padding: '2px 4px' }} colSpan={3}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                    {projectTypes.map(pt => (
                                        <div key={pt} style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                            <span style={{ fontSize: '12px' }}>{procurement.projectType === pt ? '☑' : '☐'}</span>
                                            <label style={{ fontSize: '9px', fontWeight: '600' }}>{pt}</label>
                                        </div>
                                    ))}
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td style={{ border: '1px solid black', padding: '2px 4px', fontWeight: 'bold' }}>ACTIVITY / PROCUREMENT (SVP)</td>
                            <td style={{ border: '1px solid black', padding: '2px 4px', fontWeight: '600' }} colSpan={3}>{procurement.title}</td>
                        </tr>
                        <tr>
                            <td style={{ border: '1px solid black', padding: '2px 4px', fontWeight: 'bold' }}>AMOUNT</td>
                            <td style={{ border: '1px solid black', padding: '2px 4px', fontWeight: '600', width: '35%' }}>{formatCurrency(procurement.amount)}</td>
                            <td style={{ border: '1px solid black', padding: '2px 4px', fontWeight: 'bold', width: '15%' }}>PR NUMBER:</td>
                            <td style={{ border: '1px solid black', padding: '2px 4px', fontWeight: '600', width: '25%' }}>{procurement.prNumber}</td>
                        </tr>
                    </tbody>
                </table>
                
                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid black', fontSize: '10px' }}>
                     <thead>
                        <tr style={{ fontWeight: 'bold', backgroundColor: '#E0E0E0', fontSize: '9px' }}>
                            <td style={{ border: '1px solid black', padding: '3px', textAlign: 'center', width: '8%' }}>PHASE</td>
                            <td style={{ border: '1px solid black', padding: '3px', textAlign: 'center', width: '54%' }}>PARTICULARS</td>
                            <td style={{ border: '1px solid black', padding: '3px', textAlign: 'center', width: '19%' }}>SUBMITTED BY</td>
                            <td style={{ border: '1px solid black', padding: '3px', textAlign: 'center', width: '19%' }}>RECEIVED BY</td>
                        </tr>
                    </thead>
                    <tbody>
                         {procurement.phases.map((phase, index) => (
                            <React.Fragment key={phase.id}>
                                {index === 0 && (
                                    <tr>
                                        <td colSpan={4} style={{ border: '1px solid black', padding: '2px 4px', fontWeight: 'bold', textAlign: 'center', fontSize: '11px', backgroundColor: '#F5F5F5' }}>
                                            PRE-PROCUREMENT REQUIREMENTS
                                        </td>
                                    </tr>
                                )}
                                {index === 3 && (
                                     <tr>
                                        <td colSpan={4} style={{ border: '1px solid black', padding: '2px 4px', fontWeight: 'bold', textAlign: 'center', fontSize: '11px', backgroundColor: '#F5F5F5' }}>
                                            POST-PROCUREMENT REQUIREMENTS
                                        </td>
                                    </tr>
                                )}
                                <tr>
                                    <td style={{ border: '1px solid black', padding: '4px', fontWeight: 'bold', textAlign: 'center', verticalAlign: 'top' }}>{phase.id}</td>
                                    <td style={{ border: '1px solid black', padding: '4px', verticalAlign: 'top' }}>{renderChecklist(phase.checklist)}</td>
                                    <td style={{ border: '1px solid black', padding: '0', verticalAlign: 'top' }}>{renderSignature(phase.submittedBy)}</td>
                                    <td style={{ border: '1px solid black', padding: '0', verticalAlign: 'top' }}>{renderSignature(phase.receivedBy)}</td>
                                </tr>
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
                
                <footer style={{ marginTop: '8px', fontSize: '9px' }}>
                    <p>Procurement Number: 2025-___</p>
                </footer>
            </div>
        </div>
    );
});
PDFDocument.displayName = 'PDFDocument';


export function ProcurementSummaryDialog({ procurement, open, onOpenChange }: ProcurementSummaryDialogProps) {
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
        
        const marginX = 10;
        const marginY = 5;

        let content_width = page_width - (marginX * 2);
        
        const img_width = canvas.width;
        const img_height = canvas.height;
        const aspect_ratio = img_height / img_width;

        let content_height = content_width * aspect_ratio;

        if (content_height > page_height - (marginY * 2)) {
            content_height = page_height - (marginY * 2);
            content_width = content_height / aspect_ratio;
        }

        const finalX = (page_width - content_width) / 2;

        pdf.addImage(imgData, 'PNG', finalX, marginY, content_width, content_height, undefined, 'FAST');
        pdf.save(`procurement-summary-${procurement.prNumber}.pdf`);

    } catch (error) {
        console.error(`Error generating PDF:`, error);
    } finally {
        setIsDownloading(false);
    }
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-7xl">
        <DialogHeader>
          <DialogTitle>Procurement Process Summary</DialogTitle>
          <DialogDescription>
            A complete overview of the procurement process for {procurement.title}.
          </DialogDescription>
        </DialogHeader>
        
        <div className="max-h-[80vh] overflow-y-auto p-2 border rounded-md bg-muted">
            <div className="bg-gray-200">
                <PDFDocument ref={summaryRef} procurement={procurement} />
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
