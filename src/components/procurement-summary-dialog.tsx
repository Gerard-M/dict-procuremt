
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
        return (
            <div style={{ fontSize: '10px', textAlign: 'left', padding: '4px' }}>
                {checklist.map(item => (
                    <div key={item.id} style={{ padding: '1px 0', wordWrap: 'break-word', display: 'flex', alignItems: 'start' }}>
                        <span style={{ marginRight: '4px', minWidth: '12px' }}>{item.checked ? '☑' : '☐'}</span>
                        <span>{item.label}</span>
                    </div>
                ))}
            </div>
        );
    }
    
    const renderPhaseTable = (phases: Procurement['phases']) => {
        const tableHeader = (
            <thead>
                <tr style={{ fontWeight: 'bold', backgroundColor: '#E0E0E0', fontSize: '10px' }}>
                    <td style={{ border: '1px solid black', padding: '4px', textAlign: 'center', width: '10%' }}>PHASE</td>
                    <td style={{ border: '1px solid black', padding: '4px', textAlign: 'center', width: '40%' }}>PARTICULARS</td>
                    <td style={{ border: '1px solid black', padding: '4px', textAlign: 'center', width: '25%' }}>SUBMITTED BY</td>
                    <td style={{ border: '1px solid black', padding: '4px', textAlign: 'center', width: '25%' }}>RECEIVED BY</td>
                </tr>
            </thead>
        );

        return (
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid black', fontSize: '10px', tableLayout: 'fixed' }}>
                {tableHeader}
                <tbody>
                    {phases.map(phase => (
                        <tr key={phase.id}>
                            <td style={{ border: '1px solid black', padding: '4px', fontWeight: 'bold', textAlign: 'center', verticalAlign: 'top' }}>{phase.id}</td>
                            <td style={{ border: '1px solid black', padding: '0', verticalAlign: 'top' }}>{renderChecklist(phase.checklist)}</td>
                            <td style={{ border: '1px solid black', padding: '0', verticalAlign: 'top' }}>{renderSignature(phase.submittedBy)}</td>
                            <td style={{ border: '1px solid black', padding: '0', verticalAlign: 'top' }}>{renderSignature(phase.receivedBy)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    }

    const projectTypes: Procurement['projectType'][] = ['ILCDB-DWIA', 'SPARK', 'TECH4ED-DTC', 'PROJECT CLICK', 'OTHERS'];
    const preProcurementPhases = procurement.phases.slice(0, 3);
    const postProcurementPhases = procurement.phases.slice(3);
    
    return (
        <div ref={ref} style={{ backgroundColor: 'white', color: 'black', padding: '16px', fontFamily: 'sans-serif' }}>
            <div style={{ width: '800px', margin: '0 auto' }}>
                 <header style={{ marginBottom: '8px', border: '1px solid black', padding: '4px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <tbody>
                            <tr>
                                <td style={{ width: '60px', textAlign: 'center' }}>
                                    <div style={{ border: '2px solid #000080', borderRadius: '50%', height: '45px', width: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                                        <p style={{ color: '#000080', fontWeight: 'bold', fontSize: '10px', margin: 0 }}>ILCDB</p>
                                    </div>
                                </td>
                                <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                    <p style={{ fontWeight: 'bold', fontSize: '12px', lineHeight: '1.2', margin: 0 }}>DIGITAL TRANSFORMATION CENTERS</p>
                                    <div style={{ backgroundColor: '#E53935', color: 'white', fontWeight: 'bold', fontSize: '10px', padding: '1px 6px', marginTop: '2px', display: 'inline-block' }}>TECH4ED</div>
                                </td>
                                <td style={{ width: '60px', textAlign: 'center' }}>
                                    <div style={{ border: '2px solid #FBC02D', borderRadius: '50%', height: '45px', width: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                                        <p style={{ color: '#FBC02D', fontWeight: 'bold', fontSize: '10px', margin: 0 }}>SPARK</p>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                 </header>

                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid black', fontSize: '10px', marginBottom: '8px' }}>
                    <tbody>
                        <tr>
                            <td style={{ border: '1px solid black', padding: '4px', fontWeight: 'bold', width: '25%' }}>PROJECT</td>
                            <td style={{ border: '1px solid black', padding: '4px' }} colSpan={3}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                                    {projectTypes.map(pt => (
                                        <div key={pt} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <span style={{ fontSize: '12px' }}>{procurement.projectType === pt ? '☑' : '☐'}</span>
                                            <label style={{ fontSize: '10px', fontWeight: '600' }}>{pt}</label>
                                        </div>
                                    ))}
                                    {procurement.projectType === 'OTHERS' && <span style={{fontSize: '10px'}}>: {procurement.otherProjectType}</span>}
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td style={{ border: '1px solid black', padding: '4px', fontWeight: 'bold' }}>ACTIVITY / PROCUREMENT (SVP)</td>
                            <td style={{ border: '1px solid black', padding: '4px', fontWeight: '600' }} colSpan={3}>{procurement.title}</td>
                        </tr>
                        <tr>
                            <td style={{ border: '1px solid black', padding: '4px', fontWeight: 'bold' }}>AMOUNT</td>
                            <td style={{ border: '1px solid black', padding: '4px', fontWeight: '600', width: '35%' }}>{formatCurrency(procurement.amount)}</td>
                            <td style={{ border: '1px solid black', padding: '4px', fontWeight: 'bold', width: '15%' }}>PR NUMBER:</td>
                            <td style={{ border: '1px solid black', padding: '4px', fontWeight: '600', width: '25%' }}>{procurement.prNumber}</td>
                        </tr>
                    </tbody>
                </table>
                
                <h3 style={{ border: '1px solid black', padding: '3px 4px', fontWeight: 'bold', textAlign: 'center', fontSize: '11px', backgroundColor: '#F5F5F5', margin: '8px 0 8px 0' }}>
                    PRE-PROCUREMENT REQUIREMENTS
                </h3>
                {renderPhaseTable(preProcurementPhases)}
                
                <h3 style={{ border: '1px solid black', padding: '3px 4px', fontWeight: 'bold', textAlign: 'center', fontSize: '11px', backgroundColor: '#F5F5F5', margin: '16px 0 8px 0' }}>
                    POST-PROCUREMENT REQUIREMENTS
                </h3>
                {renderPhaseTable(postProcurementPhases)}
                
                <footer style={{ marginTop: '8px', fontSize: '10px', textAlign: 'left' }}>
                    <p style={{margin: 0}}>Procurement Number: 2025-___</p>
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
        
        const margin = 10;
        const content_width = page_width - (margin * 2);
        const content_height = page_height - (margin * 2);
        
        const img_width = canvas.width;
        const img_height = canvas.height;
        const aspect_ratio = img_height / img_width;

        let final_width = content_width;
        let final_height = content_width * aspect_ratio;

        if (final_height > content_height) {
            final_height = content_height;
            final_width = final_height / aspect_ratio;
        }

        const finalX = (page_width - final_width) / 2;
        const finalY = (page_height - final_height) / 2;

        pdf.addImage(imgData, 'PNG', finalX, finalY, final_width, final_height, undefined, 'FAST');
        pdf.save(`procurement-summary-${procurement.prNumber}.pdf`);

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
